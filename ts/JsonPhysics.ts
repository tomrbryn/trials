import { ticksStore, triesStore } from "./game/GameStore";
import { Level, Rider } from "./GameStructGeneratedCode";
import { InputRecording } from "./InputRecording";
import { createDropLevel, levelToBinary, riderToBinary, type CreatorLevel } from "./LevelCreator";
import { JsonRiderF, VertexF, type JsonRider, type Vertex } from "./RiderCreator";
import { createSchema, schemaDefinition } from "./Schema";
// type Vec2 = { x: number; y: number };
// interface Particle {
//   pos: Vec2;
//   prev: Vec2;
//   invMass: number;
// }

// function sub(a: Vec2, b: Vec2): Vec2 { return { x: a.x - b.x, y: a.y - b.y }; }
// function add(a: Vec2, b: Vec2): Vec2 { return { x: a.x + b.x, y: a.y + b.y }; }
// function scale(v: Vec2, s: number): Vec2 { return { x: v.x * s, y: v.y * s }; }
// function len(v: Vec2): number { return Math.hypot(v.x, v.y); }
// function normalize(v: Vec2): Vec2 { const l = len(v); return l ? { x: v.x / l, y: v.y / l } : { x: 0, y: 0 }; }
// function dot(a: Vec2, b: Vec2): number { return a.x * b.x + a.y * b.y; }
// function crossZ(a: Vec2, b: Vec2): number { return a.x * b.y - a.y * b.x; }
// function rotate90(v: Vec2): Vec2 { return { x: -v.y, y: v.x }; }

// function signedArea(a: Vec2, b: Vec2, c: Vec2): number {
//   return 0.5 * ((b.x - a.x)*(c.y - a.y) - (b.y - a.y)*(c.x - a.x));
// }

// /**
//  * Apply soft angle constraint on triangle A-B-C
//  * @param restAngle - target internal angle at vertex B (in radians)
//  * @param stiffness - [0..1]
//  * @param ground - {a,b,c} booleans (true if vertex is grounded)
//  */
// function applyAngleConstraint(
//   A: Particle,
//   B: Particle,
//   C: Particle,
//   restAngle: number,
//   stiffness: number,
//   ground: { a: boolean; b: boolean; c: boolean },
// ) {
//   const AB = sub(A.pos, B.pos);
//   const CB = sub(C.pos, B.pos);
//   const lenAB = len(AB);
//   const lenCB = len(CB);
//   if (lenAB < 1e-6 || lenCB < 1e-6) return;

//   const nAB = normalize(AB);
//   const nCB = normalize(CB);

//   // Signed current angle at B
//   const sign = Math.sign(crossZ(nAB, nCB));
//   let currentAngle = Math.acos(Math.min(1, Math.max(-1, dot(nAB, nCB)))) * sign;
//   if (isNaN(currentAngle)) currentAngle = 0;

//   // Angle difference
//   let delta = currentAngle - restAngle;
//   // Wrap to [-pi, pi]
//   while (delta > Math.PI) delta -= 2 * Math.PI;
//   while (delta < -Math.PI) delta += 2 * Math.PI;

//   // If inverted (sign flipped from rest), boost stiffness
//   const restSign = Math.sign(restAngle);
//   if (sign !== restSign) stiffness *= 2.5; // tune this factor
//   stiffness = Math.min(stiffness, 1.0);

//   // Torque directions
//   const dirA = rotate90(nAB);
//   const dirC = rotate90(nCB);

//   // Correction magnitude
//   const corr = -delta * stiffness;

//   // Relative weights (grounded vertices resist motion)
//   const wA = A.invMass * (ground.a ? 0.1 : 1);
//   const wB = B.invMass * (ground.b ? 0.1 : 1);
//   const wC = C.invMass * (ground.c ? 0.1 : 1);

//   const sumW = wA + wB + wC;
//   if (sumW < 1e-9) return;

//   const factor = corr / sumW;

