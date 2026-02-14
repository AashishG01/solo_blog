import Fastify from "fastify";
import dotenv from 'dotenv';
import connectDB from "./config/db.js";
import Article from "./models/article.model.js";
import blogRoutes from "./routes/v1/blog.routes.js";
import authRoutes from "./routes/v1/auth.routes.js";
import AppError from "./utils/AppError.js";
import feedRoutes from "./routes/v1/feed.routes.js";
import commentRoutes from "./routes/v1/comment.routes.js";
import userRoutes from "./routes/v1/user.routes.js";
import rateLimit from "@fastify/rate-limit";
import helmet from "@fastify/helmet";
import v1Routes from "./routes/v1/index.js";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";

dotenv.config();

const fastify = Fastify({
  logger: true,
});



await fastify.register(helmet, {
  global: true,
});


await fastify.register(rateLimit, {
  max: 100, // default limit
  timeWindow: "1 minute",
});



await fastify.register(swagger, {
  openapi: {
    info: {
      title: "Blog API",
      description: "Production-level blogging backend",
      version: "1.0.0",
    },
  },
});

await fastify.register(swaggerUI, {
  routePrefix: "/docs",
});



await fastify.register(v1Routes, {
  prefix: "/api/v1",
});

fastify.setErrorHandler((error, request, reply) => {
  const statusCode = error.statusCode || 500;

  reply.status(statusCode).send({
    success: false,
    message: error.message || "Internal Server Error",
  });
});


fastify.get("/", async (req, reply) => {
  return { message: "Blog api is running" };
});


const start = async () => {
  try {
    // Connect to database first
    await connectDB();

    const PORT = process.env.PORT || 3000;
    const HOST = "0.0.0.0"; // Required for Docker & cloud platforms

    await fastify.listen({
      port: PORT,
      host: HOST,
    });

    fastify.log.info(`🚀 Server running on http://${HOST}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};



start();
