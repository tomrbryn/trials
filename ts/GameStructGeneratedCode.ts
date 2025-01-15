export class Vertex {

    static SIZE = 68;

    constructor(public dataView: DataView, public ptr: number = 0) {
    }

    setX(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 0, newValue, true);
    }

    getX(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 0, true) / 4096n);
    }

    setY(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 8, newValue, true);
    }

    getY(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 8, true) / 4096n);
    }

    setPrevX(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 16, newValue, true);
    }

    getPrevX(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 16, true) / 4096n);
    }

    setPrevY(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 24, newValue, true);
    }

    getPrevY(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 24, true) / 4096n);
    }

    setAccX(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 32, newValue, true);
    }

    getAccX(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 32, true) / 4096n);
    }

    setAccY(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 40, newValue, true);
    }

    getAccY(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 40, true) / 4096n);
    }

    setRadius(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 48, newValue, true);
    }

    getRadius(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 48, true) / 4096n);
    }

    setMass(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 56, newValue, true);
    }

    getMass(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 56, true) / 4096n);
    }

    setFlags(newValue: number) {
        this.dataView.setUint32(this.ptr + 64, newValue, true);
    }

    getFlags(): number {
        return Number(this.dataView.getUint32(this.ptr + 64, true));
    }
}

export class Edge {

    static SIZE = 60;

    constructor(public dataView: DataView, public ptr: number = 0) {
    }

    setLength(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 0, newValue, true);
    }

    getLength(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 0, true) / 4096n);
    }

    setStiffness(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 8, newValue, true);
    }

    getStiffness(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 8, true) / 4096n);
    }

    setDamping(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 16, newValue, true);
    }

    getDamping(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 16, true) / 4096n);
    }

    setMinLength(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 24, newValue, true);
    }

    getMinLength(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 24, true) / 4096n);
    }

    setMaxLength(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 32, newValue, true);
    }

    getMaxLength(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 32, true) / 4096n);
    }

    setTotalMass(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 40, newValue, true);
    }

    getTotalMass(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 40, true) / 4096n);
    }

    setVisible(newValue: number) {
        this.dataView.setUint32(this.ptr + 48, newValue, true);
    }

    getVisible(): number {
        return Number(this.dataView.getUint32(this.ptr + 48, true));
    }

    setV1Idx(newValue: number) {
        this.dataView.setUint32(this.ptr + 52, newValue, true);
    }

    getV1Idx(): number {
        return Number(this.dataView.getUint32(this.ptr + 52, true));
    }

    setV2Idx(newValue: number) {
        this.dataView.setUint32(this.ptr + 56, newValue, true);
    }

    getV2Idx(): number {
        return Number(this.dataView.getUint32(this.ptr + 56, true));
    }
}

export class StartVertex {

    static SIZE = 48;

    constructor(public dataView: DataView, public ptr: number = 0) {
    }

    setX(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 0, newValue, true);
    }

    getX(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 0, true) / 4096n);
    }

    setY(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 8, newValue, true);
    }

    getY(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 8, true) / 4096n);
    }

    setX0(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 16, newValue, true);
    }

    getX0(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 16, true) / 4096n);
    }

    setY0(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 24, newValue, true);
    }

    getY0(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 24, true) / 4096n);
    }

    setX1(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 32, newValue, true);
    }

    getX1(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 32, true) / 4096n);
    }

    setY1(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 40, newValue, true);
    }

    getY1(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 40, true) / 4096n);
    }
}

export class VertexArray {

    static SIZE = 8;

    constructor(public dataView: DataView, public ptr: number = 0) {
    }

    getOffset(): number {
        return this.dataView.getUint32(this.ptr, true);
    }

    getLength(): number {
        return this.dataView.getUint32(this.ptr + 4, true);
    }

    get(i: number): Vertex {
        return new Vertex(this.dataView, this.getOffset() + i * 68);
    }
}

export class EdgeArray {

    static SIZE = 8;

    constructor(public dataView: DataView, public ptr: number = 0) {
    }

    getOffset(): number {
        return this.dataView.getUint32(this.ptr, true);
    }

    getLength(): number {
        return this.dataView.getUint32(this.ptr + 4, true);
    }

    get(i: number): Edge {
        return new Edge(this.dataView, this.getOffset() + i * 60);
    }
}

export class StartVertexArray {

    static SIZE = 8;

    constructor(public dataView: DataView, public ptr: number = 0) {
    }

    getOffset(): number {
        return this.dataView.getUint32(this.ptr, true);
    }

    getLength(): number {
        return this.dataView.getUint32(this.ptr + 4, true);
    }

    get(i: number): StartVertex {
        return new StartVertex(this.dataView, this.getOffset() + i * 48);
    }
}

export class Rider {

    static SIZE = 68;

    constructor(public dataView: DataView, public ptr: number = 0) {
    }

