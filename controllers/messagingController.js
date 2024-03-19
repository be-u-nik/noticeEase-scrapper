const asyncHandler = require("express-async-handler");
const messaging = require("../firebaseAdmin");
const SubscriptionModel = require("../models/subscriptionModel");

const subscribeToTopic = asyncHandler(async (req, res) => {
  const { token, rollNumber } = req.body;

  const existingUser = await SubscriptionModel.findOne({ rollNumber });

  if (existingUser) {
    return res.status(200).json({ message: "User is already subscribed" });
  }

  await messaging.subscribeToTopic(token, process.env.TOPIC_NAME);

  await SubscriptionModel.create({ fcmToken: token, rollNumber });

  res.status(200).json({ message: "Subscribed user to ERP notices" });
});

const unsubscribeFromTopic = asyncHandler(async (req, res) => {
  const { token, rollNumber } = req.body;

  await messaging.unsubscribeFromTopic(token, process.env.TOPIC_NAME);

  await SubscriptionModel.findOneAndDelete({ fcmToken: token });

  res.status(200).json({ message: "Unsubscribed user from ERP notices" });
});

module.exports = unsubscribeFromTopic;
const sendMessageToTopic = asyncHandler(async (req, res) => {
  const { title, body, link } = req.body;
  const message = {
    topic: process.env.TOPIC_NAME,
    notification: {
      title,
      body,
    },
    webpush: {
      fcm_options: {
        link,
      },
    },
  };

  await messaging.send(message);

  res.status(200).json({ message: "Message sent to topic" });
});

module.exports = {
  subscribeToTopic,
  sendMessageToTopic,
  unsubscribeFromTopic,
};