//   // Apply rotations around B
//   A.pos = add(A.pos, scale(dirA, factor * wA * lenAB));
//   C.pos = add(C.pos, scale(dirC, -factor * wC * lenCB));
//   // Move B slightly opposite to keep centroid stable
//   B.pos = add(B.pos, scale(add(dirA, dirC), -0.5 * factor * wB * Math.min(lenAB, lenCB)));

//   // Optional: damp velocity after big corrections
//   if (Math.abs(delta) > 0.5) {
//     A.prev = { ...A.pos };
//     B.prev = { ...B.pos };
//     C.prev = { ...C.pos };
//   }
// }



// for (step = 0; step < subSteps; step++) {
//   integrateParticles(dt);
//   solveTerrainCollisions();       // sets groundFlags[a,b,c] for each vertex
//   solveDistanceConstraints();     // your soft suspension links
//   for (let tri of bikeTriangles) {
//     applyAngleConstraint(tri.a, tri.b, tri.c, tri.restAngle, tri.stiffness, tri.groundFlags);
//   }
// }


function length(x: number, y: number): number {
    return Math.sqrt(x * x + y * y);
}

export class JsonPhysics {
    schema = createSchema(schemaDefinition);

    trialsGame: JsonTrialsGame;
    riderCreator: JsonRider = new JsonRiderF().createSimple();
    // riderCreator: JsonRider = new JsonRiderF().createUnisykle();
    // riderCreator: JsonRider = new JsonRiderF().createDefault();
    creatorLevel: CreatorLevel = createDropLevel();
    checkpointPassed: boolean[] = new Array(this.creatorLevel.checkpoints.length).fill(false);
    level: Level = new Level(new DataView(levelToBinary(this.schema, this.creatorLevel)));
    inputRecording = new InputRecording();

    static GRAVITY = 0.35;

    static STROKE_WIDTH = 6;
    static INPUT_LEFT = (1 << 0)
    static INPUT_RIGHT = (1 << 1)
    static INPUT_UP = (1 << 2)
    static INPUT_DOWN = (1 << 3)
    static INPUT_CHECKPOINT = (1 << 4)
    static MASK_COLLIDABLE = 1;
    static MASK_DEATH_TRIGGER = 2;
    static MASK_WHEEL = 4;
    static MASK_DRIVE_TRAIN = 8;
    
    riderT = 0;
    prevInput = 0;
    inputChanged = 0;
    killed = false;
    // tickIdx = 0;
    // TrialsGame g;
    // maxLineIdx = 0;

    centerOfMassX = 0;
    centerOfMassY = 0;
    totalMass = 0;
    iteration = 0;
    wheelTorque = 0;

    constructor() {
        this.trialsGame = new JsonTrialsGame();
        console.log("riderJson:\n",JSON.stringify(this.riderCreator));
    }

    setData(jsonLevel: CreatorLevel) {
        this.creatorLevel = jsonLevel;
        this.checkpointPassed = new Array(this.creatorLevel.checkpoints.length).fill(false);
        this.level = new Level(new DataView(levelToBinary(this.schema, this.creatorLevel)));
        // this.level = new Level(new DataView(this.module.HEAPU8.buffer, this.levelHeapPtr, levelUint8.length));
        // this.rider = new Rider(new DataView(this.module.HEAPU8.buffer, this.riderHeapPtr, riderUint8.length));
    }

    newGame() {
        console.log("newGame");
        this.inputRecording.clear();
        // this.module._newGame();
        this.trialsGame.state = JsonTrialsGame.STATE_PLAYING;
        this.trialsGame.currentCheckpoint = 0;
        this.respawn();
        this.trialsGame.tickIdx = 0;
        this.trialsGame.tries = 0;
    }

