import { Rider } from "./GameStructGeneratedCode";
import { Builder } from "./Schema";
import { Vertex as VertexStruct, Edge as EdgeStruct } from "./GameStructGeneratedCode";

export const TYPE_UNKNOWN = 0;
export const TYPE_RIDER = 1;
export const TYPE_BACK_WHEEL = 2;
export const TYPE_FRONT_WHEEL = 3;

function seededRandom(seed: number): () => number {
    // Parameters for the LCG
    const a = 1664525;
    const c = 1013904223;
    const m = 2 ** 32;

    // Create the LCG function
    return function(): number {
        // Update the seed using the LCG formula
        seed = (a * seed + c) % m;
        
        // Return a float between 0 and 1
        return seed / m;
    };
}    

class Tuple {
    x = 0;
    y = 0;
}

class Vertex {
    pos = new Tuple();
    old = new Tuple(); 
    acc = new Tuple(); 
    radius = 0; 
    mass = 1; 
    collidable = false;
    type = TYPE_UNKNOWN;

    update() {
        const tempX = this.pos.x;
        const tempY = this.pos.y;
        this.pos.x += this.pos.x - this.old.x + this.acc.x;
        this.pos.y += this.pos.y - this.old.y + this.acc.y;
        this.old.x = tempX;
        this.old.y = tempY;
    }

    static lineLength(v1: Vertex, v2: Vertex) {
        const dx = v1.pos.x - v2.pos.x;
        const dy = v1.pos.y - v2.pos.y;
        return Math.sqrt((dx * dx) + (dy * dy));
    }
}

class Edge {
    length = 0;
    stiffness = 0;
    damping = 0;
    minLength = 0;
    maxLength = 0;
    totalMass = 0;
    visible = false;
    // maps into vertices
    v1Idx = 0;
    v2Idx = 0;
}

function createVertex(x, y, radius, type = TYPE_UNKNOWN): Vertex {
    const v = new Vertex();
    v.pos.x = x;
    v.pos.y = y;
    v.old.x = x;
    v.old.y = y;
    v.radius = radius;
    v.mass = Math.PI * radius * radius;
    v.collidable = true;
    v.type = type;
    return v;
}


function createEdge(globalVs, v1, v2, stiffness, damping) {   
    const edge = new Edge();
    edge.stiffness = stiffness;
    edge.damping = damping;
    edge.v1Idx = globalVs.indexOf(v1);
    edge.v2Idx = globalVs.indexOf(v2);
    edge.length = Vertex.lineLength(v1, v2);
    edge.totalMass = v1.mass + v2.mass;
    edge.maxLength = 100000;
    edge.visible = true;
    return edge;
}

function createEdges(globalVs: Vertex[], vs: Vertex[], stiffness: number): Edge[] {
    const edges: Edge[] = [];
    for (let i = 0; i < vs.length; i++) {
        for (let j = i + 1; j < vs.length; j++) {
            edges.push(createEdge(globalVs, vs[i], vs[j], stiffness, 0));
        }
    }
    return edges;
}

export class RiderCreator {
    vertices: Vertex[] = [];
    edges: Edge[] = [];
    leanForwardsEdgeLengths: number[] = [];
    leanBackwardsEdgeLengths: number[] = [];
    riderEdgesIndex = 0;
    riderEdgesCount = 0;
    backWheelIdx = 0;
    frontWheelIdx = 0;
    bikeFootIdx = 0;
    chainIdx = 0;
    stearingIdx = 0;
    buttIdx = 0;


