import { handler } from './../build/handler.js';
import express from 'express'
import path from 'path'
import fs from 'fs'

/** 최상위 경로 */
const __dirname = path.resolve()
const __filename = path.join(__dirname, 'adapter/server.js')

// C:\study\svelteProject,  C:\study\svelteProject\adapter\server.js

const app = express();

// add a route that lives separately from the SvelteKit app
app.get('/healthcheck', (req, res) => {
    res.end('ok');
});


// let SvelteKit handle everything else, including serving prerendered pages and static assets
app.use(handler);

app.listen(3000, () => {
    console.log('listening on port 3000');
});
