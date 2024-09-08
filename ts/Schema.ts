// order is not guaranteed when iterating keys in object so shouldn't use json, but fuck it
export const schemaDefinition = {
    "Vertex": {
        "x": "i64",
        "y": "i64",
        "prevX": "i64",
        "prevY": "i64",
        "accX": "i64",
        "accY": "i64",
        "radius": "i64",
        "mass": "i64",
        "collidable": "u32",
        "type": "u32"
    },
    "Edge": {
        "length": "i64",
        "stiffness": "i64",
        "damping": "i64",
        "minLength": "i64",
        "maxLength": "i64",
        "totalMass": "i64",
        "visible": "u32",
        "v1Idx": "u32",
        "v2Idx": "u32"
    },
    "Rider": {
        "frontWheelIdx": "u32",
        "backWheelIdx": "u32",
        "bikeFootIdx": "u32",
        "chainIdx": "u32",
        "stearingIdx": "u32",
        "buttIdx": "u32",
        "vertices": "VertexArray",
        "edges": "EdgeArray",
        "startVertices": "VertexArray",
        "startEdges": "EdgeArray",
        "leanForwardsEdgeLengths": "i64Array",
        "leanBackwardsEdgeLengths": "i64Array",
        "riderEdgesIndex": "u32",
        "riderEdgesCount": "u32",
    },
    "Line": {
        "x1": "i64",
        "y1": "i64",
        "x2": "i64",
        "y2": "i64"
    },
    "Circle": {
        "x": "i64",
        "y": "i64",
        "radius": "i64"
    },
    "Checkpoint": {
        "x": "i64",
        "y": "i64",
        "passed": "u32"
    },
    "Level": {
        "lines": "LineArray",
        "circles": "CircleArray",
        "checkpoints": "CheckpointArray"
    },
    "TrialsGame": {
        "state": "u32",
        "tries": "u32",
        "currentCheckpoint": "u32",
        "tickIdx": "u32",
    },
}

export type Type = {
    name: string,
    fields: {
        [key: string]: Field
    },
    size: number,
    isPrimitive?: boolean,
    arrayType?: Type,
    arrayTypeName?: string,
}

export type Field = {
    name: string,
    type: Type,
    typeName: string,
    offset: number,
}

export type Schema = {
    [key: string]: Type
}

export function createSchema(schema: any): Schema {
    let types = {
        "u32": {name: "u32", fields: {}, size: 4, isPrimitive: true}, 
        "i64": {name: "i64", fields: {}, size: 8, isPrimitive: true}, 
        "bool": {name: "bool", fields: {}, size: 4, isPrimitive: true},
    };
    let customTypes = Object.keys(schema).filter((key) => !["u32", "i64", "bool"].includes(key));
    
    let arrays = [];
    let allFields = [];
    for (let schemaTypeName in schema) {
        let schemaType = schema[schemaTypeName];
        let fields = {};
        for (let schemaFieldName in schemaType) {
            let schemaFieldTypeName = schemaType[schemaFieldName];
            fields[schemaFieldName] = {name: schemaFieldName, type: null, typeName: schemaFieldTypeName, offset: 0};
            if (schemaFieldTypeName.endsWith("Array")) {
                types[schemaFieldTypeName] = {name: schemaFieldTypeName, fields: {}, size: 8, arrayType: null, arrayTypeName: schemaFieldTypeName.replace("Array", "")};
                arrays.push(types[schemaFieldTypeName]);
            }
        }

        types[schemaTypeName] = {name: schemaTypeName, fields: fields, size: null};
        allFields.push(...Object.values(fields));
    }
    arrays.forEach((array) => {array.arrayType = types[array.arrayTypeName]});
    allFields.forEach((field) => {field.type = types[field.typeName]});

    let calculateOffsetAndSize = (type) => {
        if (type.size == -1) {
            throw new Error("Cyclic type definition");
        }
        if (type.size != null) {
            return type.size;
        }
        type.size = -1;
        let offset = 0;
        for (let field of Object.values(type.fields) as Field[]) {
            field.offset = offset;
            if (field.type.name.endsWith("Array")) {
                offset += 8;
            } else {
                offset += calculateOffsetAndSize(types[field.type.name]);
            }
        }
        type.size = offset;
        return offset;
    }

    for (let type of Object.values(types)) {
        calculateOffsetAndSize(type);
    }

    return types;
}


