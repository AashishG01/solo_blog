import Notification from "../models/notification.model.js";

export const createNotification = async ({
  recipient,
  sender,
  type,
  blog = null,
}) => {
  if (recipient.toString() === sender.toString()) return;

  await Notification.create({
    recipient,
    sender,
    type,
    blog,
  });
};
