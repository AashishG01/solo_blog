import fastify from "fastify";
import { createBlog, deleteBlog, getAllBlogs, getBlogById, updateBlog } from "../controllers/blog.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { createBlogSchema, updateBlogSchema } from "../validators/blog.validator.js";

const blogRoutes = async (fastify, options) => {
    // public routes
    fastify.get("/blogs", getAllBlogs);
    fastify.get("/blogs/:id", getBlogById);


    // protected routes
    fastify.post("/blogs",{preHandler: [authMiddleware, validate(createBlogSchema)] }, createBlog);
    fastify.put("/blogs/:id",{preHandler: [authMiddleware, validate(updateBlogSchema)] }, updateBlog);
    fastify.delete("/blogs/:id",{preHandler: authMiddleware }, deleteBlog);
};

export default blogRoutes;