import jwt from "jsonwebtoken";

const authMiddleware = async (req, reply) => {
    try{
        
        const authHeader = req.headers.authorization;
        console.log("Auth header raw : ", req.headers.authorization);
        // console.log("jwt secret : ", process.env.JWT_SECRET);
        // token missing 
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return reply.status(401).send({
                message: "Unauthorized: Token missing"
            });
        }
        console.log("hii");

        // Extract token 
        const token = authHeader.split(" ")[1];
        
        // verify token 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // attached user info to request 
        req.user = decoded;
    }catch(error){
        return reply.status(401).send({
            message:"Unauthorized: Invalid or expires token",
        });
    }
};

export default authMiddleware;