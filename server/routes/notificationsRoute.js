import * as NotificationController from '../controllers/NotificationController.js';
import express from 'express';

const router = express.Router();

router.get('/', NotificationController.getNotifications);
router.post('/mentions/:bugId', NotificationController.mentionPeople);

export default router;
