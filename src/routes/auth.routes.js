import { loginUser, registerUser } from "../controllers/auth.controller.js";
import validate from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";


const authRoutes = async (fastify, options) => {
    fastify.post("/auth/register",{preHandler : validate(registerSchema)},registerUser);
    fastify.post("/auth/login",{preHandler: validate(loginSchema)},loginUser);
};

export default authRoutes;
