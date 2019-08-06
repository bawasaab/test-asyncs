const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser= require('body-parser');
const logger = require('morgan');
const cors = require('cors');
const db = require('./config/config').mongodbUrl;

// require the token verification middleware
const { verifyToken } = require( './controllers/authController' );

// ROUTERS LOADING STARTS HERE
const indexRouter = require('./routes/index');
// const authRouter = require('./routes').authRouter;

const authRouter = require('./routes/authRouter');
const usersRouter = require('./routes/usersRouter');
const countriesRouter = require('./routes/countriesRouter');
const languagesRouter = require('./routes/languagesRouter');
const communityRouter = require('./routes/communityRouter');
const careReceiverRouter = require('./routes/careReceiverRouter');
const documentRouter = require('./routes/documentRouter');
// ROUTERS LOADING ENDS HERE

const mongoose = require("mongoose");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

// MONGOOSE
mongoose.Promise = global.Promise;
mongoose
  .connect( db, {useNewUrlParser: true})
  .then(() => console.log("Connected to MongoDB..."))
  .catch(err => console.error("Could not connect to MongoDB on port...", err));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', authRouter);

// Custom Middleware for token validation. Place the restricted routes below this line and unrestricted routes above this line
// app.use( verifyToken );

// app.use('/users', [ verifyToken, usersRouter ] );
app.use('/users', usersRouter );
app.use('/countries', countriesRouter);
app.use('/languages', languagesRouter);
app.use('/community', communityRouter);
app.use('/careReceivers', careReceiverRouter);
app.use('/documents', documentRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;