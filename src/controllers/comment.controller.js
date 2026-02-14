import Comment from "../models/comment.model.js";
import Article from "../models/article.model.js";
import AppError from "../utils/AppError.js";
import { createNotification } from "../services/notification.service.js";

export const addComment = async (req, reply) => {
  const blog = await Article.findById(req.params.id);

  if (!blog) {
    throw new AppError("Blog not found", 404);
  }

  if (blog.status !== "published") {
    throw new AppError("Cannot comment on unpublished blog", 400);
  }

  const comment = await Comment.create({
    content: req.body.content,
    blog: blog._id,
    author: req.user.userId,
  });

  await createNotification({
    recipient: blog.author,
    sender: req.user.userId,
    type: "comment",
    blog: blog._id,
  });


  return reply.status(201).send({
    success: true,
    data: comment,
  });
};

export const getBlogComments = async (req, reply) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const comments = await Comment.find({ blog: req.params.id })
    .populate("author", "name username")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber);

  const total = await Comment.countDocuments({ blog: req.params.id });

  return reply.send({
    success: true,
    page: pageNumber,
    total,
    results: comments.length,
    data: comments,
  });
};

export const deleteComment = async (req, reply) => {
  const comment = await Comment.findById(req.params.commentId);

  if (!comment) {
    throw new AppError("Comment not found", 404);
  }

  if (comment.author.toString() !== req.user.userId) {
    throw new AppError("You cannot delete this comment", 403);
  }

  await comment.deleteOne();

  return reply.send({
    success: true,
    message: "Comment deleted",
  });
};

