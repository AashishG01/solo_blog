import Article from "../models/article.model.js";
import User from "../models/user.model.js";

export const getFeed = async (req, reply) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const user = await User.findById(req.user.userId);

  const blogs = await Article.find({
    author: { $in: user.following },
    status: "published",
  })
    .populate("author", "name username")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber);

  return reply.send({
    success: true,
    page: pageNumber,
    results: blogs.length,
    data: blogs,
  });
};