    create() {
        // -------------- create bike ----------------
        this.backWheelIdx = this.createWheel(48, 125, 38, 8, TYPE_BACK_WHEEL);
        this.frontWheelIdx = this.createWheel(223, 125, 38, 8, TYPE_BACK_WHEEL);
        const backWheel = this.vertices[this.backWheelIdx];
        const frontWheel = this.vertices[this.frontWheelIdx];
        let stearing = createVertex(176, 19, 10); // stearing
        let bikeFoot = createVertex(101, 114, 10); // foot
        let chain = createVertex(125, 113, 13); // chain front center
        let engine = createVertex(125, 33, 15);
        const round = createVertex(144, 116, 11); //
        const skjerm = createVertex(70, 59, 8); // back skjerm
        let vs = [stearing, bikeFoot, chain, round, skjerm, engine];
        this.bikeFootIdx = this.vertices.length + vs.indexOf(bikeFoot);
        this.chainIdx = this.vertices.length + vs.indexOf(chain);
        this.stearingIdx = this.vertices.length + vs.indexOf(stearing);
        for (let vsIdx=0; vsIdx < vs.length; vsIdx++) {
            this.vertices.push(vs[vsIdx]);
        }

        const hard = 1;
        this.addRandomEdges(createEdges(this.vertices, vs, hard));

        const frontSpring = createEdge(this.vertices, frontWheel, stearing,  0.15, 0);
        frontSpring.damping = 0.05;
        frontSpring.maxLength = 120;//116;
        frontSpring.minLength = 90;
        frontSpring.length = 120;
        this.addRandom(frontSpring);
        this.addRandom(createEdge(this.vertices, frontWheel, chain, hard, 0));
        this.addRandom(createEdge(this.vertices, frontWheel, chain, hard, 0));
        this.addRandom(createEdge(this.vertices, frontWheel, chain, hard, 0));
        this.addRandom(createEdge(this.vertices, backWheel, chain, hard, 0));
        this.addRandom(createEdge(this.vertices, backWheel, chain, hard, 0));
        this.addRandom(createEdge(this.vertices, backWheel, chain, hard, 0));
        const e = createEdge(this.vertices, backWheel, skjerm, .12, 0);
        e.maxLength = 70;//69;
        e.minLength = 50;
        e.damping = 0.05;
        this.addRandom(e);
        this.addRandom(e);

        // ------------- create rider ------------------
        let knee = createVertex(130, 80, 11, TYPE_RIDER);
        let butt = createVertex(95, 50, 15, TYPE_RIDER);
        let shoulders = createVertex(137, 15, 15, TYPE_RIDER);
        let head = createVertex(150, -10, 10, TYPE_RIDER);
        let foot = createVertex(100, 114, 10, TYPE_RIDER);
        foot.collidable = false;
        let hands = createVertex(175, 19, 10, TYPE_RIDER);

        let knee2 = createVertex(130, 80, 11, TYPE_RIDER);
        let butt2 = createVertex(130, 20, 15, TYPE_RIDER);
        let shoulders2 = createVertex(175, -20, 15, TYPE_RIDER);
        let head2 = createVertex(190, -45, 10, TYPE_RIDER);
        let foot2 = createVertex(100, 114, 10, TYPE_RIDER);
        foot2.collidable = false;
        let hands2 = createVertex(175, 19, 10, TYPE_RIDER);

        let riderVertices = [knee, butt, shoulders, head, foot, hands];
        this.buttIdx = this.vertices.length + riderVertices.indexOf(butt);

        for (let i=0; i < riderVertices.length; i++) {
            this.vertices.push(riderVertices[i]);
        }
        riderVertices.push(stearing);
        riderVertices.push(bikeFoot);
        // riderVertices.push(skjerm);
        // riderVertices.push(engine);

        
        let vs2: Vertex[] = [knee2, butt2, shoulders2, head2, foot2, hands2, stearing, bikeFoot/*, skjerm, engine*/];

        this.leanForwardsEdgeLengths = createEdges(this.vertices, riderVertices, 0.9).map(e => e.length);
        let riderEdges = createEdges(this.vertices, riderVertices, 0.9);
        this.leanBackwardsEdgeLengths = createEdges(vs2, vs2, 0.9).map(e => e.length);
        this.riderEdgesIndex = this.edges.length;
        this.riderEdgesCount = riderEdges.length;
        this.addEdges(riderEdges);
    }

    createWheel(x: number, y: number, radius: number, tireRadius: number, type: number): number {
        const wheel = createVertex(x, y, radius + tireRadius, type);
        wheel.mass = 500;
        wheel.old.x = wheel.pos.x;
        return this.vertices.push(wheel) - 1;
    }
    
    addEdges(edges: Edge[]) {
        this.edges.push(...edges);
    }

    addRandomEdges(edges: Edge[]) {
        for (let i = 0; i < edges.length; i++) {
            this.addRandom(edges[i]);
        }
    }

    addRandom(edge: Edge) {
        let random = seededRandom(123456);
        let idx = Math.floor(random() * this.edges.length);
        this.edges.splice(idx, 0, edge);
    }

