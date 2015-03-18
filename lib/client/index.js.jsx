window.$ = require('jquery');
window.JQuery = require('jquery');

var React = require('react');
var hl = require('highland');
var io = require('socket.io-client');

var ChatRoom = React.createClass({

  getInitialState: function () {
    return { messages: [] };
  },

  componentDidMount: function () {
    var socket = io();
    var self = this;

    hl('click', $('#js-send-message'))
      .map(function () {
        return $('#js-message').val();
      })
      .each(function (msg) {
        socket.emit('msg', msg);
        return $('#js-message').val('');
      });

    hl('msg', socket)
      .map(symbolizeBadWords)
      .each(function (msg) {
        self.setState({ messages: self.state.messages.concat([msg]) });
      });
  },

  render: function () {
    var messages = this.state.messages.map(function (msg, i) {
      var className = 'message' + (i % 2 === 0 ? ' dark' : ' light');
      return (<div className = { className } > { msg } </div>);
    });

    return (
      <div className='chat-room'>
        <div className = 'message-list' >
          { messages }
        </div>
        <div className = 'message-input' >
          <input type='text' id='js-message'></input>
          <button id='js-send-message' className = 'btn btn-default'> Send </button>
        </div>
      </div>
    );
  }
});

React.render(<ChatRoom />, $('#content')[0]);

function symbolizeBadWords (msg) {
  var badWords = ['fook', 'shot']
    .map(function (word) {
      return new RegExp(word, 'g');
    });

  return badWords.reduce(function (filtered, rgx) {
    return filtered.replace(rgx, '*$#!%^*');
  }, msg);
}
