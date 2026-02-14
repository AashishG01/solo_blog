import {
  createBlog,
  deleteBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  publishBlog,
  archiveBlog,
  likeBlog,
  unlikeBlog,
  getBlogBySlug,
  searchBlogs,
} from "../../controllers/blog.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import { createBlogSchema, updateBlogSchema } from "../../validators/blog.validator.js";
import asyncHandler from "../../utils/asyncHandler.js";
import validateObjectId from "../../middleware/validateObjectId.js";

const blogRoutes = async (fastify) => {

  // -------------------------
  // PUBLIC ROUTES
  // -------------------------

  // Get all published blogs
  fastify.get(
    "/blogs",
    asyncHandler(getAllBlogs)
  );

  // Search blogs
  fastify.get(
    "/blogs/search",
    asyncHandler(searchBlogs)
  );

  // Get blog by slug (SEO URL)
  fastify.get(
    "/blogs/slug/:slug",
    asyncHandler(getBlogBySlug)
  );

  // Get blog by ID
  fastify.get(
    "/blogs/:id",
    {
      preHandler: validateObjectId("id"),
    },
    asyncHandler(getBlogById)
  );

  // -------------------------
  // PROTECTED ROUTES
  // -------------------------

  // Create blog (default draft)
  fastify.post(
    "/blogs",
    {
      preHandler: [authMiddleware, validate(createBlogSchema)],
    },
    asyncHandler(createBlog)
  );

  // Update blog (by ID)
  fastify.put(
    "/blogs/:id",
    {
      preHandler: [
        authMiddleware,
        validateObjectId("id"),
        validate(updateBlogSchema),
      ],
    },
    asyncHandler(updateBlog)
  );

  // Delete blog
  fastify.delete(
    "/blogs/:id",
    {
      preHandler: [
        authMiddleware,
        validateObjectId("id"),
      ],
    },
    asyncHandler(deleteBlog)
  );

  // Publish blog
  fastify.patch(
    "/blogs/:id/publish",
    {
      preHandler: [
        authMiddleware,
        validateObjectId("id"),
      ],
    },
    asyncHandler(publishBlog)
  );

  // Archive blog
  fastify.patch(
    "/blogs/:id/archive",
    {
      preHandler: [
        authMiddleware,
        validateObjectId("id"),
      ],
    },
    asyncHandler(archiveBlog)
  );

  // Like blog
  fastify.post(
    "/blogs/:id/like",
    {
      preHandler: [
        authMiddleware,
        validateObjectId("id"),
      ],
    },
    asyncHandler(likeBlog)
  );

  // Unlike blog
  fastify.post(
    "/blogs/:id/unlike",
    {
      preHandler: [
        authMiddleware,
        validateObjectId("id"),
      ],
    },
    asyncHandler(unlikeBlog)
  );
};

export default blogRoutes;
