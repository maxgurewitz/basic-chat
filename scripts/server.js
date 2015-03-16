#!/usr/bin/env node
var app = require('../lib/app');

var server = app.listen(process.env.PORT || 3000, function(err) {
    if (err) { console.log(err) }
});
