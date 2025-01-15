#include <emscripten.h>
#include <math.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include "GameStructGeneratedCode.c"

#define HIGH_MASK ((1 << BITS) - 1) >> (BITS / 2) << (BITS / 2)
#define FP_ONE (1 << BITS)
#define STROKE_WIDTH 6
#define STATE_DEAD 0
#define STATE_PLAYING 1
#define STATE_FINISHED 2
#define INPUT_LEFT (1 << 0)
#define INPUT_RIGHT (1 << 1)
#define INPUT_UP (1 << 2)
#define INPUT_DOWN (1 << 3)
#define INPUT_CHECKPOINT (1 << 4)
#define toFp(v) ((int64_t)((v * (1 << BITS))))
#define i32Max(a, b) ((a) > (b) ? (a) : (b))
#define MASK_COLLIDABLE 1
#define MASK_DEATH_TRIGGER 2
#define MASK_WHEEL 4
#define MASK_DRIVE_TRAIN 8


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
StartVertex* startVerticeAt(uint32_t index) {
    return (Vertex*)(riderPtr + r->startVerticesOffset + index * StartVertexStride);
}
Edge* startEdgeAt(uint32_t index) {
    return (Edge*)(riderPtr + r->startEdgesOffset + index * EdgeStride);
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
int killed = 0;
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

    int64_t minx = 0x7fffffffffffffff;
    int64_t maxx = 0x8000000000000000;
    int64_t maxy = 0x8000000000000000;
    for (uint32_t i = 0; i < r->verticesLength; i++) {
        Vertex* v = verticeAt(i);
        StartVertex* sv = startVerticeAt(i);
        minx = min(minx, sv->x0 - v->radius);
        maxx = max(maxx, sv->x0 + v->radius);
        maxy = max(maxy, sv->y0 + v->radius);
    }
    int64_t centerx = (minx + maxx) >> 1;
    
    for (uint32_t i = 0; i < r->verticesLength; i++) {
        StartVertex* sv = startVerticeAt(i);
        Vertex* v = verticeAt(i);
        v->x = sv->x0 - centerx + checkpoint->x;
        v->y = sv->y0 - maxy + checkpoint->y - (150 << BITS);
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
    riderT = 0;
}

void updateEdgeLengths(int64_t t) {
    for (uint32_t i = 0; i < r->startVerticesLength; i++) {
        StartVertex* v = startVerticeAt(i);
        v->x = v->x0 + shiftRight((v->x1 - v->x0) * t);
        v->y = v->y0 + shiftRight((v->y1 - v->y0) * t);
    }

    for (uint32_t j = 0; j < r->edgesLength; j++) {
        Edge* edge = edgeAt(j);
        StartVertex* v1 = startVerticeAt(edge->v1Idx);
        StartVertex* v2 = startVerticeAt(edge->v2Idx);
        int64_t dx = v2->x - v1->x;
        int64_t dy = v2->y - v1->y;
        edge->length = lineLength(dx, dy);
    }
}

EMSCRIPTEN_KEEPALIVE
void newGame() {
    g.state = STATE_PLAYING;
    g.currentCheckpoint = 0;
    respawn();
    g.tickIdx = 0;
    g.tries = 0;
    printf("new game %f %f\n", r->wheelTorque / (float) FP_ONE, r->bikeTorque / (float) FP_ONE);
}

void calculateCenterOfMass() {
    int64_t totalMass = 0;
    int64_t totalX = 0;
    int64_t totalY = 0;
    for (uint32_t i = 0; i < r->verticesLength; i++) {
        Vertex* v = verticeAt(i);
        totalMass += v->mass;
        totalX += v->x * v->mass;
        totalY += v->y * v->mass;
    }
    r->centerOfMassX = totalX / totalMass;
    r->centerOfMassY = totalY / totalMass;
}

void applyVerletToVertex() {
    for (uint32_t i = 0; i < r->verticesLength; i++) {
        Vertex* v = verticeAt(i);
        int64_t tempX = v->x;
        int64_t tempY = v->y;
        v->x += v->x - v->prevX + v->accX;
        v->y += v->y - v->prevY + v->accY;
        v->prevX = tempX;
        v->prevY = tempY;
    }
}

void updateConstraints() {
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
            int64_t adjustment = shiftRight(diff * edge->stiffness);

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
}

bool collisionResponse(Vertex* v, int64_t closestx, int64_t closesty, int64_t normalx, int64_t normaly, int64_t vradius, int64_t wheelTorque) {
    if ((v->flags & MASK_WHEEL) != 0) {
        if (lineLength(closestx - v->x, closesty - v->y) < shiftRight(vradius * toFp(0.95))) {
            v->x = shiftRight(shiftRight(normalx * vradius * toFp(0.95))) + closestx;
            v->y = shiftRight(shiftRight(normaly * vradius * toFp(0.95))) + closesty;
        }

        if ((v->flags & MASK_DRIVE_TRAIN) != 0) {
            v->x += shiftRight(-normaly * wheelTorque);
            v->y += shiftRight( normalx * wheelTorque);
        }
    } else {
        v->x = (shiftRight(normalx * vradius) + closestx + v->prevX) >> 1;
        v->y = (shiftRight(normaly * vradius) + closesty + v->prevY) >> 1;

        if ((v->flags & MASK_DEATH_TRIGGER) != 0) {
            return true;
        }
    }

    return false;
}

void collisionDetectionAndResponse(int64_t wheelTorque) {
    for (int j = 0; j < r->verticesLength; j++) {
        Vertex* v = verticeAt(j);

        if ((v->flags & MASK_COLLIDABLE) == 0) {
            break;
        }

        for (int circleIdx = 0; circleIdx < l->circlesLength; circleIdx++) {
            Circle* circle = circleAt(circleIdx);
            int64_t dx = v->x - circle->x;
            int64_t dy = v->y - circle->y;
            int64_t length = lineLength(dx, dy);
            int64_t dist = length - circle->radius;
            bool intersected = dist < v->radius;
            if (length != 0 && intersected) {
                int64_t closestx = circle->x + (dx * circle->radius / length);
                int64_t closesty = circle->y + (dy * circle->radius / length);
                int64_t normalx = v->x - closestx;
                int64_t normaly = v->y - closesty;
                int64_t normalLength = lineLength(normalx, normaly);
                if (normalLength != 0) {
                    normalx = (normalx << BITS) / normalLength;
                    normaly = (normaly << BITS) / normalLength;
                }
                killed |= collisionResponse(v, closestx, closesty, normalx, normaly, v->radius, wheelTorque);
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
            int64_t rrr = ((v->x - line->x1) * dx + (v->y - line->y1) * dy);
            int64_t len = lineLength(dx, dy);
            int64_t t = 0;
            if (len != 0) {
                t = ((rrr / len) << BITS) / len;
            }

            // add line thickness to radius
            int64_t vradius = v->radius + (STROKE_WIDTH << (BITS - 1));

            if (t >= 0 && t <= FP_ONE) {
                tempProjectedx = line->x1 + shiftRight(t * dx);
                tempProjectedy = line->y1 + shiftRight(t * dy);

                dist = lineLength(v->x - tempProjectedx, v->y - tempProjectedy);
                intersected = dist <= vradius;
            } else {
                // center of ball is outside line segment. Check end points.
                dist = lineLength(v->x - line->x1, v->y - line->y1);
                int64_t distance2 = lineLength(v->x - line->x2, v->y - line->y2);

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

            if (intersected) {
                int64_t normalx = v->x - tempProjectedx;
                int64_t normaly = v->y - tempProjectedy;
                int64_t normalLength = lineLength(normalx, normaly);
                if (normalLength != 0) {
                    normalx = (normalx << BITS) / normalLength;
                    normaly = (normaly << BITS) / normalLength;
                }
                killed = collisionResponse(v, tempProjectedx, tempProjectedy, normalx, normaly, vradius, wheelTorque);
            }
        }
    }
}

int64_t prevt = 0;

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

    g.tickIdx++;

    int64_t wheelTorque = 0;
    if (g.state == STATE_PLAYING) {
        if (input & INPUT_UP) {
            wheelTorque += r->wheelTorque;
        }
        if (input & INPUT_DOWN) {
            wheelTorque = -r->wheelTorque;
        }

        float leanSpeed = 10.0f / 60.0f;//0.2f
        int64_t bikeTorque = 0;
        if (input & INPUT_LEFT) {
            bikeTorque -= r->bikeTorque;
            riderT = max(0, riderT - toFp(leanSpeed));
        }
        if (input & INPUT_RIGHT) {
            bikeTorque += r->bikeTorque;
            riderT = min(FP_ONE, riderT + toFp(leanSpeed));
        }

        if (riderT != prevt) {
            printf("riderT %f %f\n", riderT / (float) FP_ONE, bikeTorque / (float) FP_ONE);
        }

        prevt = riderT;


        calculateCenterOfMass();
        for (uint32_t i = 0; i < r->verticesLength; i++) {
            Vertex* v = verticeAt(i);
            int64_t dx = v->x - r->centerOfMassX;
            int64_t dy = v->y - r->centerOfMassY;
            int64_t length = lineLength(dx, dy);
            if (length != 0) {
                int64_t nx = shiftRight(-dy * length / (100 << BITS) * bikeTorque);
                int64_t ny = shiftRight( dx * length / (100 << BITS) * bikeTorque);
                v->x += nx;
                v->y += ny;
            }   
        }
        
        updateEdgeLengths(riderT);
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

    applyVerletToVertex();

    killed = false;
    for (int k = 0; k < r->iterations; k++) {
        updateConstraints();
        collisionDetectionAndResponse(wheelTorque);
    }


    if (g.state == STATE_PLAYING && killed) {
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
