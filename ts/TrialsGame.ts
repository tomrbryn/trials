// export class VertexArray {

//     dataView;
//     ptr;
//     constructor(dataView, ptr) {
//         this.dataView = dataView;
//         this.ptr = ptr;
//     }

//     getSize() {
//         return 8;
//     }

//     getLength() {
//         return this.dataView.getUint32(this.ptr + 4, true);
//     }

//     get(i) {
//         let arrayPtr = this.dataView.getUint32(this.ptr, true);
//         return new Vertex(this.dataView, arrayPtr + i * 72);
//     }
// }

// export class EdgeArray {

//     dataView;
//     ptr;
//     constructor(dataView, ptr) {
//         this.dataView = dataView;
//         this.ptr = ptr;
//     }

//     getSize() {
//         return 8;
//     }

//     getLength() {
//         return this.dataView.getUint32(this.ptr + 4, true);
//     }

//     get(i) {
//         let arrayPtr = this.dataView.getUint32(this.ptr, true);
//         return new Edge(this.dataView, arrayPtr + i * 60);
//     }
// }

// export class i64Array {

//     dataView;
//     ptr;
//     constructor(dataView, ptr) {
//         this.dataView = dataView;
//         this.ptr = ptr;
//     }

//     getSize() {
//         return 8;
//     }

//     getLength() {
//         return this.dataView.getUint32(this.ptr + 4, true);
//     }

//     get(i) {
//         let arrayPtr = this.dataView.getUint32(this.ptr, true);
//         return new i64(this.dataView, arrayPtr + i * 8);
//     }
// }

// export class LineArray {

//     dataView;
//     ptr;
//     constructor(dataView, ptr) {
//         this.dataView = dataView;
//         this.ptr = ptr;
//     }

//     getSize() {
//         return 8;
//     }

//     getLength() {
//         return this.dataView.getUint32(this.ptr + 4, true);
//     }

//     get(i) {
//         let arrayPtr = this.dataView.getUint32(this.ptr, true);
//         return new Line(this.dataView, arrayPtr + i * 32);
//     }
// }

// export class CircleArray {

//     dataView;
//     ptr;
//     constructor(dataView, ptr) {
//         this.dataView = dataView;
//         this.ptr = ptr;
//     }

//     getSize() {
//         return 8;
//     }

//     getLength() {
//         return this.dataView.getUint32(this.ptr + 4, true);
//     }

//     get(i) {
//         let arrayPtr = this.dataView.getUint32(this.ptr, true);
//         return new Circle(this.dataView, arrayPtr + i * 24);
//     }
// }

// export class CheckpointArray {

//     dataView;
//     ptr;
//     constructor(dataView, ptr) {
//         this.dataView = dataView;
//         this.ptr = ptr;
//     }

//     getSize() {
//         return 8;
//     }

//     getLength() {
//         return this.dataView.getUint32(this.ptr + 4, true);
//     }

//     get(i) {
//         let arrayPtr = this.dataView.getUint32(this.ptr, true);
//         return new Checkpoint(this.dataView, arrayPtr + i * 20);
//     }
// }

// export class TrialsGame {

//     dataView;
//     ptr;
//     constructor(dataView, ptr) {
//         this.dataView = dataView;
//         this.ptr = ptr;
//     }

//     getSize() {
//         return 116;
//     }

//     getState() {
//         return Number(this.dataView.getUint32(this.ptr + 0, true));
//     }

//     getTries() {
//         return Number(this.dataView.getUint32(this.ptr + 4, true));
//     }

//     getCurrentCheckpoint() {
//         return Number(this.dataView.getUint32(this.ptr + 8, true));
//     }

//     getFrontWheelIdx() {
//         return Number(this.dataView.getUint32(this.ptr + 12, true));
//     }

//     getBackWheelIdx() {
//         return Number(this.dataView.getUint32(this.ptr + 16, true));
//     }

//     getBikeFootIdx() {
//         return Number(this.dataView.getUint32(this.ptr + 20, true));
//     }

//     getChainIdx() {
//         return Number(this.dataView.getUint32(this.ptr + 24, true));
//     }

//     getStearingIdx() {
//         return Number(this.dataView.getUint32(this.ptr + 28, true));
//     }

//     getButtIdx() {
//         return Number(this.dataView.getUint32(this.ptr + 32, true));
//     }

//     getVertices(): VertexArray {
//         return new VertexArray(this.dataView, this.ptr + 36);
//     }

//     getEdges(): EdgeArray {
//         return new EdgeArray(this.dataView, this.ptr + 44);
//     }

//     getStartVertices(): VertexArray {
//         return new VertexArray(this.dataView, this.ptr + 52);
//     }

//     getStartEdges(): EdgeArray {
//         return new EdgeArray(this.dataView, this.ptr + 60);
//     }

//     getLeanForwardsEdgeLengths(): i64Array {
//         return new i64Array(this.dataView, this.ptr + 68);
//     }

//     getLeanBackwardsEdgeLengths(): i64Array {
//         return new i64Array(this.dataView, this.ptr + 76);
//     }

