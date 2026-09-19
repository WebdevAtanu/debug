import Joi from 'joi';
import {
  Bug,
  validateBug,
  validateLabel,
  validateReferences,
} from '../models/bugModel.js';
import { Notification } from '../models/notificationModel.js';

/**
 * @route GET /api/bugs/
 * @description Get all bugs
 * @type RequestHandler
 */
export const getBugs = async (req, res) => {
  try {
    const bugs = await Bug.findAll(req.query);
    res.ok({ data: bugs || [] });
  } catch (err) {
    res.internalError({
      error: 'Something went wrong while getting bugs',
    });
  }
};

/**
 * @route GET /api/bugs/suggestions
 * @description Get all bugs suggestions, only returns bugId and title
 * @type RequestHandler
 */
export const getSuggestions = async (req, res) => {
  try {
    const bugs = await Bug.findAll();
    const suggestions = bugs.map(bug => ({ number: bug.number, title: bug.title }));
    res.ok({ data: suggestions || [] });
  } catch (err) {
    res.internalError({
      error: 'Something went wrong while getting bugs',
    });
  }
};

/**
 * @route GET /api/bugs/:bugId
 * @description Get bug by bugId
 * @type RequestHandler
 */
export const getBugByNumber = async (req, res) => {
  try {
    const bug = await Bug.findByNumber(req.params.bugId);
    if (!bug)
      return res.notFound({ error: `Bug#${req.params.bugId} Not Found` });

    res.ok({ data: bug });
  } catch (err) {
    res.internalError({
      error: `Something went wrong while getting bug#${req.params.bugId}`,
    });
  }
};

/**
 * @route POST /api/bugs/
 * @description Create new bug
 * @type RequestHandler
 */
export const createBug = async (req, res) => {
  const { error, value } = validateBug(req.body);
  if (error) {
    return res.unprocessable({ error: error.details[0].message });
  }

  try {
    const newBug = await Bug.create({
      title: value.title,
      description: value.description,
      author_id: req.user.id,
      labels: value.labels,
    });

    // send notifications
    await Notification.create({
      message: `New bug created: ${newBug.title}`,
      user_id: req.user.id,
      bug_id: newBug.id,
    });

    res.created({ data: newBug });
  } catch (err) {
    res.internalError({
      error: 'Something went wrong while creating new bug',
    });
  }
};

/**
 * @route PATCH /api/bugs/:bugId
 * @description Update a bug with specified bugId
 * @type RequestHandler
 */
