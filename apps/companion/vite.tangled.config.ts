import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
export default defineConfig({
 root:fileURLToPath(new URL('./static',import.meta.url)),
 base:'./',
 publicDir:fileURLToPath(new URL('./public',import.meta.url)),
 plugins:[react()],
 define:{__PIXIE_STATIC__:'true'},
 build:{outDir:fileURLToPath(new URL('./tangled-site',import.meta.url)),emptyOutDir:true},
});
