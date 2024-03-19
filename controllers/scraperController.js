const asyncHandler = require("express-async-handler");
const scrapperUtil = require("../utils/scraperUtil");
const NoticeModel = require("../models/NotificationModel");

const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URI);
// const redis = new Redis();
// redis.set("new", "msg");
let targetBrowser = null;
let targetpage = null;
var notificationsArray = [];

const lockKey = "scraping-lock";
const getScrapedData = asyncHandler(async (req, res) => {
  const acquiredLock = await acquireLock();

  if (!acquiredLock) {
    res.status(409).send("Scraping process is already running.");
    return;
  } else {
    try {
      if (!(targetBrowser !== null && targetpage !== null)) {
        // If cookies are not available, perform login and fetch new cookies
        const { browser, page } = await scrapperUtil.login();
        targetBrowser = browser;
        targetpage = page;
        console.log("post login:", browser?.id, page?.browserContext().id);
      }
      try {
        process.env.NODE_ENV === "development" &&
          console.log(
            "target",
            targetBrowser?.id,
            targetpage?.browserContext().id
          );
        let noticeArray = await scrapperUtil.fetchNoticesArray(
          targetBrowser,
          targetpage
        );
        console.log(noticeArray?.length);
        for (const noticeData of noticeArray) {
          if (noticeData.htmlContent) {
            const [formattedDate, formattedTime] =
              noticeData.noticeTime.split(" ");
            const [day, month, year] = formattedDate.split("-");
            const [hour, minute] = formattedTime.split(":");
            // console.log(">>>>>>>>>>>>", day, month, year, hour, minute);
            noticeData.noticeTime = new Date(
              year,
              month - 1,
              day,
              hour,
              minute
            );
            try {
              await NoticeModel.create({
                id: Number(noticeData.id),
                sno: Number(noticeData.sno),
                type: noticeData.type,
                subject: noticeData.subject,
                company: noticeData.company,
                notice: noticeData.notice,
                noticeBy: noticeData.noticeBy,
                noticeTime: noticeData.noticeTime,
                download: noticeData.download,
                upload: noticeData.upload,
                deactivate: noticeData.deactivate,
                htmlContent: noticeData.htmlContent,
                fileBuffer: noticeData.fileBuffer,
              });
            } catch (e) {
              console.log("db error", e);
            }
          }
        }

        res.status(200).json({
          message: "Notices saved successfully",
          dataSize: noticeArray.length,
        });
      } catch (e) {
        await targetBrowser?.close();
        console.log("browser closed");
        targetBrowser = null;
        targetpage = null;
        console.log("error erp changed:", e);
        await redis.del(lockKey);
        res
          .status(500)
          .send("Error occurred during scraping, erp changed/is down");
      }
    } catch (error) {
      console.error("Error occurred during scraping:", error);
      await redis.del(lockKey);
      res.status(500).send("Error occurred during scraping.");
    } finally {
      await redis.del(lockKey);
    }
  }
});

const acquireLock = async () => {
  const result = await redis.set(lockKey, "locked", "NX");
  process.env.NODE_ENV === "development" && console.log("lock set");
  return result === "OK";
};

const getLatestNotices = asyncHandler(async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0; // Default skip value is 0
    const notices = await NoticeModel.find()
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .select({
        _id: 1,
        id: 1,
        customSno: 1,
        type: 1,
        subject: 1,
        company: 1,
        notice: 1,
        noticeTime: 1,
        htmlContent: 1,
        fileBuffer: 1,
      })
      .exec();

    res.json({ notices });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving notices" });
  }
});

module.exports = {
  getScrapedData,
  getLatestNotices,
};
