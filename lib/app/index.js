var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var jade = require('jade');

app.use(logger('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('jade', jade.__express);
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(express.static('./public', { index: false }));

app.get('/', function (req, res) {
  res.render('index');
});

module.exports = app;
