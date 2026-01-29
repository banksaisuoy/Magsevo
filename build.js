const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/main.jsx'],
  bundle: true,
  outfile: 'public/js/magsevo-bundle.js',
  loader: { '.jsx': 'jsx', '.js': 'jsx' },
  minify: true,
  sourcemap: true,
  define: { 'process.env.NODE_ENV': '"production"' },
}).catch(() => process.exit(1));
