import Article from "../models/article.model.js";
import AppError from "../utils/AppError.js";
import { createNotification } from "../services/notification.service.js";

export const deleteBlog = async (req, reply) => {
  const blog = await Article.findById(req.params.id);

  if (!blog) {
    throw new AppError("Blog not found", 404);
  }

  if (blog.author.toString() !== req.user.userId) {
    throw new AppError("You are not allowed to delete this blog", 403);
  }

  await blog.deleteOne();

  return reply.send({
    success: true,
    message: "Blog deleted successfully",
  });
};


export const updateBlog = async (req, reply) => {
  const blog = await Article.findById(req.params.id);

  if (!blog) {
    throw new AppError("Blog not found", 404);
  }

  if (blog.author.toString() !== req.user.userId) {
    throw new AppError("You are not allowed to update this blog", 403);
  }

  Object.assign(blog, req.body);
  await blog.save();

  return reply.send({
    success: true,
    data: blog,
  });
};



export const getBlogById = async (req, reply) => {
  const blog = await Article.findById(req.params.id);

  if (!blog) {
    throw new AppError("Blog not found", 404);
  }

  return reply.send({
    success: true,
    data: blog,
  });
};

export const getAllBlogs = async (req, reply) => {
  const { tag, page = 1, limit = 10 } = req.query;

  // Validate pagination
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);

  if (pageNumber < 1 || limitNumber < 1) {
    throw new AppError("Invalid pagination values", 400);
  }

  const skip = (pageNumber - 1) * limitNumber;

  // Public blogs → only published
  const filter = {
    status: "published",
  };

  if (tag) {
    filter.tags = tag;
  }

  const blogs = await Article.find(filter)
    .populate("author", "name username") // show author info
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber);

  const totalBlogs = await Article.countDocuments(filter);

  return reply.send({
    success: true,
    page: pageNumber,
    limit: limitNumber,
    total: totalBlogs,
    results: blogs.length,
    data: blogs,
  });
};

export const createBlog = async (req, reply) => {
  const { title, content, tags } = req.body;

  const blog = await Article.create({
    title,
    content,
    tags,
    author: req.user.userId,
    status: "draft", // force draft
  });

  return reply.status(201).send({
    success: true,
    data: blog,
  });
};


export const publishBlog = async (req, reply) => {
  const blog = await Article.findById(req.params.id);

  if (!blog) {
    throw new AppError("Blog not found", 404);
  }

  if (blog.author.toString() !== req.user.userId) {
    throw new AppError("You are not allowed to publish this blog", 403);
  }

  if (blog.status === "published") {
    throw new AppError("Blog is already published", 400);
  }

  blog.status = "published";
  await blog.save();

  return reply.send({
    success: true,
    message: "Blog published successfully",
    data: blog,
  });
};

export const archiveBlog = async (req, reply) => {
  const blog = await Article.findById(req.params.id);

  if (!blog) {
    throw new AppError("Blog not found", 404);
  }

  if (blog.author.toString() !== req.user.userId) {
    throw new AppError("You are not allowed to archive this blog", 403);
  }

  blog.status = "archived";
  await blog.save();

  return reply.send({
    success: true,
    message: "Blog archived successfully",
    data: blog,
  });
};

export const likeBlog = async (req, reply) => {
  const blog = await Article.findById(req.params.id);

  if (!blog) {
    throw new AppError("Blog not found", 404);
  }

  if (blog.status !== "published") {
    throw new AppError("Cannot like unpublished blog", 400);
  }

  const userId = req.user.userId;

  if (blog.likes.includes(userId)) {
    throw new AppError("You already liked this blog", 400);
  }

  blog.likes.push(userId);
  blog.likesCount = blog.likes.length;

  await blog.save();

  await createNotification({
    recipient: blog.author,
    sender: userId,
    type: "like",
    blog: blog._id,
  });

  return reply.send({
    success: true,
    likesCount: blog.likesCount,
  });
};

export const unlikeBlog = async (req, reply) => {
  const blog = await Article.findById(req.params.id);

  if (!blog) {
    throw new AppError("Blog not found", 404);
  }

  const userId = req.user.userId;

  if (!blog.likes.includes(userId)) {
    throw new AppError("You have not liked this blog", 400);
  }

  blog.likes = blog.likes.filter(
    (id) => id.toString() !== userId
  );

  blog.likesCount = blog.likes.length;

  await blog.save();

  return reply.send({
    success: true,
    likesCount: blog.likesCount,
  });
};

export const getBlogBySlug = async (req, reply) => {
  const blog = await Article.findOne({
    slug: req.params.slug,
    status: "published",
  }).populate("author", "name username");

  if (!blog) {
    throw new AppError("Blog not found", 404);
  }

  return reply.send({
    success: true,
    data: blog,
  });
};

export const searchBlogs = async (req, reply) => {
  const { q, page = 1, limit = 10 } = req.query;

  if (!q) {
    throw new AppError("Search query is required", 400);
  }

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const blogs = await Article.find(
    {
      $text: { $search: q },
      status: "published",
    },
    {
      score: { $meta: "textScore" },
    }
  )
    .sort({ score: { $meta: "textScore" } })
    .skip(skip)
    .limit(limitNumber)
    .populate("author", "name username");

  return reply.send({
    success: true,
    results: blogs.length,
    data: blogs,
  });
};


