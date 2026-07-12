import db from '../config/database.js';

class Token {
  static async findById(id) {
    return await db('tokens').where({ id }).first();
  }

  static async findByToken(token) {
    return await db('tokens').where({ token }).first();
  }

  static async findByUserId(userId) {
    return await db('tokens').where({ user_id: userId }).first();
  }

  static async create(tokenData) {
    const { token, user_id } = tokenData;
    
    const [newToken] = await db('tokens').insert({
      token,
      user_id,
    }).returning('*');
    
    return newToken;
  }

  static async deleteById(id) {
    return await db('tokens').where({ id }).del();
  }

  static async deleteByToken(token) {
    return await db('tokens').where({ token }).del();
  }

  static async deleteByUserId(userId) {
    return await db('tokens').where({ user_id: userId }).del();
  }
}

export { Token };