    respawn() {
        let minx = Number.MAX_VALUE;
        let maxx = Number.MIN_VALUE;
        let maxy = Number.MIN_VALUE;
        for (let i=0; i<this.riderCreator.vertices.length; i++) {
            let v = this.riderCreator.vertices[i];
            minx = Math.min(minx, v.pos.x - v.radius);
            maxx = Math.max(maxx, v.pos.x + v.radius);
            maxy = Math.max(maxy, v.pos.y + v.radius);
        }
        let centerx = (minx + maxx) / 2.0;

        let checkpoint = this.creatorLevel.checkpoints[this.trialsGame.currentCheckpoint];
        for (let i=0; i<this.riderCreator.vertices.length; i++) {
            let v = this.riderCreator.vertices[i];
            v.sim.x = v.pos.x - centerx + checkpoint[0];
            v.sim.y = v.pos.y - maxy + checkpoint[1] - 150;
            v.prev.x = v.sim.x;
            v.prev.y = v.sim.y;
            v.acc.x = 0;
            v.acc.y = 0;
        }

        for (let i=0; i<this.riderCreator.edges.length; i++) {
            let edge = this.riderCreator.edges[i];
            edge.simLength = edge.startLength;
        }

        this.trialsGame.tries++;
        if (this.trialsGame.currentCheckpoint == 0) {
            this.trialsGame.tries = 0;
        }

        this.riderT = 0;
        console.log("respawn");
    }

    printVertices(title = "") {
        console.log("printVertices", title, this.trialsGame.tickIdx);
        for (let i = 0; i < this.riderCreator.vertices.length; i++) {
            let v= this.riderCreator.vertices[i];
            console.log("  v", v.sim.x, v.sim.y);
        }
    }

    tick(input: number) {
        for (let i = 0; i < 2; i++) {
            this.tickStart(input);
            for (let i = 0; i < this.riderCreator.iterations; i++) {
                this.doIteration();
            }        
        }
        this.tickEnd();
    }

    tickStart(input: number) {
        this.inputRecording.record(input);
        this.inputChanged = input ^ this.prevInput;
        this.prevInput = input;

        if (this.trialsGame.state != JsonTrialsGame.STATE_FINISHED && (input & JsonPhysics.INPUT_CHECKPOINT) && (this.inputChanged & JsonPhysics.INPUT_CHECKPOINT)) {
            this.respawn();
            this.trialsGame.state = JsonTrialsGame.STATE_PLAYING;
            this.inputChanged &= ~JsonPhysics.INPUT_CHECKPOINT;
        }

        for (let i = 0; i < this.riderCreator.vertices.length; i++) {
            let v = this.riderCreator.vertices[i];
            v.acc.x = 0;
            v.acc.y = JsonPhysics.GRAVITY;
        }

        this.wheelTorque = 0;
        if (this.trialsGame.state == JsonTrialsGame.STATE_PLAYING) {
            if (input & JsonPhysics.INPUT_UP) {
                this.wheelTorque += this.riderCreator.wheelTorque;
            }
            if (input & JsonPhysics.INPUT_DOWN) {
                this.wheelTorque = -this.riderCreator.wheelTorque;
            }

            let leanSpeed = 10.0 / 60.0;//0.2f
            let bikeTorque = 0;
            if (input & JsonPhysics.INPUT_LEFT) {
                bikeTorque -= this.riderCreator.bikeTorque;
                this.riderT = Math.max(0, this.riderT - leanSpeed);
            }
            if (input & JsonPhysics.INPUT_RIGHT) {
                bikeTorque += this.riderCreator.bikeTorque;
                this.riderT = Math.min(1, this.riderT + leanSpeed);
            }


            this.calculateCenterOfMass();
            for (let i = 0; i < this.riderCreator.vertices.length; i++) {
                let v = this.riderCreator.vertices[i];
                let dx = v.sim.x - this.centerOfMassX;
                let dy = v.sim.y - this.centerOfMassY;
                let nx = -dy * bikeTorque * 0.1;
                let ny =  dx * bikeTorque * 0.1;
                v.acc.x += nx;
                v.acc.y += ny;
            }
            // let wheels = this.riderCreator.vertices.filter(v => v.wheel);
            // let dx = wheels[1].sim.x - wheels[0].sim.x;
            // let dy = wheels[1].sim.y - wheels[0].sim.y;
            // let scale = 2;
            // wheels[0].acc.x -= -dy * bikeTorque * scale;
            // wheels[0].acc.y -=  dx * bikeTorque * scale;
            // wheels[1].acc.x += -dy * bikeTorque * scale;
            // wheels[1].acc.y +=  dx * bikeTorque * scale;
            
            this.updateEdgeLengths(this.riderT);
        }

        for (let i = 0; i < this.creatorLevel.checkpoints.length; i++) {
            let checkpoint = this.creatorLevel.checkpoints[i];
            let v0 = this.riderCreator.vertices[0];
            if (checkpoint[0] < v0.sim.x) {
                this.checkpointPassed[i] = true;
                this.trialsGame.currentCheckpoint = Math.max(this.trialsGame.currentCheckpoint, i);
                if (this.trialsGame.currentCheckpoint == this.creatorLevel.checkpoints.length - 1) {
                    this.trialsGame.state = JsonTrialsGame.STATE_FINISHED;
                }
            }
        }

        this.applyVerletToVertex();

        this.killed = false;
        // for (let k = 0; k < this.riderCreator.iterations; k++) {
        //     this.updateConstraints();
        //     this.collisionDetectionAndResponse(this.wheelTorque);
        // }
        // if (this.trialsGame.state == JsonTrialsGame.STATE_PLAYING && this.killed) {
        //     console.log("your dead");
        //     this.trialsGame.state = JsonTrialsGame.STATE_DEAD;
        // }

        // triesStore.set(this.trialsGame.getTries());
        // ticksStore.set(this.trialsGame.getTickIdx());
    }

