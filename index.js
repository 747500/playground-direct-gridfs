
'use strict';

var http = require('http');

var when = require('when');

var mongo = require('mongodb');

var db = new mongo.Db('test', new mongo.Server('localhost', 27017), { safe: false });

var ok;

ok = when.promise(function (resolve, reject) {
	db.open(function(err, db) {
		if (err) return reject(err);
		resolve(db);
	});
});

ok = ok.then(function (db) {

	var httpserver = http.createServer(function (req, res) {
		var oid = new mongo.ObjectID('5339e2df231d5b9cd36c409f');
		var gs = new mongo.GridStore(db, oid, 'r');
		gs.open(function (err, gs) {
			if (err) {
				res.writeHead(500, { 'Content-Type': 'text/plain' });
				res.end(err.stack || err);
				return;
			}
			res.writeHead(200, { 'Content-Type': 'application/binary' });
			gs.stream(true).pipe(res);
		});
	});

	return when.promise(function (resolve, reject) {
		httpserver.listen(1337, '127.0.0.1', function (err) {
			if (err) return reject(err);
			resolve(httpserver);
		});
	});
});

ok = ok.then(function (httpserver) {
	console.log('Server running at http://127.0.0.1:1337/');
});

ok.done();
