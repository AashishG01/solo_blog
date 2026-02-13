import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";
import { createNotification } from "../services/notification.service.js";

export const getAuthorProfile = async (req, reply) => {
  const user = await User.findOne({ username: req.params.username })
    .select("name username bio createdAt");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const blogs = await Article.find({
    author: user._id,
    published: true,
  }).sort({ createdAt: -1 });

  return reply.send({
    success: true,
    user: {
      name: user.name,
      username: user.username,
      bio: user.bio,
      joinedAt: user.createdAt,
      totalBlogs: blogs.length,
    },
    blogs,
  });
};

export const followUser = async (req, reply) => {
  const targetUserId = req.params.id;
  const currentUserId = req.user.userId;

  if (targetUserId === currentUserId) {
    throw new AppError("You cannot follow yourself", 400);
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new AppError("User not found", 404);
  }

  const currentUser = await User.findById(currentUserId);

  if (currentUser.following.includes(targetUserId)) {
    throw new AppError("Already following this user", 400);
  }

  // Atomic updates
  await User.findByIdAndUpdate(currentUserId, {
    $addToSet: { following: targetUserId },
  });

  await User.findByIdAndUpdate(targetUserId, {
    $addToSet: { followers: currentUserId },
  });

  await createNotification({
  recipient: targetUserId,
  sender: currentUserId,
  type: "follow",
  });

  return reply.send({
    success: true,
    message: "User followed successfully",
  });

};

export const unfollowUser = async (req, reply) => {
  const targetUserId = req.params.id;
  const currentUserId = req.user.userId;

  const currentUser = await User.findById(currentUserId);

  if (!currentUser.following.includes(targetUserId)) {
    throw new AppError("You are not following this user", 400);
  }

  await User.findByIdAndUpdate(currentUserId, {
    $pull: { following: targetUserId },
  });

  await User.findByIdAndUpdate(targetUserId, {
    $pull: { followers: currentUserId },
  });

  return reply.send({
    success: true,
    message: "User unfollowed successfully",
  });
};



