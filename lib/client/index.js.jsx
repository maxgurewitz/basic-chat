window.$ = require('jquery');
window.JQuery = require('jquery');
window._ = require('lodash');
window.hl = require('highland');

var React = require('react');
var io = require('socket.io-client');

var scrambledChars = ['*', '$', '#', '!', '%', '^'];

var curseWords = ['fak', 'shet', 'kant', 'deeck', 'ash', 'clock', 'tats']
  .map(function (word) {
    var scrambled = _.times(word.length, function () {
      return _.sample(scrambledChars);
    }).join('');

    return { rgx: new RegExp(word, 'g'), scrambled: scrambled };
  });

var ChatRoom = React.createClass({

  getInitialState: function () {
    return { messages: [] };
  },

  componentDidMount: function () {
    var socket = io();
    var self = this;

    var enterPresses = hl('keypress', $('#js-message'))
      .filter(function (e) {
        return e.keyCode === 13;
      });

    var clicks = hl('click', $('#js-send-message'));

    hl([enterPresses, clicks])
      .merge()
      .throttle(300)
      .map(function () {
        return { message: $('#js-message').val(), isMessage: true };
      })
      .filter(isNotBlank)
      .map(symbolizeCurseWords)
      .through(animateMe)
      .each(function (msg) {
        socket.emit('msg', msg);
        $('#js-message').val('');
      });

    hl('msg', socket)
      .each(function (msg) {
        self.setState({ messages: self.state.messages.concat([msg]) });
      });
  },

  componentDidUpdate: function() {
    scrollBottom();
  },

  render: function () {

    var messages = this.state.messages.map(function (msg, i) {
      var className = 'message js-message' + (i % 2 === 0 ? ' dark' : ' light');

      if (msg.isImage) {
        return (
          <div className = { className } >
            <img src = { msg.src } onLoad = { scrollBottom }> </img>
          </div>
        );
      } else if (msg.isMessage) {
        return (<div className = { className } > { msg } </div>);
      }
    });

    return (
      <div className='chat-room'>
        <h1> Basic Chat </h1>
        <div className = 'message-list well' id = 'js-message-list'>
          { messages }
        </div>
        <div className = 'message-input' >
          <input className = 'well' type = 'text' id = 'js-message'></input>
          <button id = 'js-send-message' className = 'btn btn-default'> Send </button>
        </div>
      </div>
    );
  }
});

$('#js-loading').remove();
React.render(<ChatRoom />, $('#js-content')[0]);

function isNotBlank (msg) {
  return !_.isEmpty(_.trim(msg.message));
}

function symbolizeCurseWords (msg) {
  var message = curseWords.reduce(function (filtered, curseWord) {
    return filtered.replace(curseWord.rgx, curseWord.scrambled);
  }, msg.message);

  msg.message = message;
  return msg;
}

function msgAndQuery (msg, queryType, matchWord) {
  var rgx = new RegExp((matchWord || queryType) + '( me)? (.*)', 'i');
  var match = msg.message.match(rgx);
  if (!match) { return; }
  return [msg, {queryType: queryType, query: match[2], isQuery: true }];
}

function animateMe (stream) {

    var streamWithQueries = stream.map(function (msg) {
      return msgAndQuery(msg, 'animated', 'animate') ||
        msgAndQuery(msg, 'image') || msg;
    }).flatten();

    var imageStream = streamWithQueries
      .where({ isQuery: true })
      .map(googleImages)
      .series()
      .map(function (results) {
        var result = _.sample(results);
        return { src: result.src, isImage: true };
      })
      .errors(function (e, push) {
        push(null, { src: '/images/404.gif', isImage: true }); 
      });

    var messageStream = streamWithQueries
      .fork()
      .where({ isMessage: true });

    return hl([messageStream, imageStream]).merge();
}

function googleImages (query) {

  var params = {
    v: '1.0',
    q: query.query,
    start: '1',
    safe: 'active',
    imgtype: query.queryType || 'animated',
    rsz: '8'
  };

  return hl($.ajax({
    url: 'https://ajax.googleapis.com/ajax/services/search/images?' + $.param(params),
    dataType: 'jsonp',
    method: 'GET'
  })).map(function (res) {
    var googleResults = res.responseData.results;
    return _.map(googleResults, function (gRes) {
      return { src: gRes.unescapedUrl };
    });
  });
}

function scrollBottom () {
  var list = $('#js-message-list');
  list.scrollTop(list[0].scrollHeight);
}

window.simulateFastTyper = function (times) {
  _.times(times, function () {
    $('#js-message').val('gotta type fast');
    $('#js-send-message').click();
  });
};
