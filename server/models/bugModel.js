import Joi from 'joi';
import db from '../config/database.js';

const VALID_LABELS = ['bug', 'feature', 'help wanted', 'enhancement'];

class Bug {
  static async findById(id) {
    const bug = await db('bugs')
      .join('users as author', 'bugs.author_id', 'author.id')
      .select(
        'bugs.*',
        'author.name as author_name',
        'author.username as author_username',
        'author.avatarUrl as author_avatarUrl'
      )
      .where('bugs.id', id)
      .first();
    
    if (bug) {
      bug.author = {
        name: bug.author_name,
        username: bug.author_username,
        avatarUrl: bug.author_avatarUrl,
      };
      bug.labels = JSON.parse(bug.labels || '[]');
      bug.reactions = JSON.parse(bug.reactions || '{}');
      delete bug.author_name;
      delete bug.author_username;
      delete bug.author_avatarUrl;
    }
    
    return bug;
  }

  static async findByNumber(number) {
    const bug = await db('bugs')
      .join('users as author', 'bugs.author_id', 'author.id')
      .select(
        'bugs.*',
        'author.name as author_name',
        'author.username as author_username',
        'author.avatarUrl as author_avatarUrl'
      )
      .where('bugs.number', number)
      .first();
    
    if (bug) {
      bug.author = {
        name: bug.author_name,
        username: bug.author_username,
        avatarUrl: bug.author_avatarUrl,
      };
      bug.labels = JSON.parse(bug.labels || '[]');
      bug.reactions = JSON.parse(bug.reactions || '{}');
      delete bug.author_name;
      delete bug.author_username;
      delete bug.author_avatarUrl;
    }
    
    return bug;
  }

  static async findAll(filters = {}) {
    const query = db('bugs')
      .join('users as author', 'bugs.author_id', 'author.id')
      .select(
        'bugs.*',
        'author.name as author_name',
        'author.username as author_username',
        'author.avatarUrl as author_avatarUrl'
      );
    
    if (filters.status) {
      query.where('bugs.status', filters.status);
    }
    
    const bugs = await query.orderBy('bugs.created_at', 'desc');
    
    return bugs.map(bug => {
      bug.author = {
        name: bug.author_name,
        username: bug.author_username,
        avatarUrl: bug.author_avatarUrl,
      };
      bug.labels = JSON.parse(bug.labels || '[]');
      bug.reactions = JSON.parse(bug.reactions || '{}');
      delete bug.author_name;
      delete bug.author_username;
      delete bug.author_avatarUrl;
      return bug;
    });
  }

  static async create(bugData) {
    const { title, description, author_id, labels = [], reactions = {} } = bugData;
    
    // Get next bug number
    const [maxBug] = await db('bugs').max('number as max_number');
    const nextNumber = (maxBug?.max_number || 0) + 1;
    
    const [bugId] = await db('bugs').insert({
      number: nextNumber,
      title,
      description,
      status: 'open',
      labels: JSON.stringify(labels),
      reactions: JSON.stringify(reactions),
      author_id,
    });
    
    const bug = await db('bugs').where({ id: bugId }).first();
    const author = await db('users').where({ id: author_id }).first();
    bug.author = {
      name: author.name,
      username: author.username,
      avatarUrl: author.avatarUrl,
    };
    bug.labels = JSON.parse(bug.labels || '[]');
    bug.reactions = JSON.parse(bug.reactions || '{}');
    
    return bug;
  }

  static async updateById(id, updates) {
    const updateData = { ...updates };
    
    if (updateData.labels) {
      updateData.labels = JSON.stringify(updateData.labels);
    }
    
    if (updateData.reactions) {
      updateData.reactions = JSON.stringify(updateData.reactions);
    }
    
    await db('bugs').where({ id }).update(updateData);
    
    const bug = await db('bugs').where({ id }).first();
    
    if (bug) {
      const author = await db('users').where({ id: bug.author_id }).first();
      bug.author = {
        name: author.name,
        username: author.username,
        avatarUrl: author.avatarUrl,
      };
      bug.labels = JSON.parse(bug.labels || '[]');
      bug.reactions = JSON.parse(bug.reactions || '{}');
    }
    
    return bug;
  }

  static async deleteById(id) {
    return await db('bugs').where({ id }).del();
  }

  static async getNextNumber() {
    const [maxBug] = await db('bugs').max('number as max_number');
    return (maxBug?.max_number || 0) + 1;
  }
}

const validateBug = (bug) => {
  const schema = Joi.object({
    title: Joi.string().min(6).max(100).required(),
    description: Joi.string().min(6).max(1000).required(),
    author_id: Joi.number().optional(),
    status: Joi.string().valid('open', 'closed').default('open'),
    labels: Joi.array()
      .items(Joi.string().valid(...VALID_LABELS))
      .default([]),
  });

  return schema.validate(bug);
};

const validateLabel = (labels) => {
  return Joi.array()
    .items(Joi.string().valid(...VALID_LABELS))
    .validate(labels);
};

const validateReferences = (refs) => {
  const schema = Joi.object({
    references: Joi.array().items(Joi.string().required()).required(),
  });

  return schema.validate(refs);
};

export {
  Bug,
  validateBug,
  validateLabel,
  validateReferences,
};