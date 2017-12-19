const route = require('koa-route');
const fs = require('fs');

const filePath = `${__dirname}/../people.json`;

if (!fs.existsSync(filePath)){
  fs.writeFileSync(filePath, JSON.stringify({}));
}
const people = JSON.parse(fs.readFileSync(filePath));

module.exports = [
  route.get('/face/:id', (ctx, id) =>{
    ctx.body = {
      success: true,
      person: people[id]
    };
  }),
  route.post('/face/:id', (ctx, id) => {
    const person = ctx.body.person;
    people[id] = person;

    fs.writeFileSync(filePath, JSON.stringify(people));
  }),
  route.put('/face/:id', (ctx, id) => {
    const person = ctx.body.person;
    people[id] = person;

    fs.writeFileSync(filePath, JSON.stringify(people));
  }),
  route.delete('/face/:id', (ctx, id) => {
    delete people[id];
    fs.writeFileSync(filePath, JSON.stringify(people));
  })
];