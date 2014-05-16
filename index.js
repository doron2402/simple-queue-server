var http = require("http");
var url = require("url");
var path = require("path");
var fs = require("fs");
if (!global.Queue) {
	global.Queue = {};
}
global.Queue.tasks = [];
global.Queue.setting = require('./config');
global.Queue.workers = require('./workers');
var port = global.Queue.setting.port;

http.createServer(function(request, response) {
	var url_parts = url.parse(request.url, true);
	var query = url_parts.query;
	
	if (query.priority && !isNaN(query.priority) && query.worker){
		global.Queue.check_if_worker_exist(query, function(err, result){
			if (err) {
				console.log(err);				
			}
			
			global.Queue.tasks[query.priority] = {
				worker: query.worker
			};
			
			console.log(global.Queue.tasks);
		});
		
		response.writeHead(200, {"Content-Type": "application/json"});
		response.write("{code: 'OK', message: 'Worker "+ query.worker +"  is in Priority:"+ query.priority +"'}");
		response.end();
	}else {
		response.writeHead(404, {"Content-Type": "application/json"});
      	response.write("{err: 'Missing Params', message: 'worker or priority are required!'}");
      	response.end();
	}

	global.Queue.check_for_task(request, response, function(err, result){
		if (err) {
			console.log(err);
		}
		console.log('done running task, waiting for more... :)');
	});

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
	if (global.Queue && global.Queue.tasks && global.Queue.tasks.length > 0) {
		for (var i=0; i<global.Queue.tasks.length; i++) {
			for(var j=0; j<global.Queue.tasks[i]; j++) {
				console.log(global.Queue.tasks[i]);
			}
		}	
	} 
	
	next(null, {code: 'OK', message: 'No Tasks to run....'});
	
};

global.Queue.check_if_worker_exist = function(args, next) {
	if (!global.Queue.workers[args.worker]) {
		next({err: 'worker is not found'},null);
	}else {
		var worker = global.Queue.workers[args.worker];
		worker.start();
		next(null, {code: 'OK'});
	}

}

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");