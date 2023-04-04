import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import path from "path";
import { readFileSync } from "fs";

import dotenv from 'dotenv'

dotenv.config()
dotenv.config({ path: path.resolve(__dirname, `.env-${process.env.NODE_ENV}`) })
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

export default defineConfig({
    plugins: [sveltekit()],

    resolve: {
        alias: [
            { find: "$com", replacement: path.resolve(__dirname, "src/components") },
        ],
    },

    server: {
        port: 7777,
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: '@use "src/variables.scss" as *;',
            },
        },
    },
});
