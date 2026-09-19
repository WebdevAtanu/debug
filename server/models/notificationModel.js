import db from '../config/database.js';

class Notification {
  static async findById(id) {
    return await db('notifications').where({ id }).first();
  }

  static async findByUserId(userId) {
    return await db('notifications')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc');
  }

  static async findByBugId(bugId) {
    return await db('notifications')
      .where({ bug_id: bugId })
      .orderBy('created_at', 'desc');
  }

  static async create(notificationData) {
    const { message, user_id, bug_id } = notificationData;
    
    const [notificationId] = await db('notifications').insert({
      message,
      read: false,
      user_id,
      bug_id,
    });
    
    const notification = await db('notifications').where({ id: notificationId }).first();
    return notification;
  }

  static async markAsRead(id) {
    const [notification] = await db('notifications')
      .where({ id })
      .update({ read: true })
      .returning('*');
    
    return notification;
  }

  static async markAllAsRead(userId) {
    return await db('notifications')
      .where({ user_id: userId })
      .update({ read: true });
  }

  static async deleteById(id) {
    return await db('notifications').where({ id }).del();
  }
}

export { Notification };