uint32_t VertexStride = 72;
uint32_t EdgeStride = 60;
uint32_t RiderStride = 80;
uint32_t LineStride = 32;
uint32_t CircleStride = 24;
uint32_t CheckpointStride = 20;
uint32_t LevelStride = 24;
uint32_t TrialsGameStride = 16;

typedef struct {
    int64_t x;
    int64_t y;
    int64_t prevX;
    int64_t prevY;
    int64_t accX;
    int64_t accY;
    int64_t radius;
    int64_t mass;
    uint32_t collidable;
    uint32_t type;
} Vertex;

typedef struct {
    int64_t length;
    int64_t stiffness;
    int64_t damping;
    int64_t minLength;
    int64_t maxLength;
    int64_t totalMass;
    uint32_t visible;
    uint32_t v1Idx;
    uint32_t v2Idx;
} Edge;

typedef struct {
    uint32_t frontWheelIdx;
    uint32_t backWheelIdx;
    uint32_t bikeFootIdx;
    uint32_t chainIdx;
    uint32_t stearingIdx;
    uint32_t buttIdx;
    uint32_t verticesOffset;
    uint32_t verticesLength;
    uint32_t edgesOffset;
    uint32_t edgesLength;
    uint32_t startVerticesOffset;
    uint32_t startVerticesLength;
    uint32_t startEdgesOffset;
    uint32_t startEdgesLength;
    uint32_t leanForwardsEdgeLengthsOffset;
    uint32_t leanForwardsEdgeLengthsLength;
    uint32_t leanBackwardsEdgeLengthsOffset;
    uint32_t leanBackwardsEdgeLengthsLength;
    uint32_t riderEdgesIndex;
    uint32_t riderEdgesCount;
} Rider;

typedef struct {
    int64_t x1;
    int64_t y1;
    int64_t x2;
    int64_t y2;
} Line;

typedef struct {
    int64_t x;
    int64_t y;
    int64_t radius;
} Circle;

typedef struct {
    int64_t x;
    int64_t y;
    uint32_t passed;
} Checkpoint;

typedef struct {
    uint32_t linesOffset;
    uint32_t linesLength;
    uint32_t circlesOffset;
    uint32_t circlesLength;
    uint32_t checkpointsOffset;
    uint32_t checkpointsLength;
} Level;

typedef struct {
    uint32_t state;
    uint32_t tries;
    uint32_t currentCheckpoint;
    uint32_t tickIdx;
} TrialsGame;

