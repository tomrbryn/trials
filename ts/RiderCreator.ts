import { Rider } from "./GameStructGeneratedCode";
import { Builder } from "./Schema";
import { Vertex as VertexStruct, Edge as EdgeStruct } from "./GameStructGeneratedCode";
import type { Point } from "./LevelCreator";

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

export type ClosestRiderPointType = "none" | "vertex" | "edge";

export type ClosestRiderPoint = {
    point: Point | null,
    distance: number,
    type: ClosestRiderPointType,
    index: number,
};

export function findClosest(rider: JsonRiderF, pos: Point, maxDistance: number = Number.MAX_VALUE): ClosestRiderPoint {
    let closest: ClosestRiderPoint = {
        point: null,
        distance: maxDistance,
        type: "none",
        index: -1,
    }

    let register = (closestPoint: Point, distance: number, type: ClosestRiderPointType, index: number) => {
        if (distance < closest.distance) {
            closest.distance = distance;
            closest.point = {x: closestPoint.x, y: closestPoint.y};
            closest.type = type;
            closest.index = index;
        }
    }

    let closestVertex = (p: Tuple, r: number, type: ClosestRiderPointType, index: number) => {
        let dx = pos.x - p.x;
        let dy = pos.y - p.y;
        let distance = Math.sqrt(dx * dx + dy * dy) - r;
        register(p, distance, type, index);
    }

    for (let i = 0; i < rider.vertices.length; i++) {
        closestVertex(rider.vertices[i].pos, rider.vertices[i].radius, "vertex", i);
    }

    for (let i = 0; i < rider.edges.length; i++) {
        let edge = rider.edges[i];
        let v1 = rider.vertices[edge.v1Idx];
        let v2 = rider.vertices[edge.v2Idx];
        let p1 = v1.pos;
        let p2 = v2.pos;
        closestVertex(p1, 0, "edge", i);
        closestVertex(p2, 0, "edge", i);
        let x1 = v1.pos.x;
        let y1 = v1.pos.y;
        let x2 = v2.pos.x;
        let y2 = v2.pos.y;
        let dx = x2 - x1;
        let dy = y2 - y1;
        let t = ((pos.x - x1) * dx + (pos.y - y1) * dy) / (dx * dx + dy * dy);
        let x = x1 + t * dx;
        let y = y1 + t * dy;
        if (t >= 0 && t <= 1) {
            let distance = Math.sqrt((pos.x - x) * (pos.x - x) + (pos.y - y) * (pos.y - y));
            register({x, y}, distance, "edge", i);
        }
    }

    return closest;
}

export class TupleF {
    static create(x = 0, y = 0): Tuple {
        return {x: x, y: y};
    }

    static distance(t1: Tuple, t2: Tuple): number {
        const dx = t1.x - t2.x;
        const dy = t1.y - t2.y;
        return Math.sqrt((dx * dx) + (dy * dy));
    }

    static isNan(t: Tuple): boolean {
        return isNaN(t.x) || isNaN(t.y);
    }
}

export type Tuple = {
    x: number,
    y: number,
}

export class VertexF {

    static create(): Vertex {
        return {
            pos: TupleF.create(),
            lean: TupleF.create(NaN, NaN),
            interpolated: TupleF.create(),
            old: TupleF.create(),
            acc: TupleF.create(),
            sim: TupleF.create(),
            prev: TupleF.create(),
            radius: 0,
            mass: 1,
            collidable: true,
            deathTrigger: false,
            wheel: false,
            driveTrain: false,
        }
    }

    static getPos(vertex: Vertex, leaning: boolean): Tuple {
        return (leaning && !TupleF.isNan(vertex.lean)) ? vertex.lean : vertex.pos;
    }

    static createFlags(vertex: Vertex): number {
        let flags = 0;
        flags |=  vertex.collidable ? 1 : 0;
        flags |=  vertex.deathTrigger ? 1 << 1 : 0;
        flags |=  vertex.wheel ? 1 << 2 : 0;
        flags |=  vertex.driveTrain ? 1 << 3 : 0;
        return flags;
    }
}

export type Vertex = {
    pos: Tuple,
    lean: Tuple,
    interpolated: Tuple,
    old: Tuple,
    acc: Tuple,
    sim: Tuple,
    prev: Tuple,
    radius: number,
    mass: number,
    collidable: boolean,
    deathTrigger: boolean,
    wheel: boolean,
    driveTrain: boolean,
}

export class EdgeF {

