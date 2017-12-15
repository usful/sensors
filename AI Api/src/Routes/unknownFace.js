const route = require('koa-route');
const fs = require('fs');

module.exports = (folderDir) => [
  route.post('/unknown/upload', ctx =>{
    const base64Image = ctx.request.body.image;
    if (!base64Image) {
      ctx.body = {success:false};
      return;
    }

    fs.writeFile(`${folderDir}/UnknownFaces/${new Date().valueOf()}.png`, base64Image, 'base64', (err) => {
      if(err)console.log(err);
    });

    ctx.body = {success: true};
  }),
  route.get('/unknown', ctx => {

  })
];