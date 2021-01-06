const http = require("http");
const fs = require('fs').promises;
const path = require('path');
const host = 'localhost';
const port = 9999;
const fileMap = {};

const requestListener = function(req, res){
    const fileName = path.basename(req.url) === "" ? "index.html" : path.basename(req.url);
  console.log(`requested file: ${fileName}`);
if (fileMap[fileName]){
  console.log(`file ${fileName} read from cache`);
respond(res, fileMap[fileName], fileName);
} else {
  fs.readFile(path.join(__dirname, "/", fileName))
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
    }
          response.setHeader("Content-Type", contentType);
          response.writeHead(200);
          response.end(fileContent);
};
const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
