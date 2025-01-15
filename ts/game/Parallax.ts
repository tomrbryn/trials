import { generateTerrainHeight, sharpenPeaks, SimplexNoise3D } from './SimplexNoise3D.ts';

export function paintTerrain(ctx, canvas: HTMLCanvasElement) {

    const horizonY = canvas.height * (2 / 3);
    // Create a gradient for distant mountains (light to dark for depth)

    const simplex = new SimplexNoise3D(42); // 42 is the seed

    let layerCount = 4;
    for (let layer = 0; layer < layerCount; layer++) {
        let t = layer / (layerCount - 1);
        const mountainGradient = ctx.createLinearGradient(0, horizonY - 150 * t, 0, canvas.height);
        let intensity = (1 - t/4)*255;
        let intensity2 = (1 - t/2)*255;
        mountainGradient.addColorStop(0, `rgb(${intensity}, ${intensity}, ${intensity})`); // Light gray at the top of the mountain
        mountainGradient.addColorStop(1, `rgb(${intensity2}, ${intensity2}, ${intensity2})`); // Darker gray towards the base
    
        // Draw the first (distant) mountain range with gradient
        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        for (let x=0; x<canvas.width; x+=4) {
            let sx = x / layer / canvas.width;
            let height = (1 + generateTerrainHeight(simplex, sx, layer, 0.3, { octaves: 15, persistence: 0.5, lacunarity: 2.0, gradientFactor: 0.2 }))/2;
            const y = height * 400 - 200 + horizonY - 400 * (1-t);
            ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, horizonY);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        ctx.fillStyle = mountainGradient;
        ctx.fill();
    }
}

export class vec3 {
    constructor(public x: number, public y: number, public z: number) {}

    floor(): vec3 {
        return new vec3(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z));
    }

    fract(): vec3 {
        return new vec3(this.x - Math.floor(this.x), this.y - Math.floor(this.y), this.z - Math.floor(this.z));
    }

    mul(v: vec3): vec3 {
        return new vec3(this.x * v.x, this.y * v.y, this.z * v.z);
    }

    mulf(f: number): vec3 {
        return new vec3(this.x * f, this.y * f, this.z * f);
    }

    add(v: vec3): vec3 {
        return new vec3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    addf(f: number): vec3 {
        return new vec3(this.x + f, this.y + f, this.z + f);
    }

    subf(f: number): vec3 {
        return new vec3(this.x - f, this.y - f, this.z - f);
    }
}

export class vec4 {
    constructor(public x: number, public yzw: vec3) {

    }
}

export class mat3 {
    constructor(public x: vec3, public y: vec3, public z: vec3) {

    }

    mul(v: vec3): vec3 {
        return new vec3(this.x.x * v.x + this.y.x * v.y + this.z.x * v.z,
            this.x.y * v.x + this.y.y * v.y + this.z.y * v.z,
            this.x.z * v.x + this.y.z * v.y + this.z.z * v.z);
    }
    mulf(f: number): mat3 {
        return new mat3(this.x.mulf(f), this.y.mulf(f), this.z.mulf(f));
    }
}

const m3 = new mat3( new vec3(0.00,  0.80,  0.60), new vec3(-0.80,  0.36, -0.48), new vec3(-0.60, -0.48,  0.64 ));
const m3i = new mat3( new vec3(0.00, -0.80, -0.60), new vec3(0.80,  0.36, -0.48), new vec3(0.60, -0.48,  0.64));
// const mat2 m2 = mat2(  0.80,  0.60,
//     -0.60,  0.80 );
// const mat2 m2i = mat2( 0.80, -0.60,
//      0.60,  0.80 );

// function hash1( vec2 p ): number {
//     p  = 50.0*fract( p*0.3183099 );
//     return fract( p.x*p.y*(p.x+p.y) );
// }

// float hash1( float n )
// {
//     return fract( n*17.0*fract( n*0.3183099 ) );
// }

// vec2 hash2( vec2 p ) 
// {
//     const vec2 k = vec2( 0.3183099, 0.3678794 );
//     float n = 111.0*p.x + 113.0*p.y;
//     return fract(n*fract(k*n));
// }

export function noised( x: vec3 ): vec4
{
    let p = x.floor();
    let w = x.fract();

    let u = w.mul(w).mul(w).mul(w.mulf(6.0).subf(15.0)).addf(10.0);
    let du = w.mul(w).mulf(30.0).mul(w.subf(2.0)).addf(1.0);

    let a = myRandomMagic( p.add(new vec3(0,0,0)) );
    let b = myRandomMagic( p.add(new vec3(1,0,0)) );
    let c = myRandomMagic( p.add(new vec3(0,1,0)) );
    let d = myRandomMagic( p.add(new vec3(1,1,0)) );
    let e = myRandomMagic( p.add(new vec3(0,0,1)) );
    let f = myRandomMagic( p.add(new vec3(1,0,1)) );
    let g = myRandomMagic( p.add(new vec3(0,1,1)) );
    let h = myRandomMagic( p.add(new vec3(1,1,1)) );

    let k0 =   a;
    let k1 =   b - a;
    let k2 =   c - a;
    let k3 =   e - a;
    let k4 =   a - b - c + d;
    let k5 =   a - c - e + g;
    let k6 =   a - b - e + f;
    let k7 = - a + b + c - d + e - f - g + h;

    return new vec4( -1.0 + 2.0 * ( k0 + k1 * u.x + k2 * u.y + k3 * u.z + k4 * u.x * u.y + k5 * u.y * u.z + k6 * u.z * u.x + k7 * u.x * u.y * u.z ),
                du.mul( new vec3( k1 + k4 * u.y + k6 * u.z + k7 * u.y * u.z,
                                k2 + k5 * u.z + k4 * u.x + k7 * u.z * u.x,
                                k3 + k6 * u.x + k5 * u.y + k7 * u.x * u.y ) ) );
}

export function fbm(x: vec3, octaves: number ): vec4
{
    let f = 1.98;  // could be 2.0
    let s = 0.49;  // could be 0.5
    let a = 0.0;
    let b = 0.5;
    let d = new vec3(0.0, 0.0, 0.0);
    let  m = new mat3(new vec3(1.0,0.0,0.0), new vec3(0.0,1.0,0.0), new vec3(0.0,0.0,1.0));
    for (let i=0; i < octaves; i++) {
        let n = noised(x);
        a += b*n.x;          // accumulate values
        // d += b*m*n.yzw;      // accumulate derivatives
        // b *= s;
        // x = f*m3*x;
        // m = f*m3i*m;
        d = d.add(m.mul(n.yzw).mulf(b));
        b *= s;
        // x = f*m.mul(x);
    }
    return new vec4(a, d);
}

function myRandomMagic( p: vec3 ): number
{
    return 0;
}
