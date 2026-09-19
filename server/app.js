import express from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';
import compression from 'compression';
import expressStaticGzip from 'express-static-gzip';
import passport from 'passport';
import httpResponder from './middleware/httpResponder.js';
import errorHandler from './middleware/errorHandler.js';
import { config } from './config/index.js';
import { setupRoutes } from './routes/index.js';
import('./middleware/passport-auth.js');


const app = express();
app.use(helmet());
app.use(cors(config.cors));
app.use(httpResponder);

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10kb' }));

app.use(xss());

app.use('/api/', rateLimit(config.rateLimit));
app.use(morgan('dev'));
app.use(compression());
app.use(passport.initialize());

setupRoutes(app);
app.use(errorHandler);

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});
app.use('/api/*', (req, res) => { res.notImplemented({ error: 'Not implemented route' }); });

app.use('/', expressStaticGzip('client/build'));

if (config.nodeEnv === 'production') {
  app.get('/*', (req, res) => {
    res.sendFile(path.join(process.cwd(), '../client/build/index.html'), (err) => {
      if (err) {
        res.status(500).send(err);
      }
    });
  });
}

export default app;
