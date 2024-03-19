const Router = require("express");
const messagingController = require("../controllers/messagingController");

const router = Router();

router.route("/subscribe").post(messagingController.subscribeToTopic);
router.route("/unsubscribe").post(messagingController.unsubscribeFromTopic);
router.route("/sendMessage").post(messagingController.sendMessageToTopic);

module.exports = router;
