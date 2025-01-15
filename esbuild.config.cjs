const esbuild = require('esbuild');
const sveltePlugin = require('esbuild-svelte');
const sveltePreprocess = require('svelte-preprocess');

esbuild.build({
  entryPoints: ['ts/game/Game.ts', 'ts/level/LevelEditor.ts', 'ts/rider/RiderEditor.ts'],
  bundle: true,
  outdir: 'static',
  entryNames: '[name]', // This ensures the output files are named after the entry points
  globalName: 'Main',
  plugins: [
    sveltePlugin({
      preprocess: sveltePreprocess({
        typescript: true,
      }),
      compileOptions: {
      },
    }),
  ],
  logLevel: 'error',
  // logLimit: 0  // Suppresses all log outputs
  minify: true,
  sourcemap: true,
}).catch(() => process.exit(1));
