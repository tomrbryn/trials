const esbuild = require('esbuild');
const sveltePlugin = require('esbuild-svelte');
const sveltePreprocess = require('svelte-preprocess');

esbuild.build({
  entryPoints: ['ts/Game.ts', 'ts/editor/Editor.ts'],
  bundle: true,
  outdir: 'static',
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
