'use strict';

const http = require('http');

const port = 9999;
const statusNotFound = 404;
const statusBadRequest = 400;
const statusOk = 200;
const posts = [];
let nextId = 1;

const sendResponse = (response, {status = statusOk, headers = {}, body = null}) => {
  Object.entries(headers).forEach(([key, value]) => {
    response.setHeader(key, value);
  });
  response.writeHead(status);
  response.end(body);
}

const sendJSON = (response, body) => {
  sendResponse( response, {
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

const methods = new Map();
methods.set('/posts.get', ({ response }) => {
  sendJSON(response, posts);
});
methods.set('/posts.getById', ({response, searchParams}) => {
  const id = searchParams.get('id');
  if (!searchParams.has('id') || Number.isNaN(+id)) {
    sendResponse(response, { status: statusBadRequest });
    return;
  }

  const post = posts.find((item) => {
    return item.id === +id;
  });
  sendJSON(response, post);
});
methods.set('/posts.post', ({response, searchParams}) => {
  if(!searchParams.has('content')) {
    sendResponse(response, { status: statusBadRequest});
    return;
  }

  const content = searchParams.get('content');

  const post = {
    id: nextId++,
    content,
    created: Date.now(),
  };

  posts.unshift(post);
  sendJSON(response, post);
});
methods.set('/posts.edit', (request, response) => {});
methods.set('/posts.delete', (request, response) => {});

const server = http.createServer((request, response) => {
  const {pathname, searchParams} = new URL(request.url, `http://${request.headers.host}`);

  const method = methods.get(pathname);
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