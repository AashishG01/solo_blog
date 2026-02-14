import { loginUser, registerUser } from "../../controllers/auth.controller.js";
import validate from "../../middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "../../validators/auth.validator.js";
import asyncHandler from "../../utils/asyncHandler.js";


const authRoutes = async (fastify, options) => {
  fastify.post(
    "/auth/register",
    {
      config: {
        rateLimit: {
          max: 3,
          timeWindow: "1 minute",
        },
      },
    },
    asyncHandler(registerUser)
  );

  fastify.post(
    "/auth/login",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
        },
      },
    },
    asyncHandler(loginUser)
  );

};

export default authRoutes;
