const Koa = require('koa');
const http = require('http');
const path = require('path');
const app = new Koa();

const httpServer = http.createServer(app.callback()).listen(8080);

app.use(require('koa-static')(path.join(__dirname, '../public')));