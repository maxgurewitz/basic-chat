window.$ = require('jquery');
var React = require('react');

var Chat = React.createClass({
  render: function () {
    return (
      <div className="chat">
      </div>
    );
  }
});
React.render(<Chat />, $('#content')[0])
