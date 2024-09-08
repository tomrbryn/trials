call C:\dev\emscripten\emsdk\emsdk.bat activate latest
cd c
call emcc -O3 -s WASM=1 -s MODULARIZE=1 -s EXPORT_NAME='createPhysicsModule' -s EXPORTED_FUNCTIONS="['_setData', '_newGame', '_tick', '_getGamePtr', '_malloc', '_free']" -s EXPORTED_RUNTIME_METHODS="['ccall', 'cwrap', 'allocate', 'getValue', 'setValue']" -o ../static/physics.js physics.c