    doIteration() {
        this.updateConstraints();
        this.collisionDetectionAndResponse();
        this.iteration++;
    }

    tickEnd() {
        if (this.trialsGame.state == JsonTrialsGame.STATE_PLAYING && this.killed) {
            console.log("your dead");
            this.trialsGame.state = JsonTrialsGame.STATE_DEAD;
        }

        this.calculateCenterOfMass();
        this.trialsGame.tickIdx++;
        triesStore.set(this.trialsGame.getTries());
        ticksStore.set(this.trialsGame.getTickIdx());
    }
    
    calculateCenterOfMass() {
        this.totalMass = 0;
        let totalX = 0;
        let totalY = 0;
        for (let i = 0; i < this.riderCreator.vertices.length; i++) {
            let v = this.riderCreator.vertices[i];
            let m = 1;//v.mass;
            this.totalMass += m;
            totalX += v.sim.x * m;
            totalY += v.sim.y * m;
        }
        this.centerOfMassX = totalX / this.totalMass;
        this.centerOfMassY = totalY / this.totalMass;
    }    

    updateEdgeLengths(t: number) {
        for (let i = 0; i< this.riderCreator.vertices.length; i++) {
            let v = this.riderCreator.vertices[i];
            v.interpolated.x = v.pos.x + ((VertexF.getPos(v, true).x - v.pos.x) * t);
            v.interpolated.y = v.pos.y + ((VertexF.getPos(v, true).y - v.pos.y) * t);
        }
        for (let i = 0; i < this.riderCreator.edges.length; i++) {
            let edge = this.riderCreator.edges[i];
            let v1 = this.riderCreator.vertices[edge.v1Idx];
            let v2 = this.riderCreator.vertices[edge.v2Idx];
            let dx = v2.interpolated.x - v1.interpolated.x;
            let dy = v2.interpolated.y - v1.interpolated.y;
            edge.simLength = Math.sqrt(dx * dx + dy * dy);
        }
    }

    applyVerletToVertex() {
        for (let i = 0; i < this.riderCreator.vertices.length; i++) {
            let v = this.riderCreator.vertices[i];
            let tempX = v.sim.x;
            let tempY = v.sim.y;
            let damping = 0.997;
            v.sim.x += (v.sim.x - v.prev.x) * damping + v.acc.x;
            v.sim.y += (v.sim.y - v.prev.y) * damping + v.acc.y;
            v.prev.x = tempX;
            v.prev.y = tempY;
        }
    }
    
