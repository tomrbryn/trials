import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createSchema, schemaDefinition, type Schema } from './Schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.argv[1] === __filename) {
    let schema = createSchema(schemaDefinition);
    let tsCode = generateTypeScriptCode(schema);
    console.log(tsCode);
    fs.writeFileSync(__dirname + "/GameStructGeneratedCode.ts", tsCode);

    let cCode = generateCCode(schema);
    fs.writeFileSync(path.resolve(__dirname, "../c/GameStructGeneratedCode.c"), cCode);
}

function generateTypeScriptCode(schema: Schema): string {
    let code = "";
    for (let type of Object.values(schema)) {
        if (type.isPrimitive) {
            continue;
        }
        code += 
`export class ${type.name} {

    static SIZE = ${type.size};

    constructor(public dataView: DataView, public ptr: number = 0) {
    }
`;
        if (type.name.endsWith("Array") && type.arrayType != null) {
            let arrayTypeSize = type.arrayType.size;
            code += 
`
    getOffset(): number {
        return this.dataView.getUint32(this.ptr, true);
    }

    getLength(): number {
        return this.dataView.getUint32(this.ptr + 4, true);
    }

    get(i: number): ${type.arrayTypeName} {
        return new ${type.arrayTypeName}(this.dataView, this.getOffset() + i * ${arrayTypeSize});
    }
`;
        }

        let getCastMap = {
            "u32": (v) => `Number(${v})`,
            "i64": (v) => `Number(${v} / 256n)`,
            "bool": (v) => `${v} != 0 ? true : false)`,
        }
        let dataViewMap = {
            "u32": "Uint32",
            "i64": "BigInt64",
            "bool": "Uint32",
        }
        let tsTypeMap = {
            "u32": "number",
            "i64": "number",
            "bool": "boolean",
        }

        for (let field of Object.values(type.fields)) {
            if (dataViewMap[field.type.name] != null) {
                code +=
`
    set${field.name.charAt(0).toUpperCase() + field.name.slice(1)}(newValue: ${tsTypeMap[field.type.name]}) {
        this.dataView.set${dataViewMap[field.type.name]}(this.ptr + ${field.offset}, newValue, true);
    }

    get${field.name.charAt(0).toUpperCase() + field.name.slice(1)}(): ${tsTypeMap[field.type.name]} {
        return ${getCastMap[field.type.name](`this.dataView.get${dataViewMap[field.type.name]}(this.ptr + ${field.offset}, true)`)};
    }
`;
            } else if (field.type.name.endsWith("Array")) {
                code +=
`
    get${field.name.charAt(0).toUpperCase() + field.name.slice(1)}(): ${field.type.name} {
        return new ${field.type.name}(this.dataView, this.ptr + ${field.offset});
    }
`;
            } else if (!field.type.isPrimitive) {
                code += 
`
    get${field.name.charAt(0).toUpperCase() + field.name.slice(1)}() {
        return new ${field.type.name}(this.dataView, this.ptr + ${field.offset});
    }
`;
            } else {
                console.log("unhandled field", JSON.stringify(field, null, 2));
            }
        }
        code += "}\n\n"
    }
    return code;
}

function generateCCode(schema: Schema): string {
    let typeMap = {
        "u32": "uint32_t",
        "i64": "int64_t",
        "bool": "uint32_t",
    }
    let code = ``;
    for (let type of Object.values(schema)) {
        if (!type.isPrimitive && !type.name.endsWith("Array")) {
            code += `uint32_t ${type.name}Stride = ${type.size};\n`;
        }
    }
    code += `\n`;

    for (let type of Object.values(schema)) {
        if (type.isPrimitive || type.name.endsWith("Array")) {
            continue;
        }
        code += `typedef struct {\n`;
        let arrayCode = "";
        for (let field of Object.values(type.fields)) {
            if (field.type.name.endsWith("Array") && field.type.arrayType != null) {
                code += `    uint32_t ${field.name}Offset;\n`;
                code += `    uint32_t ${field.name}Length;\n`;
                let singleName = field.name.substring(0, field.name.length - 1);
                // int64_t leanForwardsEdgeLengthAt(uint32_t index) {
                //     return (int64_t)*(dataPtr + g->leanForwardsEdgeLengthsOffset + index * 8);
                // }
                                
                let typeName = typeMap[field.type.arrayType.name] || field.type.arrayType.name;
                if (field.type.arrayType.isPrimitive) {
                    arrayCode +=
                //    *((int64_t*)(dataPtr + 8372));                    
`${typeName} ${type.name}${singleName}At(uint32_t index) {
    return *(${typeName}*)(dataPtr + g->${field.name}Offset + index * ${field.type.arrayType.size});
}
`;

                } else {
                    arrayCode +=
`${typeName}* ${type.name}${singleName}At(uint32_t index) {
    return (${typeName}*)(dataPtr + g->${field.name}Offset + index * ${field.type.arrayType.size});
}
`;
    
                }

            } else {
                let typeStr = typeMap[field.type.name];
                if (typeStr) {
                    code += 
`    ${typeStr} ${field.name};\n`;
                }

                
            }
        }

        code += `} ${type.name};\n\n`;
        // code += arrayCode;
    }
    return code;
}
