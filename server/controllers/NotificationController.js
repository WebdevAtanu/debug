import Joi from 'joi';
import { User } from '../models/userModel.js';
import { Bug } from '../models/bugModel.js';
import { Notification } from '../models/notificationModel.js';

/**
 * @route GET /api/notifications
 * @type RequestHandler
 */
export const getNotifications = async (req, res) => {
  const MAX_ITEMS = 10;
  const page = parseInt(req.query.page) - 1 || 0;

  const notifications = await Notification.findByUserId(req.user.id);

  res.send({
    totalDocs: notifications.length,
    totalPages: Math.ceil(notifications.length / MAX_ITEMS),
    data: notifications.slice(MAX_ITEMS * page, MAX_ITEMS * page + MAX_ITEMS),
  });
};

/**
 * @route POST /api/notifications/mentions/:bugId
 * @type RequestHandler
 */
export const mentionPeople = async (req, res) => {
  const { error, value } = Joi.object({
    mentions: Joi.array().items(Joi.string()).required(),
  }).validate(req.body);

  if (error) {
    return res.unprocessable({ error: error.details[0].message });
  }

  // Simplified for MySQL migration - mentions would need separate table
  res.ok({ message: 'Mentions feature simplified for MySQL migration' });
};
