'use strict';

const http = require('http');

const port = 9999;
const statusNotFound = 404;
const statusBadRequest = 404;
const statusOk = 200;
const posts = [];
const nextId = 0;

const methods = new Map();
methods.set('/posts.get', ({ response }) => {
  response.writeHead(statusOk, {'Content-Type': 'application/json'});
  response.end(JSON.stringify(posts));
});
methods.set('/posts.getById', (request, response) => {});
methods.set('/posts.post', ({request, searchParams}) => {
  if(!searchParams.has('content')) {
    response.writeHead(statusBadRequest);
    response.end();
    return;
  }

  const content = searchParams.get('content');

  const post = {
    id: nextId++,
    content,
    created: Date.now(),
  };

  post.unshift(post);
  response.writeHead(statusOk, {'Content-Type': 'application/json'});
  response.end(JSON.stringify(post))
});
methods.set('/posts.edit', (request, response) => {});
methods.set('/posts.delete', (request, response) => {});

const server = http.createServer((request, response) => {
  const {pathname, searchParams} = new URL(request.url, `http://${request.headers.host}`);

  const method = methods.get(pathName);
  if (method === undefined) {
    response.writeHead(statusNotFound);
    response.end();
    return;
  }

  const params = {
    request,
    response,
    pathname,
    searchParams,
  };

  method(params);
});

server.listen(port);