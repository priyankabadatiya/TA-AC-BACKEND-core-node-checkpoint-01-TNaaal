const fs = require("fs");
let http = require("http");
let path = require("path");
let url = require("url");
let qs = require("querystring");


let IndexDir = path.join(__dirname, "index.html");
let aboutDir = path.join(__dirname, "about.html")
let StylesDir = path.join(__dirname, "assetss/stylesheet/style.css");


let ContactDir = path.join(__dirname, "contacts/");

let server = http.createServer(handleRequest);

function handleRequest(req, res) {
  console.log(req.url, req.method)
  var store = "";
  req.on("data", (chunk) => {
    store += chunk;
    // console.log(store);
  });

  req.on("end", () => {
    // console.log(req);
    if (req.method === "GET" && req.url === "/") {
      console.log("Hello")
      fs.readFile(IndexDir, (err, fd) => {
        if (err) {
          res.write("Not found");
        } else {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.write(fd);
        }
        res.end();
      });
    }
    else if (req.url.match('jpg$')) {
      let imgPath = __dirname + '/assetss' + req.url;
      res.writeHead(200, { 'Content-Type': 'image/jpg' });
      return fs.createReadStream(imgPath).pipe(res);
    }

    else if (req.method === "GET" && req.url === "/about") {

      fs.readFile(aboutDir, (err, fd) => {
        console.log(err, fd)
        if (err) {
          res.end("Not found");
        } else {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.write(fd);
          res.end();
        }
      });
    } else if (req.method === "GET" && req.url === "/contact") {
      res.writeHead(201, { "content-type": "text/html" });
      fs.createReadStream("./contacts/contacts.html").pipe(res);

    } else if (req.method === "POST" && req.url === "/form") {
      let parseData = qs.parse(store);
      let name = parseData.name;
      let stringData = JSON.stringify(parseData);

      res.writeHead(201, { "content-type": "text/html" });

      fs.open(ContactDir + name + ".json", "wx", (err, fd) => {
        if (err) {
          console.log(err);
        }
        fs.writeFile(fd, stringData, (err) => {
          console.log(err);
          fs.close(fd, () => {
            res.end(`${name} has created`);
          });
        });

      });
    }else if (req.method === "GET" && req.url === "/search") {
      res.writeHead(201, { "content-type": "text/html" });
      fs.createReadStream("./contacts/search.html").pipe(res);
    } else if (req.method === "POST" && req.url === "/users") {
      let parseData = qs.parse(store);
      let user = parseData.username;
      let userPath = __dirname + '/contacts/' + user + '.json';
      fs.readFile(userPath, (err, user) => {
        if (err) console.log(err);
        res.setHeader("Content-Type", "text/html");
        let parseUser = JSON.parse(user);
        res.end(`
          <h2> ${parseUser.name}</h2>
          <h2> ${parseUser.email}</h2>
          <h2> ${parseUser.username}</h2>
          <h2>${parseUser.age}</h2>
          <h2>${parseUser.bio}</h2>
        `);
      });
    }
    else if (req.method === "GET" && req.url.startsWith("/users")) {
      console.log("working")
      
      const query = url.parse(req.url,true);
      console.log(query,"query")
      let user = query.query.username;
      let userPath = __dirname + '/contacts/' + user + '.json';
      fs.readFile(userPath, (err, user) => {
        if (err) console.log(err);
        res.setHeader("Content-Type", "text/html");
        let parseUser = JSON.parse(user);
        res.end(`
          <h2> ${parseUser.name}</h2>
          <h2> ${parseUser.email}</h2>
          <h2> ${parseUser.username}</h2>
          <h2>${parseUser.age}</h2>
          <h2>${parseUser.bio}</h2>
        `);
      });

    } else if (req.url.match(".css$")) {
      var cssPath = (StylesDir, "assetss", "./assetss/stylesheet/style.css");
      var fileStream = fs.createReadStream(cssPath, "UTF-8");
      res.writeHead(200, { "Content-Type": "text/css" });
      fileStream.pipe(res);
    }
    else if (
      req.method === 'GET' &&
      ['png', 'svg', 'jpg'].includes(req.url.split('.').pop())
    ) {
      console.log(__dirname)
      fs.createReadStream(path.join(__dirname, req.url)).pipe(res);
    } else {
      res.end(`Page not found`)
    }
  });
}

server.listen(5000, () => {
  console.log("server is listening at port 5000")
});
