const fs = require('fs');
const url = require('url');
const path = require('path');

const userController = require('./controllers/userController');
const passwordResetController = require('./controllers/passwordResetController');

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
  else if (pathname === '/reset_password' && method === 'POST')
  {
    await handlePasswordReset(req, res);
  }
  else if (pathname === '/reset_password_request' && method === 'POST')
  {
    await handlePasswordResetRequest(req, res);
  }
  else if (pathname === '/reset_password_form' && method === 'POST')
  {
    await handleNewPassword(req, res);
  }
  else if (pathname === '/users' && method === 'GET')
    await userController.getUsers();
  else if (pathname === '/check-verification' && method === 'POST')
  {
    await handleCheckVerification(req, res);
  }
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

const handleCheckVerification = async (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    req.body = parseFormData(body);
    await userController.checkVerification(req.body, res);
  });
};

const handleSignUp = async (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    req.body = parseFormData(body);
    await userController.signUp(req.body, res);
  });
};

const handleSignIn = async (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    req.body = parseFormData(body);
    await userController.signIn(req.body, res);
  });
}

const handlePasswordResetRequest = async (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    const formData = parseFormData(body);
    // For now, directly redirect to the reset password form page
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
  });
};

const handleNewPassword = async (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    const formData = parseFormData(body);
    // Here you can handle the logic to update the user's password
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
  });
};

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