window.$ = require('jquery');
window.jQuery = require('jquery');
window._ = require('lodash');
window.hl = require('highland');
require('../../bower_components/bootstrap-sass/assets/javascripts/bootstrap.min.js');

var React = require('react');
var io = require('socket.io-client');

var scrambledChars = ['*', '$', '#', '!', '%', '^'];

var curseWords = ['voldamort', 'yelp']
  .map(function (word) {
    var scrambled = _.times(word.length, function () {
      return _.sample(scrambledChars);
    }).join('');

    return { rgx: new RegExp(word, 'g'), scrambled: scrambled };
  });

var ChatRoom = React.createClass({

  getInitialState: function () {
    return { messages: [], input: "" };
  },

  componentDidMount: function () {
    $('.js-info').popover({
      html: true,
      content: $('.js-info-content')
    });
    
    var socket = io();
    var self = this;

    var clicks = hl('click', $('#js-send-message'));

    var enterPresses = hl('keypress', $('#js-message'))
      .filter(function (e) {
        return e.keyCode === 13;
      });

    // Outgoing messages.
    hl([enterPresses, clicks])
      .merge()
      .throttle(300)
      .map(function () {
        return { message: self.state.input, isMessage: true };
      })
      .filter(isNotBlank)
      .map(symbolizeCurseWords)
      .through(animateMe)
      .each(function (msg) {
        socket.emit('msg', msg);
        self.setState({ input: '' });
      });

    // Incoming messages.
    hl('msg', socket)
      .each(function (msg) {
        self.setState({ messages: self.state.messages.concat([msg]) });
      });
  },

  componentDidUpdate: function() {
    scrollBottom();
  },

  render: function () {
    var self = this;
    var messages = self.state.messages.map(function (msg, i) {
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

    var githubLink = 'https://github.com/maxgurewitz/basic-chat';

    return (
      <div className='chat-room'>
        <h1> Basic Chat </h1>
        <div className = 'message-list well' id = 'js-message-list'>
          { messages }
        </div>
        <div className = 'message-input' >
          <input 
            className = 'well'
            type = 'text' 
            id = 'js-message' 
            onChange = {function (e) { self.setState({input: e.target.value}); }}
            value = {this.state.input}
            >
          </input>

          <a tabindex = '0' role = 'button' className = 'js-info info' 
            data-container = 'body' data-toggle = 'popover' data-placement = 'top' 
            data-trigger = 'focus' href = 'javascript:;'>

            i
          </a>

          <div className = 'js-info-content info-content'>
            Commands:
            <ul>
              <li> animate me <i> query </i> </li>
              <li> image me <i> query </i> </li>
            </ul>
            Source:
            <br></br>
            <a href = { githubLink }> { githubLink }</a>
          </div>

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

    // Map messages onto messages and queries.
    var streamWithQueries = stream.map(function (msg) {
      return msgAndQuery(msg, 'animated', 'animate') ||
        msgAndQuery(msg, 'image') || msg;
    }).flatten();

    // Fork the query stream and map onto images.
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

// Query to image.
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

    // var enterPresses = hl('keypress', $('#js-message'))
    //   .filter(function (e) {
    //     return e.keyCode === 13;
    //   });

    // hl([enterPresses, clicks])
    //   .merge()
    //   .throttle(300)
    //   .map(function () {
    //     return { message: self.state.input, isMessage: true };
    //   })
    //   .filter(isNotBlank)
    //   .map(symbolizeCurseWords)
    //   .through(animateMe)
    //   .each(function (msg) {
    //     socket.emit('msg', msg);
    //     self.setState({ input: '' });
    //   });

