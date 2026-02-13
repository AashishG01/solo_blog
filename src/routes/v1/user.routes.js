import { getAuthorProfile } from "../controllers/user.controller.js";

const userRoutes = async (fastify) => {
  fastify.get("/users/:username", getAuthorProfile);
    fastify.post(
    "/users/:id/follow",
    {
        preHandler: [authMiddleware, validateObjectId("id")],
    },
    asyncHandler(followUser)
    );

    fastify.post(
    "/users/:id/unfollow",
    {
        preHandler: [authMiddleware, validateObjectId("id")],
    },
    asyncHandler(unfollowUser)
    );

};

export default userRoutes;
