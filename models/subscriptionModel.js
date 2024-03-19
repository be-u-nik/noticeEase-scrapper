const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  fcmToken: {
    type: String,
    required: true,
    unique: true,
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,
  },
});

const SubscriptionModel = mongoose.model("Subscription", subscriptionSchema);

module.exports = SubscriptionModel;
