#include <emscripten.h>
#include <math.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include "GameStructGeneratedCode.c"

#define BITS 8
#define HIGH_MASK ((1 << BITS) - 1) >> (BITS / 2) << (BITS / 2)
#define FP_ONE (1 << BITS)
#define STROKE_WIDTH 6
#define STATE_DEAD 0
#define STATE_PLAYING 1
#define STATE_FINISHED 2
#define TYPE_UNKNOWN 0
#define TYPE_RIDER 1
#define TYPE_BACK_WHEEL 2
#define TYPE_FRONT_WHEEL 3
#define INPUT_LEFT (1 << 0)
#define INPUT_RIGHT (1 << 1)
#define INPUT_UP (1 << 2)
#define INPUT_DOWN (1 << 3)
#define INPUT_CHECKPOINT (1 << 4)
#define toFp(v) ((int64_t)((v * (1 << BITS))))
#define i32Max(a, b) ((a) > (b) ? (a) : (b))

const int64_t BIKE_TORQUE = toFp(0.02f);//toFp(0.007f);
const int64_t WHEEL_TORQUE = toFp(1.25f);//toFp(0.63f);
const int64_t GRAVITY = toFp(1);//toFp(0.25f);


uint8_t *levelPtr = NULL;
uint8_t *riderPtr = NULL;
Level *l = NULL;
Rider *r = NULL;

Vertex* verticeAt(uint32_t index) {
    return (Vertex*)(riderPtr + r->verticesOffset + index * VertexStride);
}
Edge* edgeAt(uint32_t index) {
    return (Edge*)(riderPtr + r->edgesOffset + index * EdgeStride);
}
Vertex* startVerticeAt(uint32_t index) {
    return (Vertex*)(riderPtr + r->startVerticesOffset + index * VertexStride);
}
Edge* startEdgeAt(uint32_t index) {
    return (Edge*)(riderPtr + r->startEdgesOffset + index * EdgeStride);
}
int64_t leanForwardsEdgeLengthAt(uint32_t index) {
    return *(int64_t*)(riderPtr + r->leanForwardsEdgeLengthsOffset + index * 8);
}
int64_t leanBackwardsEdgeLengthAt(uint32_t index) {
    return *(int64_t*)(riderPtr + r->leanBackwardsEdgeLengthsOffset + index * 8);
}
Line* lineAt(uint32_t index) {
    return (Line*)(levelPtr + l->linesOffset + index * LineStride);
}
Circle* circleAt(uint32_t index) {
    return (Circle*)(levelPtr + l->circlesOffset + index * CircleStride);
}
Checkpoint* checkpointAt(uint32_t index) {
    return (Checkpoint*)(levelPtr + l->checkpointsOffset + index * CheckpointStride);
}

int prevInput = 0;
int changed = 0;
int64_t riderT = 0;
int collidedWithRider = 0;
int tickIdx = 0;
TrialsGame g;
int maxLineIdx = 0;

int64_t shiftRight(int64_t a) {
    return (a >> BITS) + (a & HIGH_MASK ? 1 : 0);
}

int64_t fpSqrt(int64_t a, int64_t guess) {
    for (int i=0; i<10; i++) {
        if (guess == 0) {
            break;
        }
        int64_t newGuess = (guess + (a / guess)) >> 1;
        if (newGuess == guess) {
            break;
        }
        guess = newGuess;
    }

    return guess;
}    

int64_t fpAbs(int64_t a) {
    return a < 0 ? -a : a;
}

int64_t lineLength(int64_t dx, int64_t dy) {
    int64_t sqr = dx * dx + dy * dy;
    return fpSqrt(sqr, fpAbs(dx) + fpAbs(dy));
}

int64_t max(int64_t a, int64_t b) {
    return a > b ? a : b;
}

int64_t min(int64_t a, int64_t b) {
    return a < b ? a : b;
}

