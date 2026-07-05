import express from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import compression from 'compression';
import expressStaticGzip from 'express-static-gzip';
import passport from 'passport';
import httpResponder from './middleware/httpResponder.js';
import errorHandler from './middleware/errorHandler.js';
import { config } from './config/index.js';
import { setupRoutes } from './routes/index.js';

// Initialize Express app
const app = express();

// Express settings
app.set('env', config.nodeEnv);
app.set('json spaces', 2);

// Security middleware
app.use(helmet());

// CORS
app.use(cors(config.cors));

// Custom HTTP responder middleware
app.use(httpResponder);

// Body parsing middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10kb' }));

// Security middleware
app.use(mongoSanitize());
app.use(xss());

// Rate limiting
app.use(
  '/api/',
  rateLimit(config.rateLimit)
);

// Logging
app.use(morgan('dev'));

// Compression
app.use(compression());

// Passport initialization
import('./middleware/passport-auth.js');
app.use(passport.initialize());

// Setup routes
setupRoutes(app);

// Error handling
app.use(errorHandler);

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.notImplemented({ error: 'Not Implemented.' });
});

// Serve static files in production
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