    applyToBuilder(b: Builder) {

        b.setUint32(0, "Rider", "riderEdgesIndex", this.riderEdgesIndex);
        b.setUint32(0, "Rider", "riderEdgesCount", this.riderEdgesCount);
        b.setUint32(0, "Rider", "backWheelIdx", this.backWheelIdx);
        b.setUint32(0, "Rider", "frontWheelIdx", this.frontWheelIdx);
        b.setUint32(0, "Rider", "bikeFootIdx", this.bikeFootIdx);
        b.setUint32(0, "Rider", "chainIdx", this.chainIdx);
        b.setUint32(0, "Rider", "stearingIdx", this.stearingIdx);
        b.setUint32(0, "Rider", "buttIdx", this.buttIdx);
        let [verticesPtr, verticesLength] = b.setArray(0, "Rider", "vertices", b.createArray("Vertex", this.vertices.length));
        for (let i = 0; i < this.vertices.length; i++) {
            let vertexPtr = b.getArrayElement(verticesPtr, "Vertex", i);
            b.setFp(vertexPtr, "Vertex", "x", this.vertices[i].pos.x);
            b.setFp(vertexPtr, "Vertex", "y", this.vertices[i].pos.y);
            b.setFp(vertexPtr, "Vertex", "radius", this.vertices[i].radius);
            b.setFp(vertexPtr, "Vertex", "mass", this.vertices[i].mass);
            b.setUint32(vertexPtr, "Vertex", "collidable", this.vertices[i].collidable ? 1 : 0);
            b.setUint32(vertexPtr, "Vertex", "type", this.vertices[i].type);
        }
        let [startVerticesPtr, startVerticesLength] = b.setArray(0, "Rider", "startVertices", b.createArray("Vertex", this.vertices.length));
        b.copy(verticesPtr, startVerticesPtr, startVerticesLength * VertexStruct.SIZE);
        let [edgesPtr, edgesLength] = b.setArray(0, "Rider", "edges", b.createArray("Edge", this.edges.length));
        for (let i = 0; i < this.edges.length; i++) {
            let edge = b.getArrayElement(edgesPtr, "Edge", i);
            b.setFp(edge, "Edge", "length", this.edges[i].length);
            b.setFp(edge, "Edge", "stiffness", this.edges[i].stiffness);
            b.setFp(edge, "Edge", "damping", this.edges[i].damping);
            b.setFp(edge, "Edge", "minLength", this.edges[i].minLength);
            b.setFp(edge, "Edge", "maxLength", this.edges[i].maxLength);
            b.setFp(edge, "Edge", "totalMass", this.edges[i].totalMass);
            b.setUint32(edge, "Edge", "visible", this.edges[i].visible ? 1 : 0);
            b.setUint32(edge, "Edge", "v1Idx", this.edges[i].v1Idx);
            b.setUint32(edge, "Edge", "v2Idx", this.edges[i].v2Idx);
        }
        let [startEdgesPtr, startEdgesLength] = b.setArray(0, "Rider", "startEdges", b.createArray("Edge", this.edges.length));
        b.copy(edgesPtr, startEdgesPtr, edgesLength * EdgeStruct.SIZE);
        let [forwardsPtr, forwardsLength] = b.setArray(0, "Rider", "leanForwardsEdgeLengths", b.createArray("i64", this.leanForwardsEdgeLengths.length));
        for (let i = 0; i < this.leanForwardsEdgeLengths.length; i++) {
            b.setFpAt(forwardsPtr + i * 8, this.leanForwardsEdgeLengths[i]);
        }
        let [backwardsPtr, backwardsLength] = b.setArray(0, "Rider", "leanBackwardsEdgeLengths", b.createArray("i64", this.leanBackwardsEdgeLengths.length));
        for (let i = 0; i < this.leanBackwardsEdgeLengths.length; i++) {
            b.setFpAt(backwardsPtr + i * 8, this.leanBackwardsEdgeLengths[i]);
        }
    }
}

export function debugRiderData(riderData: ArrayBuffer) {
    debugRider(new Rider(new DataView(riderData)));
}

export function debugRider(rider: Rider) {
    console.log("debugRider");
    console.log("  fontWheel: ", rider.getFrontWheelIdx());
    console.log("  backWheel: ", rider.getBackWheelIdx());
    console.log("  bikeFoot: ", rider.getBikeFootIdx());
    console.log("  buttIdx: ", rider.getButtIdx());
    console.log("  chainIdx: ", rider.getChainIdx());
    let verticesTemp = rider.getVertices();
    console.log("  vertices: ", verticesTemp.ptr, verticesTemp.getOffset(), verticesTemp.getLength());
    for (let i = 0; i < verticesTemp.getLength(); i++) {

        let v = verticesTemp.get(i);
        console.log("    ", i, v.getX(), v.getY());
    }
}