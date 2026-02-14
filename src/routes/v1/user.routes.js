import { getAuthorProfile, followUser, unfollowUser } from "../../controllers/user.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import asyncHandler from "../../utils/asyncHandler.js";
import validateObjectId from "../../middleware/validateObjectId.js";

const userRoutes = async (fastify) => {
    fastify.get("/users/:username", asyncHandler(getAuthorProfile));
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
