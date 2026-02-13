import {
  addComment,
  getBlogComments,
  deleteComment,
} from "../../controllers/comment.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import asyncHandler from "../../utils/asyncHandler.js";
import validateObjectId from "../../middleware/validateObjectId.js";

const commentRoutes = async (fastify) => {
  // Add comment
  fastify.post(
  "/blogs/:id/comments",
  {
    preHandler: [authMiddleware, validateObjectId("id")],
    config: {
      rateLimit: {
        max: 20,
        timeWindow: "1 minute",
      },
    },
  },
  asyncHandler(addComment)
);


  // Get comments
  fastify.get(
    "/blogs/:id/comments",
    {
      preHandler: validateObjectId("id"),
    },
    asyncHandler(getBlogComments)
  );

  // Delete comment
  fastify.delete(
    "/comments/:commentId",
    {
      preHandler: [authMiddleware, validateObjectId("commentId")],
    },
    asyncHandler(deleteComment)
  );
};

export default commentRoutes;
