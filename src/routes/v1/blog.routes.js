import fastify from "fastify";
import { createBlog, deleteBlog, getAllBlogs, getBlogById, updateBlog } from "../controllers/blog.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { createBlogSchema, updateBlogSchema } from "../validators/blog.validator.js";
import asyncHandler from "../utils/asyncHandler.js";
import validateObjectId from "../middleware/validateObjectId.js";


const blogRoutes = async (fastify, options) => {
    // public routes
    fastify.get("/blogs", getAllBlogs);
    fastify.get("/blogs/:id",{preHandler: validateObjectId("id"),},asyncHandler(getBlogById));

    // protected routes
    fastify.post("/blogs",{preHandler: [authMiddleware, validate(createBlogSchema)] }, asyncHandler(createBlog));
    fastify.put("/blogs/:id",{preHandler: [authMiddleware, validateObjectId(updateBlogSchema)] }, asyncHandler(updateBlog));
    fastify.delete("/blogs/:id",{preHandler: authMiddleware }, asyncHandler(deleteBlog));
    fastify.patch("/blogs/:id/publish",{preHandler: [authMiddleware, validateObjectId("id")],},asyncHandler(publishBlog));
    fastify.patch("/blogs/:id/archive",{preHandler: [authMiddleware, validateObjectId("id")],},asyncHandler(archiveBlog));
    fastify.post(
    "/blogs/:id/like",
    {
        preHandler: [authMiddleware, validateObjectId("id")],
    },
    asyncHandler(likeBlog)
    );

    fastify.post(
    "/blogs/:id/unlike",
    {
        preHandler: [authMiddleware, validateObjectId("id")],
    },
    asyncHandler(unlikeBlog)
    );

};

export default blogRoutes;