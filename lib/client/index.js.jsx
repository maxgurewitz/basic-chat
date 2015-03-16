window.$ = require('jquery');
var React = require('react');
var hl = require('highland');
var io = require('socket.io-client');

var ChatRoom = React.createClass({
  getInitialState: function () {
    return { messages: [] }
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
      .each(function (msg) {
        self.setState({ messages: self.state.messages.concat([msg]) });
      });
  },
  render: function () {

    var messages = this.state.messages.map(function (msg) {
      return (<p> { msg } </p>);
    });

    return (
      <div className='chat-room'>
        { messages }
        <input type='text' id='js-message'></input>
        <button id='js-send-message'> Send </button>
      </div>
    );
  }
});

React.render(<ChatRoom />, $('#content')[0])