    static create(): Edge {
        return {
            startLength: 0,
            leanLength: 0,
            simLength: 0,
            stiffness: 0,
            damping: 0,
            minLength: 0,
            maxLength: 0,
            totalMass: 0,
            visible: false,
            v1Idx: 0,
            v2Idx: 0,
        }
    }
}

export type Edge = {
    startLength: number,
    leanLength: number,
    simLength: number,
    stiffness: number,
    damping: number,
    minLength: number,
    maxLength: number,
    totalMass: number,
    visible: boolean,
    v1Idx: number,
    v2Idx: number,
}

export function createVertex(x: number, y: number, radius: number, deathTrigger: boolean = false, leanx = NaN, leany = NaN): Vertex {
    const v = VertexF.create();
    v.pos.x = x;
    v.pos.y = y;
    v.lean.x = leanx;
    v.lean.y = leany;
    v.old.x = x;
    v.old.y = y;
    v.radius = radius;
    v.mass = Math.PI * radius * radius;
    return v;
}

export function createEdge(globalVs: Vertex[], v1: Vertex, v2: Vertex, stiffness: number, damping: number): Edge {   
    const edge = EdgeF.create();
    edge.stiffness = stiffness;
    edge.damping = damping;
    edge.v1Idx = globalVs.indexOf(v1);
    edge.v2Idx = globalVs.indexOf(v2);
    edge.startLength = TupleF.distance(v1.pos, v2.pos);
    edge.leanLength = (TupleF.isNan(v1.lean) && TupleF.isNan(v2.lean)) ? -1 
        : TupleF.distance(TupleF.isNan(v1.lean) ? v1.pos : v1.lean, TupleF.isNan(v2.lean) ? v2.pos : v2.lean);
    edge.totalMass = v1.mass + v2.mass;
    edge.maxLength = Math.max(edge.startLength, edge.leanLength);
    edge.visible = true;
    return edge;
}

function createEdges(globalVs: Vertex[], vs: Vertex[], stiffness: number, damping = 0): Edge[] {
    const edges: Edge[] = [];
    for (let i = 0; i < vs.length; i++) {
        for (let j = i + 1; j < vs.length; j++) {
            edges.push(createEdge(globalVs, vs[i], vs[j], stiffness, damping));
        }
    }
    return edges;
}

export type JsonRider = {
    iterations: number,
    wheelTorque: number,
    bikeTorque: number,
    vertices: Vertex[],
    edges: Edge[],
}

export class JsonRiderF {

    iterations = 5;
    wheelTorque = 5 / this.iterations;
    bikeTorque = 0.00025;
    vertices: Vertex[] = [];
    edges: Edge[] = [];

    create(): JsonRider {
        return {
            iterations: this.iterations,
            wheelTorque: this.wheelTorque,
            bikeTorque: this.bikeTorque,
            vertices: this.vertices,
            edges: this.edges,
        }
    }

    createUnisykle(): JsonRider {
        this.iterations = 5;
        this.wheelTorque = 2.5 / this.iterations;
        this.bikeTorque = 0.001;
        let wheelIdx = this.createWheel(0, -45, 38, 8, true);
        let wheel = this.vertices[wheelIdx]
        let seat = createVertex(0, -120, 10); // chain front center
        let v1 = createVertex(-40, -75, 10); // chain front center
        let v2 = createVertex( 40, -75, 10); // chain front center
        let low1 = createVertex(140, 50, 10);
        let low2 = createVertex(-140, 50, 10);
        low1.collidable = false;
        low2.collidable = false;
        let rider = createVertex(0, -200, 10);
        rider.lean.x = 30;
        rider.lean.y = -150;
        let vs = [seat, v1, v2, low1, low2];
        this.vertices.push(...vs);
        this.vertices.push(rider);
        let edges = createEdges(this.vertices, this.vertices, 0.1, 0.02)
        this.addEdges(edges);
        return this.create();
    }

