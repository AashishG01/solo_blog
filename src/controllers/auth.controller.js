import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const loginUser = async (req, reply) => {
    try {
        const { email, password } = req.body;

        //1. validate email 
        if (!email || !password) {
            return reply.status(400).send({
                message: "Email and password are required"
            });
        }
        //2. check user exists 
        const user = await User.findOne({ email });
        if (!user) {
            return reply.status(401).send({
                message: "Invalid email or password",
            });
        }

        //3. compare password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return reply.status(401).send({
                message: "Invalid email or password",
            });
        }

        //4. generate jwt token 
        const token = jwt.sign({
            userId: user._id,
            email: user.email,
        },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN,
            }
        );

        //5. response 
        return reply.status(200).send({
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
            },
        });

    } catch (error) {
        return reply.status(500).send({
            message: "error logging in",
            error: error.message,
        });
    }
};

export const registerUser = async (req, reply) => {
    try {
        const { name, email, username, password } = req.body;

        // 1. basic validation 
        if (!name || !email || !password) {
            return reply.status(400).send({
                message: "All fields are required",
            });
        }

        // 2. check if user already exists 
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return reply.status(400).send({
                message: "user already exists"
            });
        }

        // 3. hashpassword 
        const hashPassword = await bcrypt.hash(password, 10);

        // 4. create user
        const user = await User.create({
            name,
            email,
            username,
            password: hashPassword
        });

        // 5. generate token so user is auto-logged in
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        return reply.status(201).send({
            message: "User registered succesfully",
            token,
            user: {
                _id: user._id,
                id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
            }
        });

    } catch (error) {
        return reply.status(500).send({
            message: "Error registering user",
            error: error.message,
        });
    }
};
