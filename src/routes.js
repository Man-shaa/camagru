const fs = require('fs');
const url = require('url');
const path = require('path');

const userController = require('./controllers/userController');

// Handle routes
const router = async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;


  if (pathname === '/')
  {
    serveStaticFile(path.join(__dirname, '../public/pages/index.html'), 'text/html', res);
  }
  else if (pathname === '/signup' && method === 'POST')
  {
		await handleSignUp(req, res);
  }
  else if (pathname === '/signin' && method === 'POST')
  {
    await handleSignIn(req, res);
  }
  else if (pathname === '/homepage' && method === 'GET')
  {
    serveStaticFile(path.join(__dirname, '../public/pages/homepage.html'), 'text/html', res);
  }
  else if (pathname === '/users' && method === 'GET')
    await userController.getUsers();
  else if (pathname.match(/\.css$/))
    serveStaticFile(path.join(__dirname, '../public', pathname), 'text/css', res);
  else
  {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Page Not Found');
  }
};

const parseFormData = (body) => {
  return body.split("&").reduce((acc, pair) => {
    const [key, value] = pair.split("=");
    acc[decodeURIComponent(key)] = decodeURIComponent(value);
    return acc;
  }, {});
};

const handleSignUp = async (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    req.body = parseFormData(body);
    await userController.createUser(req.body, res);
  });
};

const handleSignIn = async (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    req.body = parseFormData(body);
    await userController.signin(req.body, res);
  });
}

const serveStaticFile = (filePath, contentType, res) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
};

module.exports = {
	router
};