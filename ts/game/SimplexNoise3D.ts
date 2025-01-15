export function sharpenPeaks(height: number, exponent: number = 2): number {
    // Normalize height to [0, 1] assuming height is non-negative (for example, from terrain generation)
    const normalizedHeight = Math.max(0, Math.min(1, height));

    // Apply a power function to sharpen the peaks
    const sharpenedHeight = Math.pow(normalizedHeight, exponent);

    // Optionally, return to the original range if normalization was used
    return sharpenedHeight;
}


interface TerrainParams {
    octaves?: number;
    persistence?: number;
    lacunarity?: number;
    gradientFactor?: number;
}

export function generateTerrainHeight(
    simplex: SimplexNoise3D,
    x: number,
    y: number,
    z: number,
    { octaves = 4, persistence = 0.5, lacunarity = 2.0, gradientFactor = 1.0 }: TerrainParams = {}
): number {
    let totalHeight = 0;
    let maxAmplitude = 0;
    let frequency = 1;
    let amplitude = 1;

    for (let i = 0; i < octaves; i++) {
        // Generate noise and gradient for the current octave
        const noiseData = simplex.noiseAndGradient(x * frequency, y * frequency, z * frequency);
        const noiseValue = noiseData.value;
        const gradient = noiseData.gradient;

        // Calculate gradient magnitude (Euclidean norm)
        const gradientMagnitude = Math.sqrt(gradient[0] ** 2 + gradient[1] ** 2 + gradient[2] ** 2);

        // Adjust the amplitude based on the gradient
        const gradientAdjustment = Math.exp(-gradientFactor * gradientMagnitude); // Exponentially reduce amplitude

        // Accumulate the noise value with adjusted amplitude
        totalHeight += noiseValue * amplitude * gradientAdjustment;

        // Track maximum possible amplitude (used to normalize the result)
        maxAmplitude += amplitude * gradientAdjustment;

        // Update amplitude and frequency for the next octave
        amplitude *= persistence;
        frequency *= lacunarity;
    }

    // Normalize the result to keep it in a reasonable range
    return totalHeight / maxAmplitude;
}

// // Example usage:
// const simplex = new SimplexNoise3D(42); // Seeded for deterministic terrain generation
// const x = 10.5, y = 20.3, z = 5.7;
// const terrainHeight = generateTerrainHeight(simplex, x, y, z, { octaves: 6, persistence: 0.5, lacunarity: 2.0 });

// console.log('Terrain Height:', terrainHeight);


export class SimplexNoise3D {
    private grad3: number[][];
    private perm: number[];
    private permMod12: number[];

