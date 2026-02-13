import authRoutes from "./auth.routes.js";
import blogRoutes from "./blog.routes.js";
import userRoutes from "./user.routes.js";
import commentRoutes from "./comment.routes.js";
import feedRoutes from "./feed.routes.js";
import notificationRoutes from "./notification.routes.js";

const v1Routes = async (fastify) => {
  fastify.register(authRoutes);
  fastify.register(blogRoutes);
  fastify.register(userRoutes);
  fastify.register(commentRoutes);
  fastify.register(feedRoutes);
  fastify.register(notificationRoutes);
};

export default v1Routes;
