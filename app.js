var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var conf = require('./conf.js');
var redis = require('redis');
var RedisStore = require('connect-redis')(session);
var log = require('./logger');
var http = require('http');

// redis client
var client = redis.createClient();
client.select(conf.redisSelect());

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'Gini.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// redis session
app.use(session({
    secret : 'keyboard cat',
    resave : false,
    savaUnitinialized : true,
    store : new RedisStore({
        host : conf.redisAddr(),
        port : conf.redisPort(),
        ttl : 60*60,
        client : client
    })
}));

// initialize route
require('./routes/api').initApp(app);

// Server configuration
app.set('port', 8000);
var server = http.createServer(app);
server.listen(app.get('port'));
log.info('Server Start!! Port is ' + app.get('port'));

module.exports = app;

