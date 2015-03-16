#!/usr/bin/env node
var socketIo = require('socket.io');
var app = require('../lib/app');
var sockets = require('../lib/app/sockets');

var server = app.listen(process.env.PORT || 3000, function(err) {
  if (err) { console.log(err) }

  var io = socketIo(server);
  io.on('connection', sockets(io));
});