    updateConstraints() {
        for (let j = 0; j < this.riderCreator.edges.length; j++) {
            let edge = this.riderCreator.edges[j];
            let v1 = this.riderCreator.vertices[edge.v1Idx];
            let v2 = this.riderCreator.vertices[edge.v2Idx];

            // let targetLength = edge.simLength;
            let damping = edge.damping;

            let dx = v2.sim.x - v1.sim.x;
            let dy = v2.sim.y - v1.sim.y;
            let currentLength = length(dx, dy);

            let totalMass = v1.mass + v2.mass;
            if (currentLength != 0 && totalMass != 0) {
                let diff = edge.simLength - currentLength;
                let adjustment = diff * edge.stiffness;

                if (currentLength - adjustment < edge.minLength) {
                    adjustment = (edge.minLength - currentLength) * 0.96; //* 4;
                    damping = 0;
                }

                if (currentLength - adjustment > edge.maxLength) {
                    adjustment = (edge.maxLength - currentLength) * 0.96;
                    damping = 0;
                }

                v1.sim.x -= (dx * adjustment / currentLength) * v1.mass / totalMass;
                v1.sim.y -= (dy * adjustment / currentLength) * v1.mass / totalMass;
                v2.sim.x += (dx * adjustment / currentLength) * v2.mass / totalMass;
                v2.sim.y += (dy * adjustment / currentLength) * v2.mass / totalMass;
            }
    
            if (damping != 0) {
                let velDiffx = ((v2.sim.x - v2.prev.x) - (v1.sim.x - v1.prev.x)) * damping;
                let velDiffy = ((v2.sim.y - v2.prev.y) - (v1.sim.y - v1.prev.y)) * damping;
                v1.sim.x += velDiffx;
                v1.sim.y += velDiffy;
                v2.sim.x -= velDiffx;
                v2.sim.y -= velDiffy;
            }
        }
    }

    collisionResponse(v: Vertex, closestx: number, closesty: number, normalx: number, normaly: number, vradius: number, wheelTorque: number) {
        if (v.wheel) {
            if (Math.sqrt((closestx - v.sim.x) * (closestx - v.sim.x) + (closesty - v.sim.y) * (closesty - v.sim.y)) < vradius * 0.95) {
                v.sim.x = normalx * vradius * 0.95 + closestx;
                v.sim.y = normaly * vradius * 0.95 + closesty;
            }

            if (v.driveTrain) {
                v.sim.x += -normaly * wheelTorque;
                v.sim.y +=  normalx * wheelTorque;
            }
        } else {
            v.sim.x = (normalx * vradius + closestx + v.prev.x) / 2;
            v.sim.y = (normaly * vradius + closesty + v.prev.y) / 2;

            if (v.deathTrigger) {
                return true;
            }
        }
    
        return false;
    }
    
