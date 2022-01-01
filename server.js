const http = require("http");
const fs = require('fs').promises;
const path = require('path');
const httpProxy = require('http-proxy');
const host = 'localhost';
const port = 9999;
const fileMap = {};
let bUseCache = true;
let destinationURL = "";
var proxyURL = "";
const destinationsDirName = `/destinations`;
process.argv.forEach((val, index) => {
  if (index < 1){
    return;
  }
  var aArguments = val.split("=");
if (aArguments.length < 1){
  return;
}

if (aArguments[0] === "cache"){
bUseCache = !(aArguments[1] === "false");
} else if (aArguments[0] === 'destination') {
  destinationURL = aArguments[2];
}
});

const serveProxy = function(req, res){
  console.log('\x1b[33m%s\x1b[0m', `Serving proxy at ${destinationURL}`);
  req.url = proxyURL;
  proxy.web(req, res);
};
const checkDestination = function(req, fileName){
  const resolvedPath = path.resolve(__dirname, path.dirname(req.url));
  let destinationPattern = new RegExp(destinationsDirName, 'g');
  if (destinationPattern.test(resolvedPath)){
  let resolvedPathSubstring = resolvedPath.substring(destinationPattern.lastIndex + destinationsDirName.length, resolvedPath.length);
proxyURL = resolvedPathSubstring + (fileName === "" ? "" : ("/" + fileName));
            console.log('\x1b[31m%s\x1b[0m', `Proxy URL ${proxyURL}`);
    return true;
  }
  return false;
};
const requestListener = function(req, res){
    const urlParamPattern = /\w\?+(?=\w)/g;
    let fileName = path.basename(req.url) === "" ? "index.html" : path.basename(req.url);
    fileName = (path.extname(req.url) && path.extname(req.url) !== "") || /^\W/.test(fileName) ? fileName : fileName + "/";
    if (urlParamPattern.test(fileName)){
          console.log('\x1b[31m%s\x1b[0m', `URL parameters detected`, urlParamPattern.lastIndex);
    let paramStringArray = [];
    const paramsString = fileName.substring(urlParamPattern.lastIndex, fileName.length);
    fileName = fileName.substring(0, urlParamPattern.lastIndex - 1);
    if (paramsString){
      paramStringArray = paramsString.split('&');
      console.log('\x1b[31m%s\x1b[0m', `url params: ${paramStringArray}`);
    }
  }
    console.log('\x1b[31m%s\x1b[0m', `requested file: ${fileName}`);
  if (checkDestination(req, fileName)){
    serveProxy(req, res);
    return;
  }
if (bUseCache && fileMap[fileName]){
  console.log(`file ${fileName} read from cache`);
respond(res, fileMap[fileName], fileName);
} else {
  fs.readFile(path.join(__dirname, path.dirname(req.url), fileName))
    .then(contents => {
fileMap[fileName] = contents;
  console.log(`file ${fileName} read from file system`);
respond(res, fileMap[fileName], fileName);
    }).catch(err => {
      console.log(`promise rejected: ${err}`);
    res.writeHead(500);
  //    res.end(`Could not open file ${fileName}`);
  res.end(`Could not open file ${fileName}`);
    });
}
};
function respond(response, fileContent, filePath){
  const extname = path.extname(filePath);
  var contentType;
    switch (extname) {
      case '.html':
          contentType = 'text/html';
          break;
      case '.txt':
            contentType = 'text/plain';
            break;
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.wav':
            contentType = 'audio/wav';
            break;
        case '.ico':
            contentType = 'image/x-icon';
            break;
        case '.xml':
            contentType = 'application/xml';
            break;
        default:
          contentType = 'text/html';
    }
          response.setHeader("Content-Type", contentType);
          response.writeHead(200);
          response.end(fileContent);
};

const proxy = httpProxy.createProxyServer({
  target: {
  protocol: 'https:',
  host: destinationURL,
  port: 443
},
changeOrigin: true
});
proxy.on('error', function (err, req, res) {
  console.log(JSON.stringify(err));
});
proxy.on('proxyRes', function (proxyRes, req, res) {
    console.log('\x1b[31m%s\x1b[0m', 'Request URL', req.url);
});

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
  if (bUseCache){
    console.log("Cache enabled");
  } else {
   console.log("Cache disabled");
  }
});
