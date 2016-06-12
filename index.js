/*
	Usage Example:


dssrv.vhostrouter = require(express-domainrouter')


// Optain vhost config
dssrv.vhostrouter.locals.vhosts = worker.options.vhosts || [ 'default' ]
dssrv.vhostrouter.locals.vhosts.forEach(function(domain) {
    dssrv.debug('vhosts Registered: %s , %s', domain , 'replace')
    // dssrv.vhostrouter.locals.hostDictionary[domain] = replace
})

// dssrv.debug('vhosts Registered: %s , %s', 'default' , 'videoreplace')
// var apiAPP = require(worker.options.expressApps.bla.app)(worker.options.expressApps.bla.config)

// dssrv.vhostrouter.locals.hostDictionary['domain'] = apiAPP



*/


var express = require('express')
var vhostrouter = express('dssrv:worker:'+process.pid+':vhosts');
vhostrouter.locals.hostDictionary = vhostrouter.locals.hostDictionary || {}
vhostrouter.use(
	function replaceDevHosts(req, res, next) {
		// replace dev test hosts
		req.headers.originalHost = req.headers.Host || req.headers.host
		req.headers.Host = req.headers.originalHost.replace('.new','')
		req.headers.host = req.headers.originalHost.replace('.new','')
		req.headers.Host = req.headers.originalHost.replace('.local','')
		req.headers.host = req.headers.originalHost.replace('.local','')
		next()
	}, function vhost(req, res, next){
		  var debug = require('debug')('dssrv:worker:'+process.pid+':Vhost');
		  debug('VHOSTS EXEC: ' + JSON.stringify(req.headers))
		  // debug('VHOSTS EXEC: ' + JSON.stringify(req.app.locals.hostDictionary))
		  // console.log(req.app.locals.hostDictionary)
		  if (!req.headers.host) return next();
		  var host = req.headers.host.split(':')[0];
		  if (req.trustProxy && req.headers["x-forwarded-host"]) {
		    host = req.headers["x-forwarded-host"].split(':')[0];
		  }
		  var server = req.app.locals.hostDictionary[host];
		  if (!server){
		    server = req.app.locals.hostDictionary['*' + host.substr(host.indexOf('.'))];
		  }

		  if (!server){ 
		    server = req.app.locals.hostDictionary['default'];
		  }

		  // console.log(JSON.stringify(Vhost.hostDictionary))
		  // console.log()

		  if (!server) return next();
		  if ('function' == typeof server) return server(req, res, next);
		  // server.emit('request', req, res);
		  next()
	}
);

module.exports = vhostrouter
