const Router = require("express");
const scraperController = require("../controllers/scraperController");

const router = Router();

router.route("/addErpNoticesToDatabase").get(scraperController.getScrapedData);
router.route("/getErpNotices").get(scraperController.getLatestNotices);

module.exports = router;