    setCenterOfMassX(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 0, newValue, true);
    }

    getCenterOfMassX(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 0, true) / 4096n);
    }

    setCenterOfMassY(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 8, newValue, true);
    }

    getCenterOfMassY(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 8, true) / 4096n);
    }

    setWheelTorque(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 16, newValue, true);
    }

    getWheelTorque(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 16, true) / 4096n);
    }

    setBikeTorque(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 24, newValue, true);
    }

    getBikeTorque(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 24, true) / 4096n);
    }

    getVertices(): VertexArray {
        return new VertexArray(this.dataView, this.ptr + 32);
    }

    getEdges(): EdgeArray {
        return new EdgeArray(this.dataView, this.ptr + 40);
    }

    getStartVertices(): StartVertexArray {
        return new StartVertexArray(this.dataView, this.ptr + 48);
    }

    getStartEdges(): EdgeArray {
        return new EdgeArray(this.dataView, this.ptr + 56);
    }

    setIterations(newValue: number) {
        this.dataView.setUint32(this.ptr + 64, newValue, true);
    }

    getIterations(): number {
        return Number(this.dataView.getUint32(this.ptr + 64, true));
    }
}

export class Line {

    static SIZE = 32;

    constructor(public dataView: DataView, public ptr: number = 0) {
    }

    setX1(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 0, newValue, true);
    }

    getX1(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 0, true) / 4096n);
    }

    setY1(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 8, newValue, true);
    }

    getY1(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 8, true) / 4096n);
    }

    setX2(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 16, newValue, true);
    }

    getX2(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 16, true) / 4096n);
    }

    setY2(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 24, newValue, true);
    }

    getY2(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 24, true) / 4096n);
    }
}

export class Circle {

    static SIZE = 24;

    constructor(public dataView: DataView, public ptr: number = 0) {
    }

    setX(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 0, newValue, true);
    }

    getX(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 0, true) / 4096n);
    }

    setY(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 8, newValue, true);
    }

    getY(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 8, true) / 4096n);
    }

    setRadius(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 16, newValue, true);
    }

    getRadius(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 16, true) / 4096n);
    }
}

export class Checkpoint {

    static SIZE = 20;

    constructor(public dataView: DataView, public ptr: number = 0) {
    }

    setX(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 0, newValue, true);
    }

    getX(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 0, true) / 4096n);
    }

    setY(newValue: number) {
        this.dataView.setBigInt64(this.ptr + 8, newValue, true);
    }

    getY(): number {
        return Number(this.dataView.getBigInt64(this.ptr + 8, true) / 4096n);
    }

    setPassed(newValue: number) {
        this.dataView.setUint32(this.ptr + 16, newValue, true);
    }

    getPassed(): number {
        return Number(this.dataView.getUint32(this.ptr + 16, true));
    }
}

export class LineArray {

    static SIZE = 8;

    constructor(public dataView: DataView, public ptr: number = 0) {
    }

    getOffset(): number {
        return this.dataView.getUint32(this.ptr, true);
    }

    getLength(): number {
        return this.dataView.getUint32(this.ptr + 4, true);
    }

    get(i: number): Line {
        return new Line(this.dataView, this.getOffset() + i * 32);
    }
}

export class CircleArray {

    static SIZE = 8;

    constructor(public dataView: DataView, public ptr: number = 0) {
    }

    getOffset(): number {
        return this.dataView.getUint32(this.ptr, true);
    }

    getLength(): number {
        return this.dataView.getUint32(this.ptr + 4, true);
    }

    get(i: number): Circle {
        return new Circle(this.dataView, this.getOffset() + i * 24);
    }
}

export class CheckpointArray {

    static SIZE = 8;

    constructor(public dataView: DataView, public ptr: number = 0) {
    }

    getOffset(): number {
        return this.dataView.getUint32(this.ptr, true);
    }

    getLength(): number {
        return this.dataView.getUint32(this.ptr + 4, true);
    }

    get(i: number): Checkpoint {
        return new Checkpoint(this.dataView, this.getOffset() + i * 20);
    }
}

export class Level {

    static SIZE = 24;

    constructor(public dataView: DataView, public ptr: number = 0) {
    }

    getLines(): LineArray {
        return new LineArray(this.dataView, this.ptr + 0);
    }

    getCircles(): CircleArray {
        return new CircleArray(this.dataView, this.ptr + 8);
    }

    getCheckpoints(): CheckpointArray {
        return new CheckpointArray(this.dataView, this.ptr + 16);
    }
}

export class TrialsGame {

    static SIZE = 16;

    constructor(public dataView: DataView, public ptr: number = 0) {
    }

    setState(newValue: number) {
        this.dataView.setUint32(this.ptr + 0, newValue, true);
    }

    getState(): number {
        return Number(this.dataView.getUint32(this.ptr + 0, true));
    }

    setTries(newValue: number) {
        this.dataView.setUint32(this.ptr + 4, newValue, true);
    }

    getTries(): number {
        return Number(this.dataView.getUint32(this.ptr + 4, true));
    }

    setCurrentCheckpoint(newValue: number) {
        this.dataView.setUint32(this.ptr + 8, newValue, true);
    }

    getCurrentCheckpoint(): number {
        return Number(this.dataView.getUint32(this.ptr + 8, true));
    }

    setTickIdx(newValue: number) {
        this.dataView.setUint32(this.ptr + 12, newValue, true);
    }

    getTickIdx(): number {
        return Number(this.dataView.getUint32(this.ptr + 12, true));
    }
}

