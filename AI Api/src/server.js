const Koa = require('koa');
const path = require('path');
const http = require('http');
const bodyParser = require('koa-body');
const app = new Koa();

const httpServer = http.createServer(app.callback()).listen(8080);
console.log('http listening on port 8080!');

app.use(
  bodyParser({
    multipart: true,
    formidable: {
      keepExtensions: true,
      maxFieldsSize: 200 * 1024 * 2014,
    }
  })
);

require('./Routes/Faces').forEach(route => app.use(route));

app.use(require('koa-static')(path.join(__dirname, '../public')));