import Joi from 'joi';
import db from '../config/database.js';

class Comment {
  static async findById(id) {
    const comment = await db('comments')
      .join('users as author', 'comments.author_id', 'author.id')
      .select(
        'comments.*',
        'author.name as author_name',
        'author.username as author_username',
        'author.avatarUrl as author_avatarUrl'
      )
      .where('comments.id', id)
      .first();
    
    if (comment) {
      comment.author = {
        name: comment.author_name,
        username: comment.author_username,
        avatarUrl: comment.author_avatarUrl,
      };
      comment.reactions = JSON.parse(comment.reactions || '{}');
      delete comment.author_name;
      delete comment.author_username;
      delete comment.author_avatarUrl;
    }
    
    return comment;
  }

  static async findByBugId(bugId) {
    const comments = await db('comments')
      .join('users as author', 'comments.author_id', 'author.id')
      .select(
        'comments.*',
        'author.name as author_name',
        'author.username as author_username',
        'author.avatarUrl as author_avatarUrl'
      )
      .where('comments.bug_id', bugId)
      .orderBy('comments.created_at', 'asc');
    
    return comments.map(comment => {
      comment.author = {
        name: comment.author_name,
        username: comment.author_username,
        avatarUrl: comment.author_avatarUrl,
      };
      comment.reactions = JSON.parse(comment.reactions || '{}');
      delete comment.author_name;
      delete comment.author_username;
      delete comment.author_avatarUrl;
      return comment;
    });
  }

  static async create(commentData) {
    const { content, bug_id, author_id, reactions = {} } = commentData;
    
    const [commentId] = await db('comments').insert({
      content,
      bug_id,
      author_id,
      reactions: JSON.stringify(reactions),
    });
    
    const comment = await db('comments').where({ id: commentId }).first();
    const author = await db('users').where({ id: author_id }).first();
    comment.author = {
      name: author.name,
      username: author.username,
      avatarUrl: author.avatarUrl,
    };
    comment.reactions = JSON.parse(comment.reactions || '{}');
    
    return comment;
  }

  static async updateById(id, updates) {
    const updateData = { ...updates };
    
    if (updateData.reactions) {
      updateData.reactions = JSON.stringify(updateData.reactions);
    }
    
    await db('comments').where({ id }).update(updateData);
    
    const comment = await db('comments').where({ id }).first();
    
    if (comment) {
      const author = await db('users').where({ id: comment.author_id }).first();
      comment.author = {
        name: author.name,
        username: author.username,
        avatarUrl: author.avatarUrl,
      };
      comment.reactions = JSON.parse(comment.reactions || '{}');
    }
    
    return comment;
  }

  static async deleteById(id) {
    return await db('comments').where({ id }).del();
  }
}

const validateComment = (comment) => {
  const schema = Joi.object({
    content: Joi.string().min(6).max(1000).required(),
    bug_id: Joi.number().required(),
    author_id: Joi.number().required(),
    reactions: Joi.object().default({}),
  });

  return schema.validate(comment);
};

export { Comment, validateComment };