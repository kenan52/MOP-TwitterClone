var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var mongo = require('mongodb').MongoClient;
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('express-handlebars');
var moment = require('moment');
var routes = require('./routes/index');
var app = express();

// view engine setup
app.engine('hbs', hbs({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layouts/',
  helpers: {
    getUserImage: (author) => {
      mongo.connect('mongodb://localhost:27017/test', async (err, db) => {
        if (err) throw err;
        try {
          let dbCollection = db.collection('users');
          let user = await dbCollection.findOne({
            author
          });
          return user.image;
          // return image url from db;
        } catch (error) {
          console.error(error);
        }
      });
    },
    getRelativeTime: (time) => {
      return moment(time, 'YYYYMMDD').fromNow();
    }
  }
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