export class FlatUtil {

    constructor(public schema: Schema, public dataView, public ptr) {
    }

    getUint32(objectOffset: number, type: string, field: string): number {
        let feildOffset = this.schema[type].fields[field].offset;
        return this.dataView.getUint32(this.ptr + objectOffset + feildOffset, true);
    }
    
    getInt64(objectOffset: number, type: string, field: string): BigInt  {
        let fieldOffset = this.schema[type].fields[field].offset;
        return this.dataView.getBigInt64(this.ptr + objectOffset + fieldOffset, true);
    }
    
    getFp(objectOffset: number, type: string, field: string): number {
        let fieldOffset = this.schema[type].fields[field].offset;
        return Number(this.dataView.getBigInt64(this.ptr + objectOffset + fieldOffset, true)) / (1 << 8);
    }

    getBool(objectOffset: number, type: string, field: string): boolean {
        let fieldOffset = this.schema[type].fields[field].offset;
        return this.dataView.getUin32(this.ptr + objectOffset + fieldOffset, true) != 0;
    }

    getArray(objectOffset: number, type: string, field: string): [number, number] {
        let fieldOffset = this.schema[type].fields[field].offset;
        let arrayPtr = this.dataView.getUint32(this.ptr + objectOffset + fieldOffset, true);
        let length = this.dataView.getUint32(this.ptr + objectOffset + fieldOffset + 4, true);
        return [arrayPtr, length];
    }

    getFpAt(arrayOffset: number, type: string, field: string, index: number): number {
        let elementOffset = arrayOffset + this.schema[type].size * index;
        let fieldOffset = this.schema[type].fields[field].offset;
        return Number(this.dataView.getBigInt64(this.ptr + elementOffset + fieldOffset, true)) / (1 << 8);
    }

    getObject(objectOffset: number, type: string, field: string): number {
        return this.ptr + objectOffset + this.schema[type].fields[field].offset;
    }
}


export class Builder {
    offset = 0;
    BITS = 8;

    constructor(public schema: Schema, entryType, public dataView) {
        this.schema = schema;
        this.dataView = dataView;
        this.offset = schema[entryType].size;
    }

    setUint32(ptr: number, type: string, field: string, value: number) {
        try {
            let offset = this.schema[type].fields[field].offset;
            this.dataView.setUint32(ptr + offset, value, true);
        } catch (e) {
            console.error("GameStruct.setUin32", type, field);
        }
    }

    setBigInt64(ptr: number, type: string, field: string, value: number) {
        let offset = this.schema[type].fields[field].offset;
        this.dataView.setBigInt64(ptr + offset, value, true);
    }

    setFp(ptr: number, type: string, field: string, value: number) {
        let offset = this.schema[type].fields[field].offset;
        this.setFpAt(ptr + offset, value);
    }

    setFpAt(ptr: number, value: number) {
        this.dataView.setBigInt64(ptr, BigInt(Math.round(value * (1 << this.BITS))), true);
    }

    setArray(ptr: number, type: string, field: string, array): [number, number] {
        let offset = this.schema[type].fields[field].offset;
        this.dataView.setUint32(ptr + offset, array[0], true);
        this.dataView.setUint32(ptr + offset + 4, array[1], true);
        return array;
    }

    getArrayElement(ptr: number, type: string, index: number): number {
        return ptr + this.schema[type].size * index;
    }

    createArray(type: string, length: number): [number, number] {
        let ptr = this.offset;
        this.offset += this.schema[type].size * length;
        return [ptr, length];
    }

    copy(srcPtr: number, destPtr: number, length: number) {
        let srcArray = new Uint8Array(this.dataView.buffer, srcPtr, length);
        let destArray = new Uint8Array(this.dataView.buffer, destPtr, length);
        destArray.set(srcArray);
    }
}

// let assemblyscriptCode = generateAssemblyScript(createSchema(schemaDefinition));
// console.log("aaaaaaaaaaaa\n", assemblyscriptCode);
// console.log("aaaaaabbbbbaa\n", generateCCode(createSchema(schemaDefinition)));
// console.log("aaaaaa\n", generateJavaScriptCode(createSchema(schemaDefinition)));
 