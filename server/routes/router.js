import express from 'express';
import * as UserRoute from './userRoute.js';
import * as ImagesRoute from './imagesRoute.js';
import * as NotificationsRoute from './notificationsRoute.js';
import * as BugsRoute from './bugsRoute.js';
import * as CommentsRoute from './commentsRoute.js';

const router = express.Router();

router.use('/user', UserRoute.default);
// router.use('/images', ImagesRoute.default);
router.use('/notifications', NotificationsRoute.default);
router.use('/bugs', BugsRoute.default);
router.use('/bugs', CommentsRoute.default);

export default router;