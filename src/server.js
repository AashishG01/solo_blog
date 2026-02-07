import Fastify from "fastify";
import dotenv from 'dotenv';
import connectDB from "./config/db.js";
import Article from "./models/article.model.js";
import blogRoutes from "./routes/blog.routes.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const fastify = Fastify({
    logger: true,
});

fastify.register(blogRoutes);
fastify.register(authRoutes);

fastify.get("/", async (req, reply) => {
    return {message:"Blog api is running"};
});

const start = async () =>{
    try{
        await connectDB();
        
        await fastify.listen({port:3000});
        console.log("server is running on port 3000");
    }catch(err){
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