    constructor(seed: number = 0) {
        this.grad3 = [
            [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
            [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
            [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
        ];

        this.perm = new Array(512);
        this.permMod12 = new Array(512);

        const p = this.buildPermutationTable(seed);

        for (let i = 0; i < 512; i++) {
            this.perm[i] = p[i & 255];
            this.permMod12[i] = this.perm[i] % 12;
        }
    }

    private buildPermutationTable(seed: number): number[] {
        const p = new Array(256);
        for (let i = 0; i < 256; i++) p[i] = i;

        // Seed-based shuffle (deterministic)
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(seed * (i + 1)) % 256;
            [p[i], p[j]] = [p[j], p[i]];
        }
        return p;
    }

    private dot(g: number[], x: number, y: number, z: number): number {
        return g[0] * x + g[1] * y + g[2] * z;
    }

    // Noise function that returns both value and gradient
    public noiseAndGradient(xin: number, yin: number, zin: number): { value: number, gradient: [number, number, number] } {
        const F3 = 1 / 3;
        const G3 = 1 / 6;

        let n0, n1, n2, n3; // Noise contributions from the four corners
        let gx0, gy0, gz0, gx1, gy1, gz1, gx2, gy2, gz2, gx3, gy3, gz3; // Gradients

        // Skew the input space to determine which simplex cell we're in
        const s = (xin + yin + zin) * F3; // Skew factor for 3D
        const i = Math.floor(xin + s);
        const j = Math.floor(yin + s);
        const k = Math.floor(zin + s);

        const t = (i + j + k) * G3;
        const X0 = i - t;
        const Y0 = j - t;
        const Z0 = k - t;
        const x0 = xin - X0;
        const y0 = yin - Y0;
        const z0 = zin - Z0;

        // Determine the simplex corner offsets
        let i1, j1, k1;
        let i2, j2, k2;

        if (x0 >= y0) {
            if (y0 >= z0) {
                i1 = 1; j1 = 0; k1 = 0;
                i2 = 1; j2 = 1; k2 = 0;
            } else if (x0 >= z0) {
                i1 = 1; j1 = 0; k1 = 0;
                i2 = 1; j2 = 0; k2 = 1;
            } else {
                i1 = 0; j1 = 0; k1 = 1;
                i2 = 1; j2 = 0; k2 = 1;
            }
        } else {
            if (y0 < z0) {
                i1 = 0; j1 = 0; k1 = 1;
                i2 = 0; j2 = 1; k2 = 1;
            } else if (x0 < z0) {
                i1 = 0; j1 = 1; k1 = 0;
                i2 = 0; j2 = 1; k2 = 1;
            } else {
                i1 = 0; j1 = 1; k1 = 0;
                i2 = 1; j2 = 1; k2 = 0;
            }
        }

        const x1 = x0 - i1 + G3;
        const y1 = y0 - j1 + G3;
        const z1 = z0 - k1 + G3;
        const x2 = x0 - i2 + 2.0 * G3;
        const y2 = y0 - j2 + 2.0 * G3;
        const z2 = z0 - k2 + 2.0 * G3;
        const x3 = x0 - 1.0 + 3.0 * G3;
        const y3 = y0 - 1.0 + 3.0 * G3;
        const z3 = z0 - 1.0 + 3.0 * G3;

        const ii = i & 255;
        const jj = j & 255;
        const kk = k & 255;

        const gi0 = this.permMod12[ii + this.perm[jj + this.perm[kk]]];
        const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]];
        const gi2 = this.permMod12[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]];
        const gi3 = this.permMod12[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]];

        // Contribution and gradient for corner 0
        let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
        if (t0 < 0) {
            n0 = 0.0;
            gx0 = gy0 = gz0 = 0.0;
        } else {
            t0 *= t0;
            n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0, z0);
            const t20 = t0 * t0;
            gx0 = t20 * this.grad3[gi0][0] - 8.0 * t0 * x0;
            gy0 = t20 * this.grad3[gi0][1] - 8.0 * t0 * y0;
            gz0 = t20 * this.grad3[gi0][2] - 8.0 * t0 * z0;
        }

        // Contribution and gradient for corner 1
        let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
        if (t1 < 0) {
            n1 = 0.0;
            gx1 = gy1 = gz1 = 0.0;
        } else {
            t1 *= t1;
            n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1, z1);
            const t21 = t1 * t1;
            gx1 = t21 * this.grad3[gi1][0] - 8.0 * t1 * x1;
            gy1 = t21 * this.grad3[gi1][1] - 8.0 * t1 * y1;
            gz1 = t21 * this.grad3[gi1][2] - 8.0 * t1 * z1;
        }

        // Contribution and gradient for corner 2
        let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
        if (t2 < 0) {
            n2 = 0.0;
            gx2 = gy2 = gz2 = 0.0;
        } else {
            t2 *= t2;
            n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2, z2);
            const t22 = t2 * t2;
            gx2 = t22 * this.grad3[gi2][0] - 8.0 * t2 * x2;
            gy2 = t22 * this.grad3[gi2][1] - 8.0 * t2 * y2;
            gz2 = t22 * this.grad3[gi2][2] - 8.0 * t2 * z2;
        }

        // Contribution and gradient for corner 3
        let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
        if (t3 < 0) {
            n3 = 0.0;
            gx3 = gy3 = gz3 = 0.0;
        } else {
            t3 *= t3;
            n3 = t3 * t3 * this.dot(this.grad3[gi3], x3, y3, z3);
            const t23 = t3 * t3;
            gx3 = t23 * this.grad3[gi3][0] - 8.0 * t3 * x3;
            gy3 = t23 * this.grad3[gi3][1] - 8.0 * t3 * y3;
            gz3 = t23 * this.grad3[gi3][2] - 8.0 * t3 * z3;
        }

        // Sum up and return the noise value and the gradient
        const value = 32.0 * (n0 + n1 + n2 + n3);
        const gradientX = 32.0 * (gx0 + gx1 + gx2 + gx3);
        const gradientY = 32.0 * (gy0 + gy1 + gy2 + gy3);
        const gradientZ = 32.0 * (gz0 + gz1 + gz2 + gz3);

        return { value, gradient: [gradientX, gradientY, gradientZ] };
    }
}

// // Example usage:
// const simplex = new SimplexNoise3D(42); // Seeded for deterministic behavior
// const result = simplex.noiseAndGradient(0.1, 0.2, 0.3);

// console.log('Noise value:', result.value);
// console.log('Gradient:', result.gradient);
