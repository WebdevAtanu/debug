import { Bug } from '../models/bugModel.js';
import { Comment, validateComment } from '../models/commentModel.js';
import { Notification } from '../models/notificationModel.js';
import { NOTIFY_TYPES } from '../constants.js';
import Joi from 'joi';

/**
 * @route GET /api/bugs/:bugId/comments
 * @description GET all comments with a specified bugId
 * @type RequestHandler
 */
export const getComments = async (req, res) => {
  try {
    const bug = await Bug.findByNumber(req.params.bugId);
    if (!bug)
      return res.notFound({ error: `Bug#${req.params.bugId} Not Found` });

    const comments = await Comment.findByBugId(bug.id);
    res.ok({ data: comments });
  } catch (err) {
    console.log(err);
    res.internalError({
      error: 'Something went wrong while getting comments',
    });
  }
};

/**
 * @route PATCH /api/bugs/:bugId/comments
 * @description add a comments to a specified bugId
 * @type RequestHandler
 */
export const createComment = async (req, res) => {
  const { error, value } = validateComment(req.body);

  if (error) return res.unprocessable({ error: error.details[0].message });

  try {
    const bug = await Bug.findByNumber(req.params.bugId);
    if (!bug)
      return res.notFound({ error: `Bug#${req.params.bugId} Not Found` });

    const newComment = await Comment.create({
      content: value.body,
      bug_id: bug.id,
      author_id: req.user.id,
    });

    // send notifications
    await Notification.create({
      message: `New comment on bug: ${bug.title}`,
      user_id: req.user.id,
      bug_id: bug.id,
    });

    res.ok({ data: newComment });
  } catch (err) {
    res.internalError({
      error: 'Something went wrong while adding new comment',
    });
  }
};

/**
 * @route DELETE /api/bugs/:bugId/comments/:comment_id
 * @description remove a comments from specified bugId
 * @type RequestHandler
 */
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.comment_id);
    if (!comment)
      return res.notFound({ error: `Comment #${req.params.comment_id} Not Found` });

    if (comment.author_id !== req.user.id)
      return res.forbidden({ error: 'Not authorized to delete this comment' });

    await Comment.deleteById(req.params.comment_id);

    const bug = await Bug.findByNumber(req.params.bugId);
    const comments = await Comment.findByBugId(bug.id);
    res.ok({ data: comments });
  } catch (err) {
    res.internalError({
      error: `Something went wrong while deleting comment #${req.params.comment_id}`,
    });
  }
};

/**
 * @route PATCH /api/bugs/:bugId/comments/:comment_id
 * @description update a comments from specified bugId, comment_id
 * @type RequestHandler
 */
export const updateComment = async (req, res) => {
  const { error, value } = validateComment(req.body);
  if (error) return res.unprocessable({ error: error.details[0].message });

  try {
    const comment = await Comment.findById(req.params.comment_id);
    if (!comment)
      return res.notFound({ error: `Comment #${req.params.comment_id} Not Found` });

    if (comment.author_id !== req.user.id)
      return res.forbidden({ error: 'Not authorized to update this comment' });

    const updatedComment = await Comment.updateById(req.params.comment_id, {
      content: value.body,
    });

    res.ok({ data: updatedComment });
  } catch (err) {
    console.log(err);
    res.internalError({
      error: `Something went wrong while updating comment #${req.params.comment_id}`,
    });
  }
};

/**
 * @route PATCH /api/bugs/:bugId/comments/:comment_id/reactions
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
    const comment = await Comment.findById(req.params.comment_id);
    if (!comment)
      return res.notFound({ error: `Comment #${req.params.comment_id} Not Found` });

    const reactions = { ...comment.reactions };
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

    const updatedComment = await Comment.updateById(req.params.comment_id, { reactions });
    res.ok({ data: updatedComment });
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
    const comment = await Comment.findById(req.params.comment_id);
    if (!comment)
      return res.notFound({ error: `Comment #${req.params.comment_id} Not Found` });

    res.ok({ data: comment.reactions });
  } catch (err) {
    console.log(err);
    res.internalError({
      error: 'Something went wrong while getting reactions',
    });
  }
};