    createSimple(): JsonRider {
        this.iterations = 3;
        this.wheelTorque = 2 / this.iterations;
        this.bikeTorque = 0.03;

        let backWheelIdx = this.createWheel(-87, -45, 38, 8, true);
        let frontWheelIdx = this.createWheel(87, -45, 38, 8, false);
        let frontWheel = this.vertices[frontWheelIdx]
        let backWheel = this.vertices[backWheelIdx]
        let chain = createVertex(-10, -55, 13); // chain front center
        let back = createVertex(-60, -110, 13); // chain front center
        let front = createVertex(50, -130, 13); // chain front center
        let rider = createVertex(-10, -150, 30);
        // rider.deathTrigger = true;
        rider.lean.x = 30;
        rider.lean.y = -180;
        let vs = [chain, back, front];
        this.vertices.push(...vs);
        this.vertices.push(rider);

        // const frontSpring = createEdge(this.vertices, frontWheel, front,  0.15, 0.0);
        const frontSpring = createEdge(this.vertices, frontWheel, front,  0.1, 0.2);
        frontSpring.minLength = 1;//frontSpring.maxLength * 0.75;
        // const backSpring = createEdge(this.vertices, backWheel, back,  0.15, 0.0);
        const backSpring = createEdge(this.vertices, backWheel, back,  0.15, 0);
        backSpring.minLength = backSpring.maxLength * 0.75;
        const frontEdge = createEdge(this.vertices, frontWheel, chain, 1, 0)
        const backEdge = createEdge(this.vertices, backWheel, chain, 1, 0)
        // const backEdge2 = createEdge(this.vertices, backWheel, front, 0.75, 0)
        // backEdge2.minLength = backEdge2.maxLength * 0.9;

        this.edges.push(createEdge(this.vertices, rider, front, 0.25, 0.01));
        this.edges.push(createEdge(this.vertices, rider, chain, 0.25, 0.01));
        this.edges.push(createEdge(this.vertices, rider, back, 0.25, 0.01));

        this.edges.push(frontEdge);
        this.edges.push(backEdge);
        this.edges.push(frontSpring);
        this.edges.push(backSpring);
        this.addEdges(createEdges(this.vertices, vs, 0.4));

        return this.create();
    }

    createDefault(): JsonRider {
        this.iterations = 4;
        this.wheelTorque = 5 / this.iterations;
        this.bikeTorque = 0.00125;
    
        // -------------- create bike ----------------
        let backWheelIdx = this.createWheel(48, 125, 38, 8, true);
        let frontWheelIdx = this.createWheel(223, 125, 38, 8, false);
        const backWheel = this.vertices[backWheelIdx];
        const frontWheel = this.vertices[frontWheelIdx];
        let stearing = createVertex(176, 19, 10); // stearing
        let bikeFoot = createVertex(101, 114, 10); // foot
        let chain = createVertex(125, 113, 13); // chain front center
        let engine = createVertex(125, 33, 15);
        const round = createVertex(144, 116, 11); //
        const skjerm = createVertex(70, 59, 8); // back skjerm
        let vs = [stearing, bikeFoot, chain, round, skjerm, engine];
        for (let vsIdx=0; vsIdx < vs.length; vsIdx++) {
            this.vertices.push(vs[vsIdx]);
        }

        const hard = 1;
        this.addEdges(createEdges(this.vertices, vs, hard));

        const frontSpring = createEdge(this.vertices, frontWheel, stearing,  0.15, 0);
        frontSpring.damping = 0.05;
        frontSpring.maxLength = 120;//116;
        frontSpring.minLength = 90;
        frontSpring.startLength = 120;
        this.edges.push(frontSpring);
        this.edges.push(createEdge(this.vertices, frontWheel, chain, hard, 0));
        this.edges.push(createEdge(this.vertices, frontWheel, chain, hard, 0));
        this.edges.push(createEdge(this.vertices, frontWheel, chain, hard, 0));
        this.edges.push(createEdge(this.vertices, backWheel, chain, hard, 0));
        this.edges.push(createEdge(this.vertices, backWheel, chain, hard, 0));
        this.edges.push(createEdge(this.vertices, backWheel, chain, hard, 0));
        const e = createEdge(this.vertices, backWheel, skjerm, 1, 0);
        e.maxLength = 70;//69;
        e.minLength = 50;
        e.damping = 0.05;
        e.stiffness = 0.3;//0.12;
        this.edges.push(e, e);

        // ------------- create rider ------------------
        let knee = createVertex(130, 80, 11, true);
        let butt = createVertex(95, 50, 15, true, 130, 20);
        let shoulders = createVertex(137, 15, 15, true, 175, -20);
        let head = createVertex(150, -10, 10, true, 190, -45);
        let foot = createVertex(100, 114, 10, true);
        foot.collidable = false;
        let hands = createVertex(175, 19, 10, true);

        let riderVertices = [knee, butt, shoulders, head, foot, hands];

        for (let i=0; i < riderVertices.length; i++) {
            this.vertices.push(riderVertices[i]);
        }
        riderVertices.push(stearing);
        riderVertices.push(bikeFoot);
        // riderVertices.push(skjerm);
        // riderVertices.push(engine);

        let riderEdges = createEdges(this.vertices, riderVertices, 0.9);
        this.addEdges(riderEdges);
        this.randomizeEdges();
        return this.create();
    }

