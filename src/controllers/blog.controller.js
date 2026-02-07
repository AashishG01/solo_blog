import Article from "../models/article.model.js";

export const deleteBlog = async (req,reply) =>{
    try{
        const {id} = req.params;
        const deleteBlog = await Article.findByIdAndDelete(id);

        if(!deleteBlog){
            return reply.status(404).send({
                message:"blog not found",
            });
        }
        return reply.status(200).send({
            message:"Blog deleted successfully",
        });
    }catch(error){
        return reply.status(400).send({
            message:"Error deleting blog",
            error:message.error,
        });
    }  
};

export const updateBlog = async (req,reply) => {
    try{
        const {id} = req.params;
        const updateData = req.body;

        const updatedBlog = await Article.findByIdAndUpdate(id, 
            updateData,
            {
                new:true, // return updated blogs 
                runValidators: true // will enforce schema rules 
            }
        );

        if(!updatedBlog) {
            return reply.status(404).send({
                message:"blog not found",
            });
        }
        
        return reply.status(200).send({
            message:"Blog updated successfully",
            data: updateBlog,
        });
    } catch(error){
        return reply.status(400).send({
            message: "Error updating blog",
            error: error.message,
        });
    };
};


export const getBlogById = async (req, reply) => {
    try {
        const { id } = req.params;
        const blog = await Article.findById(id);

        if(!blog) {
            return reply.status(404).send({
                message:"Blog not found",
            });
        }

        return reply.status(200).send(blog);
    } catch(error){
        return reply.status(400).send({
            message: "Invalid blog ID",
            error: error.message,
        });
    }
};

export const getAllBlogs = async (req, reply) => {
    try{
        //1. query params 
        const {published, tag, page = 1, limit = 10} = req.query;

        //2. filter object 
        const filter = {}

        if(published !== undefined){
            filter.published = published === "true";
        }

        if(tag){
            filter.tags = tag;
        }

        //3. pagination maths 
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1)*limitNumber;


        // 4. database query 
        const blogs = await Article.find(filter)
            .sort({ created: -1})
            .skip(skip)
            .limit(limitNumber);
        
        const totalBlogs = await Article.countDocuments(filter);

        // 5. reponse 
        return reply.status(200).send({
            page:pageNumber, 
            limit:limitNumber, 
            total:totalBlogs,
            results: blogs.length,
            data: blogs,
        });
    }catch(error){
        return reply.status(500).send({
            message:"Error fetching blogs",
            error: error.message,
        });
    }

};

export const createBlog = async (req, reply) => {

    try {
        const {title, content, tags, published } = req.body;

        //basic validation 
        if(!title || !content){
            return reply.status(400).send({
                message:"Title and content are required",
            });
        }

        const blog = await Article.create({
            title, 
            content, 
            tags,
            published,
        });

        return reply.status(201).send({
            message:"Blog Created Successfully",
            data: blog,
        });
    } catch(error){
        return reply.status(500).send({
            message:"Error creating blog",
            error: error.message,
        });
    };

};