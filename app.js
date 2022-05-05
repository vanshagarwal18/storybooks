const dotenv = require('dotenv');
//Load config-dotenv.config helps to access env variables using process.env
dotenv.config({ path: './config.env' });

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const { engine } = require('express-handlebars');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const connectDB = require('./config/db');
const storyRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');

//PASSPORT CONFIG
require('./config/passport')(passport);

//Connect database
connectDB();

const app = express();

//BODY PARSER
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Override method
app.use(methodOverride('_method'));

//LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//HANDLEBAR HELPERS
const {
  formatDate,
  stripTags,
  truncate,
  editIcon,
  select,
} = require('./helpers/hbs');

//HANDLEBARS
app.engine(
  '.hbs',
  engine({
    helpers: {
      formatDate,
      stripTags,
      truncate,
      editIcon,
      select,
    },
    extname: '.hbs',
    defaultLayout: 'main',
  })
);
app.set('view engine', '.hbs');

//SESSION MIDDLEWARE...make sure session middleware is above passport middleware
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DATABASE,
    }),
  })
);

//PASSPORT MIDDLEWARE
app.use(passport.initialize());
app.use(passport.session());

//Set global var
app.use(function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});

//STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', storyRoutes);
app.use('/stories', require('./routes/stories'));
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
