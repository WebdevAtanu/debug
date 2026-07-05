import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import expressStaticGzip from 'express-static-gzip';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import xss from 'xss-clean';
import cors from 'cors';
import compression from 'compression';
import httpResponder from './middleware/httpResponder.js';
import errorHandler from './middleware/errorHandler.js';
import passport from 'passport';
import sgMail from '@sendgrid/mail';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();
const PORT = process.env.PORT || 5000;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// connect to database
mongoose
  .connect(process.env.DB_CONNECT_ATLAS)
  .then(() => console.log('Connected to database'))
  .catch(() => console.log('Failed to connect to database.'));

// express settings
const app = express();
app.set('env', process.env.NODE_ENV);
app.set('json spaces', 2);

// middlewares
app.use(helmet()); // security headers
app.use(
  cors({
    credentials: true,
  })
);
app.use(httpResponder);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize()); // sanitization against NoSQL Injection Attacks
app.use(xss()); // sanitize data
// rateLimiter
app.use(
  '/api/',
  rateLimit({
    windowMs: 25 * 60 * 1000,
    max: 500,
    message: { error: 'Too many requests!, please try again after 25mins' },
  })
);
app.use(morgan('dev'));

app.use(compression());
// Passport middleware
import('./middleware/passport-auth.js');
app.use(passport.initialize());

// routes
import notificationsRoute from './routes/notificationsRoute.js';
import userRoute from './routes/userRoute.js';
// import imagesRoute from './routes/imagesRoute.js';
import bugsRoute from './routes/bugsRoute.js';
import commentsRoute from './routes/commentsRoute.js';

app.use(
  '/api/notifications',
  passport.authenticate('jwt', { session: false, failWithError: true }),
  notificationsRoute,
  (_err, _req, res, _next) => {
    return res.notAuthorized({ error: 'Unauthorized' });
  }
);
app.use(
  '/api/user',
  userRoute,
  // imagesRoute
);

// failWithError: https://github.com/jaredhanson/passport/issues/458
app.use(
  '/api/bugs',
  passport.authenticate('jwt', { session: false, failWithError: true }),
  bugsRoute,
  commentsRoute,
  (_err, _req, res, _next) => {
    return res.notAuthorized({ error: 'Unauthorized' });
  }
);

// finally handle errors
app.use(errorHandler);
app.use('/api/*', function (req, res) {
  res.notImplemented({ error: 'Not Implemented.' });
});

// Server Side Routing
// If no API routes are hit, send the React app
app.use('/', expressStaticGzip('client/build'));
if (process.env.NODE_ENV === 'production') {
  app.get('/*', function (req, res) {
    res.sendFile(path.join(process.cwd(), '../client/build/index.html'), function (
      err
    ) {
      if (err) {
        res.status(500).send(err);
      }
    });
  });
}

// https://stackoverflow.com/questions/18856190/use-socket-io-inside-a-express-routes-file/57737798#57737798
const server = createServer(app);
server.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}/`)
);
const io = new Server(server);

io.on('connection', socket => {
  console.log('NEW CLIENT');
  socket.on('send-notification', () => {
    console.log('NEW NOTIFICATION');
    socket.broadcast.emit('received-notification', {
      message: 'New notifications',
    });
  });
});
