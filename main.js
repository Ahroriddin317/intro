'use strict';

const http = require('http');

const port = 9999;
const statusNotFound = 404;
const statusBadRequest = 400;
const statusOk = 200;
let posts = [];
let nextId = 1;

const sendResponse = (response, {status = statusOk, headers = {}, body = null}) => {
  Object.entries(headers).forEach(([key, value]) => {
    response.setHeader(key, value);
  });
  response.writeHead(status);
  response.end(body);
};

const sendJSON = (response, body) => {
  sendResponse( response, {
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
};

const methods = new Map();
methods.set('/posts.get', ({ response }) => {
  sendJSON(response, posts);
});
methods.set('/posts.getById', ({response, searchParams}) => {
  const id = searchParams.get('id');
  if (!id || Number.isNaN(+id)) {
    sendResponse(response, { status: statusBadRequest });
    return;
  }

  const post = posts.find((item) => {
    return item.id === +id;
  });
  typeof(post) !== 'undefined' ? sendJSON(response, post) : sendResponse(response, { status:statusNotFound });
});
methods.set('/posts.post', ({response, searchParams}) => {
  const content = searchParams.get('content');
  if (!content) {
    sendResponse(response, { status: statusBadRequest});
    return;
  }

  const post = {
    id: nextId++,
    content,
    created: Date.now(),
  };

  posts.unshift(post);
  sendJSON(response, post);
});
methods.set('/posts.edit', ({response, searchParams}) => {
  const id = searchParams.get('id');
  const content = searchParams.get('content');
  if (!id || !content || Number.isNaN(+id)) {
    sendResponse(response, { status: statusBadRequest });
    return;
  }

  posts = posts.map((item) => {
    return item.id === +id ? {...item, content} : item;
  });

  const post = posts.find((item) => {
    return item.id === +id;
  });

  typeof (post) !== 'undefined' ? sendJSON(response, post) : sendResponse(response, { status: statusNotFound });
});
methods.set('/posts.delete', ({response, searchParams}) => {
  const id = searchParams.get('id');
  if (!id || Number.isNaN(+id)) {
    sendResponse(response, { status: statusBadRequest });
    return;
  }

  const post = posts.find((item) => {
    return item.id === +id;
  });
  const postIndex = posts.findIndex((item) => item.id === +id);
  posts.splice(postIndex, 1);
  typeof (post) !== 'undefined' ? sendJSON(response, post) : sendResponse(response, { status: statusNotFound });
});

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