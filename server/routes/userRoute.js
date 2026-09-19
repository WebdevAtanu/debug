import express from 'express';
import passport from 'passport';
import * as UserController from '../controllers/UserController.js';
import generateUserToken from '../middleware/generateToken.js';

const router = express.Router();

const passportJWT = passport.authenticate('jwt', { session: false });
const passportGoogle = passport.authenticate('google', { session: false });

router.get(
  '/auth/google',
  passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email'],
  })
);

router.get('/auth/google/callback', passportGoogle, generateUserToken);

router.post('/signup', UserController.signup);
router.post('/login', UserController.login);

router.get('/', passportJWT, UserController.getAllUsers);
router.patch('/pick', passportJWT, UserController.getMultipleByIds);
router.get('/me', passportJWT, UserController.getCurrent);
router.patch('/me/bio', passportJWT, UserController.updateBio);
router.post('/check-auth', passportJWT, UserController.checkAuth);
router.post('/logout', passportJWT, UserController.logout);

router.get(
  '/:username/comments',
  passportJWT,
  UserController.getCommentsByUser
);

router.get(
  '/:username/reactions/count',
  passportJWT,
  UserController.getCollectedReactionsCount
);

router.get(
  '/:username/comments/count',
  passportJWT,
  UserController.getCommentsCountByUser
);

router.get('/:username/bugs', passportJWT, UserController.getBugsByUser);
router.get('/:username', passportJWT, UserController.getByUsername);


router.get('/', passportJWT, UserController.getAllUsers);
router.patch('/pick', passportJWT, UserController.getMultipleByIds);
router.get('/me', passportJWT, UserController.getCurrent);
router.patch('/me/bio', passportJWT, UserController.updateBio);
router.post('/check-auth', passportJWT, UserController.checkAuth);
router.post('/logout', passportJWT, UserController.logout);

router.get(
  '/:username/comments',
  passportJWT,
  UserController.getCommentsByUser
);

router.get(
  '/:username/reactions/count',
  passportJWT,
  UserController.getCollectedReactionsCount
);

router.get(
  '/:username/comments/count',
  passportJWT,
  UserController.getCommentsCountByUser
);

router.get('/:username/bugs', passportJWT, UserController.getBugsByUser);
router.get('/:username', passportJWT, UserController.getByUsername);

export default router;