void respawn() {
    Checkpoint* checkpoint = checkpointAt(g.currentCheckpoint);
    Vertex* vertices = (Vertex*)(riderPtr + r->verticesOffset);
    
    for (uint32_t i = 0; i < r->verticesLength; i++) {
        Vertex* sv = startVerticeAt(i);
        Vertex* v = verticeAt(i);
        v->x = sv->x + (checkpoint->x - (125 << BITS));
        v->y = sv->y + (checkpoint->y - (180 << BITS));
        v->prevX = v->x;
        v->prevY = v->y;
        v->accX = 0;
        v->accY = 0;
    }

    for (uint32_t i = 0; i < r->edgesLength; i++) {
        Edge* edge = edgeAt(i);
        Edge* startEdge = startEdgeAt(i);
        edge->length = startEdge->length;
    }
    
    g.tries++;
    if (g.currentCheckpoint == 0) {
        g.tries = 0;
    }
    riderT = 0;//1 << (BITS - 1);
    //printf("respanwed\n");
}

EMSCRIPTEN_KEEPALIVE
void newGame() {
    g.state = STATE_PLAYING;
    g.currentCheckpoint = 0;
    respawn();
    g.tries = 0;
}

// This function updates the physics engine state (called by JavaScript)
EMSCRIPTEN_KEEPALIVE
void tick(int input) {
    changed = input ^ prevInput;
    prevInput = input;
    
    if (g.state != STATE_FINISHED && (input & INPUT_CHECKPOINT) && (changed & INPUT_CHECKPOINT)) {
        respawn();
        g.state = STATE_PLAYING;
        changed &= ~INPUT_CHECKPOINT;
    }
    
    for (uint32_t i = 0; i < r->verticesLength; i++) {
        Vertex* v = verticeAt(i);
        v->accX = 0;
        v->accY = GRAVITY;
    }

    int64_t wheelTorque = 0;
    if (g.state == STATE_PLAYING) {
        g.tickIdx++;
        if (input & INPUT_UP) {
            wheelTorque += WHEEL_TORQUE;
        }
        if (input & INPUT_DOWN) {
            wheelTorque = -WHEEL_TORQUE;
        }

        int64_t bikeTorque = 0;
        if (input & INPUT_LEFT) {
            bikeTorque -= BIKE_TORQUE;
            riderT = max(0, riderT - toFp(0.2f));
        }
        if (input & INPUT_RIGHT) {
            bikeTorque += BIKE_TORQUE;
            riderT = min(FP_ONE, riderT + toFp(0.2f));
        }
        
        for (uint32_t i = 0; i < r->riderEdgesCount; i++) {
            Edge* e = edgeAt(r->riderEdgesIndex + i);
            int64_t a = leanForwardsEdgeLengthAt(i);
            int64_t b = leanBackwardsEdgeLengthAt(i);
            int64_t targetLength = a + shiftRight((b - a) * riderT);
            //int64_t prevLength = e->length;
            //int64_t newLength = prevLength + (targetLength - prevLength) * 25 / 100;

            if (targetLength != 0) {
                e->length = targetLength;//newLength;
            }
        }        

        Vertex* frontWheel = verticeAt(r->frontWheelIdx);
        Vertex* backWheel = verticeAt(r->backWheelIdx);
        int64_t nx = -((frontWheel->y - backWheel->y) * bikeTorque) >> BITS;
        int64_t ny = ((frontWheel->x - backWheel->x) * bikeTorque) >> BITS;

        frontWheel->x += nx;
        frontWheel->y += ny;
        backWheel->x -= nx;
        backWheel->y -= ny;
    }

    for (uint32_t i = 0; i < l->checkpointsLength; i++) {
        Checkpoint* checkpoint = checkpointAt(i);
        Vertex* v0 = verticeAt(0);
        if (checkpoint->x < v0->x) {
            checkpoint->passed = 1;
            g.currentCheckpoint = i32Max(g.currentCheckpoint, i);
            if (g.currentCheckpoint == l->checkpointsLength - 1) {
                g.state = STATE_FINISHED;
            }
        }
    }

    // ----------- update body ---------------
    // printf("a %d\n", (int)r->verticesLength);
    for (uint32_t i = 0; i < r->verticesLength; i++) {
        Vertex* v = verticeAt(i);
        int64_t tempX = v->x;
        int64_t tempY = v->y;
        v->x += v->x - v->prevX + v->accX;
        v->y += v->y - v->prevY + v->accY;
        v->prevX = tempX;
        v->prevY = tempY;
    }

    collidedWithRider = false;
    for (int k = 0; k < 10; k++) {
        for (uint32_t j = 0; j < r->edgesLength; j++) {
            Edge* edge = edgeAt(j);
            Vertex* v1 = verticeAt(edge->v1Idx);
            Vertex* v2 = verticeAt(edge->v2Idx);

            int64_t targetLength = edge->length;
            int64_t damping = edge->damping;

            int64_t dx = v2->x - v1->x;
            int64_t dy = v2->y - v1->y;
            int64_t sqr = dx * dx + dy * dy;
            float fCurrentLength = sqrt(sqr);

            // sqrt(sqr)
            int64_t guess = targetLength;
            int64_t currentLength = (guess + (sqr / guess)) >> 1;

            int64_t totalMass = v1->mass + v2->mass;
            if (currentLength != 0 && totalMass != 0) {
                int64_t diff = edge->length - currentLength;
                int64_t adjustment = (diff * edge->stiffness) >> BITS;

                if (currentLength - adjustment < edge->minLength) {
                    adjustment = edge->minLength - currentLength;
                    adjustment *= 4;
                    damping = 0;
                }

                if (currentLength - adjustment > edge->maxLength) {
                    adjustment = edge->maxLength-currentLength;
                    damping = 0;
                }

                v1->x -= (dx * adjustment / currentLength) * v1->mass / totalMass;
                v1->y -= (dy * adjustment / currentLength) * v1->mass / totalMass;
                v2->x += (dx * adjustment / currentLength) * v2->mass / totalMass;
                v2->y += (dy * adjustment / currentLength) * v2->mass / totalMass;
            }
            if (damping != 0) {
                int64_t velDiffx = ((v2->x - v2->prevX) - (v1->x - v1->prevX)) * damping >> (BITS + 1);
                int64_t velDiffy = ((v2->y - v2->prevY) - (v1->y - v1->prevY)) * damping >> (BITS + 1);
                v1->x += velDiffx;
                v1->y += velDiffy;
                v2->x -= velDiffx;
                v2->y -= velDiffy;
            }
        }

        for (int j = 0; j < r->verticesLength; j++) {
            Vertex* v = verticeAt(j);

            // ---------------- collision detection --------------------
            bool foundCollision = false;
            int64_t normalx = 0;
            int64_t normaly = 1 << BITS;
            int64_t closestx = 0;
            int64_t closesty = 0;
            int64_t closestDistance = 0;
            int64_t ballx = v->x;
            int64_t bally = v->y;
            int64_t vradius = v->radius + (STROKE_WIDTH << (BITS - 1));

            if (v->collidable == 0) {
                break;
            }

            for (int circleIdx = 0; circleIdx < l->circlesLength; circleIdx++) {
                Circle* circle = circleAt(circleIdx);
                int64_t dx = ballx - circle->x;
                int64_t dy = bally - circle->y;
                int64_t length = lineLength(dx, dy);
                int64_t dist = length - circle->radius;
                bool intersected = dist < vradius;

                if (length != 0 && (!foundCollision || dist < closestDistance)) {
                    closestDistance = dist;
                    foundCollision = intersected;
                    closestx = circle->x + (dx * circle->radius / length);
                    closesty = circle->y + (dy * circle->radius / length);
                    normalx = v->x - closestx;
                    normaly = v->y - closesty;
                    int64_t normalLength = lineLength(normalx, normaly);
                    if (normalLength != 0) {
                        normalx = (normalx << BITS) / normalLength;
                        normaly = (normaly << BITS) / normalLength;
                    }
                }
            }

            for (int lineIdx = 0; lineIdx < l->linesLength; lineIdx++) {
                Line* line = lineAt(lineIdx);
                int64_t dx = line->x2 - line->x1;
                int64_t dy = line->y2 - line->y1;

                // the closest point on line if inside circle radius
                int64_t tempProjectedx = 0;
                int64_t tempProjectedy = 0;
                int64_t dist = 0;
                bool intersected = false;

                // dot line with (ball - line endpoint)
                // double precision (bits * 2) is used to avoid rounding errors
                int64_t rrr = ((ballx - line->x1) * dx + (bally - line->y1) * dy);
                int64_t len = lineLength(line->x2 - line->x1, line->y2 - line->y1);
                int64_t t = 0;
                if (len != 0) {
                    t = (rrr << (BITS * 2)) / len / len;
                }

                if (t >= 0 && t <= 1 << (BITS * 2)) {
                    tempProjectedx = line->x1 + shiftRight(shiftRight(t * dx));
                    tempProjectedy = line->y1 + shiftRight(shiftRight(t * dy));

                    dist = lineLength(ballx - tempProjectedx, bally - tempProjectedy);
                    intersected = dist <= vradius;
                } else {
                    // center of ball is outside line segment. Check end points.
                    dist = lineLength(ballx - line->x1, bally - line->y1);
                    int64_t distance2 = lineLength(ballx - line->x2, bally - line->y2);

                    if (dist < vradius) {
                        intersected = true;
                        tempProjectedx = line->x1;
                        tempProjectedy = line->y1;
                    }
                    if (distance2 < vradius && distance2 < dist) {
                        intersected = true;
                        tempProjectedx = line->x2;
                        tempProjectedy = line->y2;
                        dist = distance2;
                    }
                }

                // store closest hit
                if (!foundCollision || dist < closestDistance) {
                    closestDistance = dist;
                    foundCollision = intersected;
                    closestx = tempProjectedx;
                    closesty = tempProjectedy;
                    normalx = v->x - closestx;
                    normaly = v->y - closesty;
                    int64_t normalLength = lineLength(normalx, normaly);
                    if (normalLength != 0) {
                        normalx = (normalx << BITS) / normalLength;
                        normaly = (normaly << BITS) / normalLength;
                    }
                }
            }

            // ---------------- end collision detection --------------------
            if (foundCollision) {
                if (v->type == TYPE_BACK_WHEEL || v->type == TYPE_FRONT_WHEEL) {
                    if (lineLength(closestx - v->x, closesty - v->y) < (vradius * toFp(0.95)) >> BITS) {
                        v->x = shiftRight(shiftRight(normalx * vradius * toFp(0.95))) + closestx;
                        v->y = shiftRight(shiftRight(normaly * vradius * toFp(0.95))) + closesty;
                    }

                    if (v->type == TYPE_BACK_WHEEL) {
                        v->x += (-normaly * wheelTorque) >> BITS;
                        v->y +=  (normalx * wheelTorque) >> BITS;
                    }
                } else {
                    v->x = (((normalx * vradius) >> BITS) + closestx) >> 1;
                    v->y = (((normaly * vradius) >> BITS) + closesty) >> 1;
                    v->x += v->prevX >> 1;
                    v->y += v->prevY >> 1;

                    if (v->type == TYPE_RIDER) {
                        collidedWithRider = true;
                    }
                }
            }
        }
    }

    if (g.state == STATE_PLAYING && collidedWithRider) {
        printf("your dead\n");
        g.state = STATE_DEAD;
    }
}

EMSCRIPTEN_KEEPALIVE
uint8_t* getGamePtr() {
    return (uint8_t*)&g;
}

// This function sets the scene data (called by JavaScript)
EMSCRIPTEN_KEEPALIVE
void setData(uint8_t *levelData, uint8_t *riderData) {
    levelPtr = levelData;
    riderPtr = riderData;
    l = (Level *)levelData;
    r = (Rider *)riderData;
    newGame();
}
