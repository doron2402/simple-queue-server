var http = require("http");
var url = require("url");
var path = require("path");
var fs = require("fs");
if (!global.Queue) {
	global.Queue = {};
}
global.Queue.setting = require('./config');
global.Queue.workers = require('./workers');
var port = global.Queue.setting.port;

http.createServer(function(request, response) {

  var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri);

  path.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += 'index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }

      response.writeHead(200);
      response.write(file, "binary");
      response.end();
    });
  });
}).listen(parseInt(port, 10));

//Check for task
global.Queue.check_for_task = function(req, res, next) {
	for (var i=0; i<global.Queue.tasks.length; i++) {
		for(var j=0; j<global.Queue.tasks[i]; j++) {

		}
	}
};

global.Queue.check_for_task();


console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");