    collisionDetectionAndResponse() {
        for (let j = 0; j < this.riderCreator.vertices.length; j++) {
            let v = this.riderCreator.vertices[j];
            if (!v.collidable) {
                break;
            }
    
            for (let circleIdx = 0; circleIdx < this.creatorLevel.circles.length; circleIdx++) {
                let circle = this.creatorLevel.circles[circleIdx];
                let dx = v.sim.x - circle[0];
                let dy = v.sim.y - circle[1];
                let length = Math.sqrt(dx * dx + dy * dy);
                let dist = length - circle[2];
                let intersected = dist < v.radius;
                if (length != 0 && intersected) {
                    let closestx = circle[0] + (dx * circle[2] / length);
                    let closesty = circle[1] + (dy * circle[2] / length);
                    let normalx = v.sim.x - closestx;
                    let normaly = v.sim.y - closesty;
                    let normalLength = Math.sqrt(normalx * normalx + normaly * normaly);
                    if (normalLength != 0) {
                        normalx = normalx / normalLength;
                        normaly = normaly / normalLength;
                    }
                    this.killed = this.killed || this.collisionResponse(v, closestx, closesty, normalx, normaly, v.radius, this.wheelTorque);
                }
            }
    
            for (let lineArrayIdx = 0; lineArrayIdx < this.creatorLevel.lineArrays.length; lineArrayIdx++) {
                let lineArray = this.creatorLevel.lineArrays[lineArrayIdx];
                for (let lineIdx = 0 ; lineIdx < lineArray.length-1; lineIdx++) {
                    let dx = lineArray[lineIdx+1][0] - lineArray[lineIdx][0];
                    let dy = lineArray[lineIdx+1][1] - lineArray[lineIdx][1];
    
                    // the closest point on line if inside circle radius
                    let tempProjectedx = 0;
                    let tempProjectedy = 0;
                    let dist = 0;
                    let intersected = false;
    
                    // dot line with (ball - line endpoint)
                    // double precision (bits * 2) is used to avoid rounding errors
                    let rrr = ((v.sim.x - lineArray[lineIdx][0]) * dx + (v.sim.y - lineArray[lineIdx][1]) * dy);
                    let len = length(dx, dy);
                    let t = 0;

                    if (len != 0) {
                        t = (rrr / len / len);
                    }

                    // add line thickness to radius
                    let vradius = v.radius + (JsonPhysics.STROKE_WIDTH / 2);

                    if (t >= 0 && t <= 1) {
                        // console.log("a");
                        tempProjectedx = lineArray[lineIdx][0] + t * dx;
                        tempProjectedy = lineArray[lineIdx][1] + t * dy;
    
                        dist = length(v.sim.x - tempProjectedx, v.sim.y - tempProjectedy);
                        intersected = dist <= vradius;
                    } else {
                        // console.log("b");
                        // center of ball is outside line segment. Check end points.
                        dist = length(v.sim.x - lineArray[lineIdx][0], v.sim.y - lineArray[lineIdx][1]);
                        let distance2 = length(v.sim.x - lineArray[lineIdx+1][0], v.sim.y - lineArray[lineIdx+1][1]);
    
                        if (dist < vradius) {
                            intersected = true;
                            tempProjectedx = lineArray[lineIdx][0];
                            tempProjectedy = lineArray[lineIdx][1];
                        }
                        if (distance2 < vradius && distance2 < dist) {
                            intersected = true;
                            tempProjectedx = lineArray[lineIdx+1][0];
                            tempProjectedy = lineArray[lineIdx+1][1];
                            dist = distance2;
                        }
                    }

                    if (intersected) {
                        let normalx = v.sim.x - tempProjectedx;
                        let normaly = v.sim.y - tempProjectedy;
                        let normalLength = length(normalx, normaly);
                        if (normalLength != 0) {
                            normalx = normalx / normalLength;
                            normaly = normaly / normalLength;
                        }
                        this.killed = this.collisionResponse(v, tempProjectedx, tempProjectedy, normalx, normaly, vradius, this.wheelTorque);
                    }
                }
            }
        }
    }    

    getRider(): Rider {
        const riderData = riderToBinary(this.schema, this.riderCreator);
        let rider = new Rider(new DataView(riderData));
        let vertices = rider.getVertices();
        for (let i=0; i<vertices.getLength(); i++) {
            let v = this.riderCreator.vertices[i];
            let vertex = vertices.get(i);
            if (!isNaN(v.sim.x) && !isNaN(v.sim.y)) {
                vertex.setX(Math.round(v.sim.x));
                vertex.setY(Math.round(v.sim.y));
            }
        }
        rider.setCenterOfMassX(Math.round(this.centerOfMassX));
        rider.setCenterOfMassY(Math.round(this.centerOfMassY));
        return rider;
    }
}

export class JsonTrialsGame {

    static STATE_DEAD = 0;
    static STATE_PLAYING = 1;
    static STATE_FINISHED = 2;

    constructor(public state: number = 1, public tries: number = 0, public currentCheckpoint: number = 0, public tickIdx: number = 0) {}
    
    setState(newValue: number) {this.state = newValue;}
    getState(): number {return this.state;}
    setTries(newValue: number) {this.tries = newValue;}
    getTries(): number {return this.tries;}
    setCurrentCheckpoint(newValue: number) {this.currentCheckpoint = newValue;}
    getCurrentCheckpoint(): number {return this.currentCheckpoint;}
    setTickIdx(newValue: number) {this.tickIdx = newValue;}
    getTickIdx(): number {return this.tickIdx;}

}