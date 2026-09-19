import passport from 'passport';
import userRoute from './userRoute.js';
import notificationsRoute from './notificationsRoute.js';
import bugsRoute from './bugsRoute.js';
import commentsRoute from './commentsRoute.js';
import * as BugsController from '../controllers/BugsController.js';

export const setupRoutes = (app) => {
  // Public bug suggestions route
  app.get('/api/bugs/suggestions', BugsController.getSuggestions);

  // Notifications routes (protected)
  app.use(
    '/api/notifications',
    passport.authenticate('jwt', { session: false, failWithError: true }),
    notificationsRoute,
    (_err, _req, res, _next) => {
      return res.notAuthorized({ error: 'Unauthorized' });
    }
  );

  // User routes (mixed public and protected)
  app.use('/api/user', userRoute);

  // Bugs and Comments routes (protected)
  app.use(
    '/api/bugs',
    passport.authenticate('jwt', { session: false, failWithError: true }),
    bugsRoute,
    commentsRoute,
    (_err, _req, res, _next) => {
      return res.notAuthorized({ error: 'Unauthorized' });
    }
  );
};

export default setupRoutes;
