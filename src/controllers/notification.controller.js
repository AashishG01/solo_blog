import Notification from "../models/notification.model.js";

export const getNotifications = async (req, reply) => {
  const notifications = await Notification.find({
    recipient: req.user.userId,
  })
    .populate("sender", "name username")
    .populate("blog", "title")
    .sort({ createdAt: -1 });

  return reply.send({
    success: true,
    results: notifications.length,
    data: notifications,
  });
};

export const markAsRead = async (req, reply) => {
  await Notification.findByIdAndUpdate(req.params.id, {
    read: true,
  });

  return reply.send({
    success: true,
    message: "Notification marked as read",
  });
};