    createWheel(x: number, y: number, radius: number, tireRadius: number, isDriveTrain: boolean): number {
        const wheel = createVertex(x, y, radius + tireRadius);
        const mass2 = Math.PI * radius * radius;
        // wheel mass is area of the tire
        wheel.mass -= mass2;
        wheel.mass = 500;
        wheel.old.x = wheel.pos.x;
        wheel.wheel = true;
        wheel.driveTrain = isDriveTrain;
        return this.vertices.push(wheel) - 1;
    }
    
    addEdges(edges: Edge[]) {
        this.edges.push(...edges);
    }

    randomizeEdges() {
        let random = seededRandom(123456);
        let edges = this.edges;
        for (let i = edges.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [edges[i], edges[j]] = [edges[j], edges[i]]; // Swap elements
        }
    }

    static applyToBuilder(rider: JsonRider, b: Builder) {
        b.setUint32(0, "Rider", "iterations", rider.iterations);
        b.setFp(0, "Rider", "wheelTorque", rider.wheelTorque);
        b.setFp(0, "Rider", "bikeTorque", rider.bikeTorque);
        let [verticesPtr, verticesLength] = b.setArray(0, "Rider", "vertices", b.createArray("Vertex", rider.vertices.length));
        for (let i = 0; i < rider.vertices.length; i++) {
            let vertexPtr = b.getArrayElement(verticesPtr, "Vertex", i);
            b.setFp(vertexPtr, "Vertex", "x", rider.vertices[i].pos.x);
            b.setFp(vertexPtr, "Vertex", "y", rider.vertices[i].pos.y);
            b.setFp(vertexPtr, "Vertex", "radius", rider.vertices[i].radius);
            b.setFp(vertexPtr, "Vertex", "mass", rider.vertices[i].mass);
            b.setUint32(vertexPtr, "Vertex", "flags", VertexF.createFlags(rider.vertices[i]));
        }
        let [startVerticesPtr, startVerticesLength] = b.setArray(0, "Rider", "startVertices", b.createArray("StartVertex", rider.vertices.length));
        for (let i = 0; i < rider.vertices.length; i++) {
            let startVertexPtr = b.getArrayElement(startVerticesPtr, "StartVertex", i);
            let p0 = VertexF.getPos(rider.vertices[i], false);
            let p1 = VertexF.getPos(rider.vertices[i], true);
            b.setFp(startVertexPtr, "StartVertex", "x", p0.x);
            b.setFp(startVertexPtr, "StartVertex", "y", p0.y);
            b.setFp(startVertexPtr, "StartVertex", "x0", p0.x);
            b.setFp(startVertexPtr, "StartVertex", "y0", p0.y);
            b.setFp(startVertexPtr, "StartVertex", "x1", p1.x);
            b.setFp(startVertexPtr, "StartVertex", "y1", p1.y);
        }

        let [edgesPtr, edgesLength] = b.setArray(0, "Rider", "edges", b.createArray("Edge", rider.edges.length));
        for (let i = 0; i < rider.edges.length; i++) {
            let edge = b.getArrayElement(edgesPtr, "Edge", i);
            b.setFp(edge, "Edge", "length", rider.edges[i].startLength);
            b.setFp(edge, "Edge", "stiffness", rider.edges[i].stiffness);
            b.setFp(edge, "Edge", "damping", rider.edges[i].damping);
            b.setFp(edge, "Edge", "minLength", rider.edges[i].minLength);
            b.setFp(edge, "Edge", "maxLength", rider.edges[i].maxLength);
            b.setFp(edge, "Edge", "totalMass", rider.edges[i].totalMass);
            b.setUint32(edge, "Edge", "visible", rider.edges[i].visible ? 1 : 0);
            b.setUint32(edge, "Edge", "v1Idx", rider.edges[i].v1Idx);
            b.setUint32(edge, "Edge", "v2Idx", rider.edges[i].v2Idx);
        }
        let [startEdgesPtr, startEdgesLength] = b.setArray(0, "Rider", "startEdges", b.createArray("Edge", rider.edges.length));
        b.copy(edgesPtr, startEdgesPtr, edgesLength * EdgeStruct.SIZE);
    }
}

export function debugRiderData(riderData: ArrayBuffer) {
    debugRider(new Rider(new DataView(riderData)));
}

export function debugRider(rider: Rider) {
    console.log("debugRider");
    let verticesTemp = rider.getVertices();
    console.log("  vertices: ", verticesTemp.ptr, verticesTemp.getOffset(), verticesTemp.getLength());
    for (let i = 0; i < verticesTemp.getLength(); i++) {
        let v = verticesTemp.get(i);
        console.log("    ", i, v.getX(), v.getY());
    }
}