//     getRiderEdgesIndex() {
//         return Number(this.dataView.getUint32(this.ptr + 84, true));
//     }

//     getRiderEdgesCount() {
//         return Number(this.dataView.getUint32(this.ptr + 88, true));
//     }

//     getLines(): LineArray {
//         return new LineArray(this.dataView, this.ptr + 92);
//     }

//     getCircles(): CircleArray {
//         return new CircleArray(this.dataView, this.ptr + 100);
//     }

//     getCheckpoints(): CheckpointArray {
//         return new CheckpointArray(this.dataView, this.ptr + 108);
//     }
// }

// export class Vertex {

//     dataView;
//     ptr;
//     constructor(dataView, ptr) {
//         this.dataView = dataView;
//         this.ptr = ptr;
//     }

//     getSize() {
//         return 72;
//     }

//     getX() {
//         return Number(this.dataView.getBigInt64(this.ptr + 0, true) / 256n);
//     }

//     getY() {
//         return Number(this.dataView.getBigInt64(this.ptr + 8, true) / 256n);
//     }

//     getPrevX() {
//         return Number(this.dataView.getBigInt64(this.ptr + 16, true) / 256n);
//     }

//     getPrevY() {
//         return Number(this.dataView.getBigInt64(this.ptr + 24, true) / 256n);
//     }

//     getAccX() {
//         return Number(this.dataView.getBigInt64(this.ptr + 32, true) / 256n);
//     }

//     getAccY() {
//         return Number(this.dataView.getBigInt64(this.ptr + 40, true) / 256n);
//     }

//     getRadius() {
//         return Number(this.dataView.getBigInt64(this.ptr + 48, true) / 256n);
//     }

//     getMass() {
//         return Number(this.dataView.getBigInt64(this.ptr + 56, true) / 256n);
//     }

//     getCollidable() {
//         return Number(this.dataView.getUint32(this.ptr + 64, true));
//     }

//     getType() {
//         return Number(this.dataView.getUint32(this.ptr + 68, true));
//     }
// }

// export class Edge {

//     dataView;
//     ptr;
//     constructor(dataView, ptr) {
//         this.dataView = dataView;
//         this.ptr = ptr;
//     }

//     getSize() {
//         return 60;
//     }

//     getLength() {
//         return Number(this.dataView.getBigInt64(this.ptr + 0, true) / 256n);
//     }

//     getStiffness() {
//         return Number(this.dataView.getBigInt64(this.ptr + 8, true) / 256n);
//     }

//     getDamping() {
//         return Number(this.dataView.getBigInt64(this.ptr + 16, true) / 256n);
//     }

//     getMinLength() {
//         return Number(this.dataView.getBigInt64(this.ptr + 24, true) / 256n);
//     }

//     getMaxLength() {
//         return Number(this.dataView.getBigInt64(this.ptr + 32, true) / 256n);
//     }

//     getTotalMass() {
//         return Number(this.dataView.getBigInt64(this.ptr + 40, true) / 256n);
//     }

//     getVisible() {
//         return Number(this.dataView.getUint32(this.ptr + 48, true));
//     }

//     getV1Idx() {
//         return Number(this.dataView.getUint32(this.ptr + 52, true));
//     }

//     getV2Idx() {
//         return Number(this.dataView.getUint32(this.ptr + 56, true));
//     }
// }

// export class Line {

//     dataView;
//     ptr;
//     constructor(dataView, ptr) {
//         this.dataView = dataView;
//         this.ptr = ptr;
//     }

//     getSize() {
//         return 32;
//     }

//     getX1() {
//         return Number(this.dataView.getBigInt64(this.ptr + 0, true) / 256n);
//     }

//     getY1() {
//         return Number(this.dataView.getBigInt64(this.ptr + 8, true) / 256n);
//     }

//     getX2() {
//         return Number(this.dataView.getBigInt64(this.ptr + 16, true) / 256n);
//     }

//     getY2() {
//         return Number(this.dataView.getBigInt64(this.ptr + 24, true) / 256n);
//     }
// }

// export class Circle {

//     dataView;
//     ptr;
//     constructor(dataView, ptr) {
//         this.dataView = dataView;
//         this.ptr = ptr;
//     }

//     getSize() {
//         return 24;
//     }

//     getX() {
//         return Number(this.dataView.getBigInt64(this.ptr + 0, true) / 256n);
//     }

//     getY() {
//         return Number(this.dataView.getBigInt64(this.ptr + 8, true) / 256n);
//     }

//     getRadius() {
//         return Number(this.dataView.getBigInt64(this.ptr + 16, true) / 256n);
//     }
// }

// export class Checkpoint {

//     dataView;
//     ptr;
//     constructor(dataView, ptr) {
//         this.dataView = dataView;
//         this.ptr = ptr;
//     }

//     getSize() {
//         return 20;
//     }

//     getX() {
//         return Number(this.dataView.getBigInt64(this.ptr + 0, true) / 256n);
//     }

//     getY() {
//         return Number(this.dataView.getBigInt64(this.ptr + 8, true) / 256n);
//     }

//     getPassed() {
//         return Number(this.dataView.getUint32(this.ptr + 16, true));
//     }
// }