export const updateBug = async (req, res) => {
  try {
    const schema = Joi.object({
      title: Joi.string().min(6).max(100),
      description: Joi.string().min(6).max(10000),
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.unprocessable({ error: error.details[0].message });
    }

    const bug = await Bug.updateById(req.params.bugId, value);
    if (!bug)
      return res.notFound({ error: `Can not update Bug#${req.params.bugId}` });

    res.ok({ data: bug });
  } catch (err) {
    console.error(err);
    res.internalError({
      error: 'Something went wrong while updating bug',
    });
  }
};

/**
 * @route PATCH /api/bugs/:bugId/[close|open]
 * @description Helper function to close/open bug
 * @type RequestHandler
 */
export const toggleBugOpenClose = ({ state }) => {
  return async (req, res) => {
    try {
      const bug = await Bug.findByNumber(req.params.bugId);
      if (!bug)
        return res.notFound({ error: `Bug#${req.params.bugId} Not Found` });

      const updatedBug = await Bug.updateById(bug.id, { status: state ? 'open' : 'closed' });
      if (!updatedBug)
        return res.notFound({ error: `Bug#${req.params.bugId} Not Found` });

      // send notifications
      await Notification.create({
        message: `Bug ${state ? 'opened' : 'closed'}: ${updatedBug.title}`,
        user_id: req.user.id,
        bug_id: updatedBug.id,
      });

      res.ok({ data: updatedBug });
    } catch (err) {
      res.internalError({
        error: 'Something went wrong',
      });
    }
  };
};

/**
 * @route PATCH /api/bugs/:bugId/labels
 * @description Updates the whole label array
 * @type RequestHandler
 */
export const updateLabels = async (req, res) => {
  const { error, value } = validateLabel(req.body.labels);
  if (error) {
    return res.unprocessable({ error: error.details[0].message });
  }

  try {
    const bug = await Bug.findByNumber(req.params.bugId);
    if (!bug)
      return res.notFound({ error: `Bug#${req.params.bugId} Not Found` });

    const updatedBug = await Bug.updateById(bug.id, { labels: value });
    res.ok({ data: updatedBug.labels });
  } catch (err) {
    res.internalError({
      error: 'Something went wrong while updating labels',
    });
  }
};

/**
 * @route PATCH /api/bugs/:bugId/references
 * @description Adds references to bug
 * @type RequestHandler
 */
export const addReferences = async (req, res) => {
  const { error, value } = validateReferences(req.body);
  if (error) {
    return res.unprocessable({ error: error.details[0].message });
  }

  try {
    // Simplified implementation - references feature would need separate table in MySQL
    // For now, just return success
    res.ok({ data: { message: 'References feature simplified for MySQL migration' } });
  } catch (err) {
    console.log(err);
    res.internalError({
      error: 'Something went wrong while referencing bug',
    });
  }
};

/**
 * @route PATCH /api/bugs/:bugId/labels
 * @description Add a label to specified bugId
 * @type RequestHandler
 */
export const addLabel = async (req, res) => {
  const { error, value } = validateLabel(req.body);
  if (error) {
    return res.unprocessable({ error: error.details[0].message });
  }

  try {
    const bug = await Bug.findByNumber(req.params.bugId);
    if (!bug)
      return res.notFound({ error: `Bug#${req.params.bugId} Not Found` });

    const updatedLabels = [...new Set([...bug.labels, ...value])];
    const updatedBug = await Bug.updateById(bug.id, { labels: updatedLabels });
    res.ok({ data: updatedBug });
  } catch (err) {
    res.internalError({
      error: 'Something went wrong while adding new label',
    });
  }
};

/**
 * @route DELETE /api/bugs/:bugId/labels/:name
 * @description Delete a label from specified bugId & label name
 * @type RequestHandler
 */
export const deleteLabel = async (req, res) => {
  try {
    const bug = await Bug.findByNumber(req.params.bugId);
    if (!bug)
      return res.notFound({ error: `Bug#${req.params.bugId} Not Found` });

    const updatedLabels = bug.labels.filter(label => label !== req.params.name);
    const updatedBug = await Bug.updateById(bug.id, { labels: updatedLabels });
    res.ok({ data: updatedBug });
  } catch (err) {
    res.internalError({
      error: 'Something went wrong while deleting label',
    });
  }
};

/**
 * @route PATCH /api/bugs/:bugId/reactions
 * @description PATCH toggle a reaction from specified bugId & reaction name
 * @type RequestHandler
 */
export const addOrRemoveReaction = async (req, res) => {
  const { error, value } = Joi.object({
    emoji: Joi.string().required(),
  }).validate(req.body);
  if (error) {
    return res.unprocessable({ error: error.details[0].message });
  }

  try {
    const bug = await Bug.findByNumber(req.params.bugId);
    if (!bug)
      return res.notFound({ error: `Bug#${req.params.bugId} Not Found` });

    const reactions = { ...bug.reactions };
    const userId = req.user.id;

    if (reactions[value.emoji] && reactions[value.emoji].includes(userId)) {
      reactions[value.emoji] = reactions[value.emoji].filter(id => id !== userId);
      if (reactions[value.emoji].length === 0) {
        delete reactions[value.emoji];
      }
    } else {
      if (!reactions[value.emoji]) {
        reactions[value.emoji] = [];
      }
      reactions[value.emoji].push(userId);
    }

    const updatedBug = await Bug.updateById(bug.id, { reactions });
    res.ok({ data: updatedBug.reactions });
  } catch (err) {
    console.log(err);
    res.internalError({
      error: 'Something went wrong while adding new reaction',
    });
  }
};

/**
 * @route GET /api/bugs/:bugId/reactions
 * @description GET get all reactions
 * @type RequestHandler
 */
export const getReactions = async (req, res) => {
  try {
    const bug = await Bug.findByNumber(req.params.bugId);
    if (!bug)
      return res.notFound({ error: `Bug#${req.params.bugId} Not Found` });

    res.ok({ data: bug.reactions });
  } catch (err) {
    console.log(err);
    res.internalError({
      error: 'Something went wrong while getting reactions',
    });
  }
};

/**
 * @unused
 * @route GET /api/bugs/:bugId/reactions/byuser
 * @description GET get all reactions and group them by userids
 * (this function is not in use)
 * @type RequestHandler
 */
export const getReactionsByUsers = async (req, res) => {
  try {
    // Simplified for MySQL migration - this function is unused
    res.ok({ data: [] });
  } catch (err) {
    console.log(err);
    res.internalError({
      error: 'Something went wrong',
    });
  }
};

/**
 * @deprecated
 * @route GET /api/bugs/:bugId/timeline
 * @description GET timeline api
 * @type RequestHandler
 */
export const getTimeline = async (req, res) => {
  try {
    // Simplified for MySQL migration - timeline would need separate table
    res.ok({ data: [] });
  } catch (err) {
    console.log(err);
    res.internalError({
      error: 'Something went wrong while getting timeline data',
    });
  }
};
