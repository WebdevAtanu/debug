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


const app = express(); // Initialize Express app
app.use(helmet()); // Security middleware
app.use(cors(config.cors)); // CORS middleware
app.use(httpResponder); // Custom HTTP responder middleware

app.use(cookieParser()); // Parse cookies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.json({ limit: '10kb' })); // Limit request body size

app.use(xss()); // Sanitize data to prevent XSS attacks

app.use('/api/', rateLimit(config.rateLimit)); // Apply rate limiting
app.use(morgan('dev')); // Logging middleware
app.use(compression()); // Compress responses
app.use(passport.initialize()); // Initialize Passport for authentication

setupRoutes(app); // Setup routes
app.use(errorHandler); // Error handling middleware

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});
app.use('/api/*', (req, res) => { res.notImplemented({ error: 'Not implemented route' }); }); // Handle 404 for API routes

app.use('/', expressStaticGzip('client/build')); // Serve static files from the React build directory

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
