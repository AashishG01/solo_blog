import asyncHandler from "../../utils/asyncHandler.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import validateObjectId from "../../middleware/validateObjectId.js";
import {
  getNotifications,
  markAsRead,
} from "../../controllers/notification.controller.js";

const notificationRoutes = async (fastify) => {
  fastify.get(
    "/notifications",
    { preHandler: authMiddleware },
    asyncHandler(getNotifications)
  );

  fastify.patch(
    "/notifications/:id/read",
    {
      preHandler: [authMiddleware, validateObjectId("id")],
    },
    asyncHandler(markAsRead)
  );
};

export default notificationRoutes;
