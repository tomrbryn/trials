const esbuild = require('esbuild');
const sveltePlugin = require('esbuild-svelte');
const sveltePreprocess = require('svelte-preprocess');

esbuild.build({
  entryPoints: ['ts/game/Game.ts', 'ts/editor/Editor.ts'],
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
  minify: true,
  sourcemap: true,
}).catch(() => process.exit(1));
