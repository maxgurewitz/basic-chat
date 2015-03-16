module.exports = function (io) {
  return function (socket) {
    socket.on('msg', function (msg){
      io.emit('msg', msg);
    });
  }
}
