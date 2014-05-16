var ex_worker = {};

ex_worker.start = function() {
	var console_hi = function(){
		console.log('hi');
		return {code: 'OK'};
	};

	console_hi();
};

module.exports = ex_worker; 