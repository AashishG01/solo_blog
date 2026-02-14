import asyncHandler from "../../utils/asyncHandler.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import { getFeed } from "../../controllers/feed.controller.js";

const feedRoutes = async (fastify) => {
  fastify.get(
    "/feed",
    {
      preHandler: [
        authMiddleware, // 🔐 Only logged-in users can access feed
      ],
    },
    asyncHandler(getFeed)
  );
};

export default feedRoutes;
