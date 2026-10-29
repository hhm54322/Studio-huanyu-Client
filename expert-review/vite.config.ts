import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
 root:fileURLToPath(new URL('.',import.meta.url)),base:'/expert-review/',publicDir:false,
 plugins:[vue(),tailwindcss()],resolve:{alias:{'@':fileURLToPath(new URL('../src',import.meta.url))}},
 build:{outDir:'dist',emptyOutDir:true,sourcemap:false},
 server:{host:'127.0.0.1',port:5190,strictPort:true,proxy:{'/api/expert':{target:process.env.EXPERT_API_TARGET||'http://127.0.0.1:3000',changeOrigin:true}}},
})
