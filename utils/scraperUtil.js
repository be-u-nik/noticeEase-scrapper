// I am letting the comments be. so that it may help understand this code better. 
// Most of them are purely for debugging

// const fs = require("fs");
const puppeteer = require("puppeteer");
const fetch = require("node-fetch");
const { scraperConfig } = require("../config/scraperConfig");
const NoticeModel = require("../models/NotificationModel");
const puppeteerUtil = require("./puppeteerUtil");
const { getERPLoginOTP } = require("./gmailAPIUtil");
const Redis = require("ioredis");

let browserPromise = puppeteer.launch({
  executablePath:
    process.env.NODE_ENV === "development"
      ? puppeteer.executablePath()
      : process.env.PUPPETEER_EXECUTABLE_PATH,
  headless: true,
  timeout: 0,
  // args: [
  //   "--no-sandbox",
  //   "--disable-setuid-sandbox",
  //   "--single-process",
  //   "--no-zygote",
  // ],
});

browserPromise.then(() => {
  console.log("browser launched");
  const redis = new Redis(process.env.REDIS_URI);
  // const redis = new Redis();
  redis.del("scraping-lock");
});

const login = async () => {
  const browserPromiseResponse = await browserPromise;
  const browser = await browserPromiseResponse.createIncognitoBrowserContext();
  const page = await browser.newPage();

  console.log("new page launched", browser.id, page.browserContext().id);
  try {
    const timeout = 5000;
    page.setDefaultTimeout(timeout);
    // set viewport size
    {
      const targetPage = page;
      await targetPage.setViewport({
        width: 873,
        height: 775,
      });
      process.env.NODE_ENV === "development" && console.log("viewport set");
    }
    // go to erp https://erp.iitkgp.ac.in/IIT_ERP3/
    {
      const targetPage = page;
      const promises = [];
      promises.push(targetPage.waitForNavigation({ timeout: 0 }));
      await targetPage.goto(scraperConfig.loginPageUrl, { timeout: 0 });
      await Promise.all(promises)
        .then((res) => {
          process.env.NODE_ENV === "development" &&
            console.log(res, "loginpage");
        })
        .catch((e) => {
          process.env.NODE_ENV === "development" && console.log(e);
        });
    }
    // enter roll number
    {
      const targetPage = page;
      await puppeteerUtil.scrollIntoViewIfNeeded(
        scraperConfig.loginPageSelectors.user_idSelector,
        targetPage,
        timeout
      );
      const element = await puppeteerUtil.waitForSelectors(
        scraperConfig.loginPageSelectors.user_idSelector,
        targetPage,
        { timeout, visible: true }
      );
      const inputType = await element.evaluate((el) => el.type);
      if (inputType === "select-one") {
        await puppeteerUtil.changeSelectElement(
          element,
          process.env.ROLL_NUMBER
        );
      } else if (scraperConfig.inputType.includes(inputType)) {
        await puppeteerUtil.typeIntoElement(element, process.env.ROLL_NUMBER);
      } else {
        await puppeteerUtil.changeElementValue(
          element,
          process.env.ROLL_NUMBER
        );
      }
      process.env.NODE_ENV === "development" && console.log("enter roll no.");
    }
    // enter password
    {
      const targetPage = page;
      await puppeteerUtil.scrollIntoViewIfNeeded(
        scraperConfig.loginPageSelectors.passwordSelector,
        targetPage,
        timeout
      );
      const element = await puppeteerUtil.waitForSelectors(
        scraperConfig.loginPageSelectors.passwordSelector,
        targetPage,
        { timeout, visible: true }
      );
      const inputType = await element.evaluate((el) => el.type);
      if (inputType === "select-one") {
        await puppeteerUtil.changeSelectElement(element, process.env.PASSWORD);
      } else if (scraperConfig.inputType.includes(inputType)) {
        await puppeteerUtil.typeIntoElement(element, process.env.PASSWORD);
      } else {
        await puppeteerUtil.changeElementValue(element, process.env.PASSWORD);
      }
      process.env.NODE_ENV === "development" && console.log("enter password");
    }
    // enter answer
    {
      const targetPage = page;
      await puppeteerUtil.scrollIntoViewIfNeeded(
        scraperConfig.loginPageSelectors.answerSelector,
        targetPage,
        timeout
      );
      const element = await puppeteerUtil.waitForSelectors(
        scraperConfig.loginPageSelectors.answerSelector,
        targetPage,
        { timeout, visible: true }
      );
      const inputType = await element.evaluate((el) => el.type);
      if (inputType === "select-one") {
        await puppeteerUtil.changeSelectElement(element, process.env.ANSWER);
      } else if (scraperConfig.inputType.includes(inputType)) {
        await puppeteerUtil.typeIntoElement(element, process.env.ANSWER);
      } else {
        await puppeteerUtil.changeElementValue(element, process.env.ANSWER);
      }
      process.env.NODE_ENV === "development" && console.log("enter answer");
    }
    // click sendotp btn
    {
      const targetPage = page;
      await puppeteerUtil.scrollIntoViewIfNeeded(
        scraperConfig.loginPageSelectors.sendOTPButtonSelector,
        targetPage,
        timeout
      );
      const element = await puppeteerUtil.waitForSelectors(
        scraperConfig.loginPageSelectors.sendOTPButtonSelector,
        targetPage,
        { timeout, visible: true }
      );
      await element.click({
        offset: {
          x: 45.33746337890625,
          y: 20.6875,
        },
      });
      console.log("otp sent");
    }
    // accept dialog
    {
      const targetPage = page;
      targetPage.on("dialog", async (dialog) => {
        await dialog.accept();
      });
    }
    // enter otp
    {
      // retrieve otp from gmail
      const loginOTP = await getERPLoginOTP();
      if (!loginOTP) {
        throw new Error("An error occurred during otp fetch.");
      }
      process.env.NODE_ENV === "development" &&
        console.log("loginOTP:", loginOTP);

      process.env.NODE_ENV === "development" && console.log(page.url());

      const targetPage = page;
      await puppeteerUtil.scrollIntoViewIfNeeded(
        scraperConfig.loginPageSelectors.OTPSelector,
        targetPage,
        timeout
      );
      process.env.NODE_ENV === "development" && console.log(page.url());
      const element = await puppeteerUtil.waitForSelectors(
        scraperConfig.loginPageSelectors.OTPSelector,
        targetPage,
        { timeout, visible: true }
      );
      const inputType = await element.evaluate((el) => el.type);
      if (inputType === "select-one") {
        await puppeteerUtil.changeSelectElement(element, loginOTP);
      } else if (scraperConfig.inputType.includes(inputType)) {
        await puppeteerUtil.typeIntoElement(element, loginOTP);
      } else {
        await puppeteerUtil.changeElementValue(element, loginOTP);
      }
      console.log("otp typed");
    }
    // click submit
    {
      const targetPage = page;
      const promises = [];
      // targetPage.setRequestInterception(true);
      // targetPage.on("request", async (req) => {
      //   if (!req.isInterceptResolutionHandled()) {
      //     console.log(req.postData());
      //     console.log(req.headers());
      //     req.abort();
      //   }
      // });
      promises.push(targetPage.waitForNavigation({ timeout: 0 }));
      await puppeteerUtil.scrollIntoViewIfNeeded(
        scraperConfig.loginPageSelectors.submitButtonSelector,
        targetPage,
        timeout
      );
      const element = await puppeteerUtil.waitForSelectors(
        scraperConfig.loginPageSelectors.submitButtonSelector,
        targetPage,
        { timeout, visible: true }
      );
      await element.click();
      const response1 = await Promise.all(promises);
      process.env.NODE_ENV === "development" && console.log(response1.length);
      process.env.NODE_ENV === "development" &&
        console.log(response1[0]?.headers());
      console.log("click submit btn");
    }
    {
      const targetPage3 = page;
      process.env.NODE_ENV === "development" &&
        console.log(await targetPage3.cookies());
    }
    console.log(
      "after submit >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
    );
    // go to https://erp.iitkgp.ac.in/TrainingPlacementSSO/TPStudent.jsp
    {
      const targetPage = page;
      const promises = [];
      targetPage.setDefaultTimeout(10000);
      promises.push(
        targetPage.waitForNavigation({ waitUntil: "networkidle0" })
      );
      await targetPage.goto(scraperConfig.tpStudentPageUrl).catch((e) => null);
      await Promise.all(promises).then(() => {
        console.log("tps student");
      });

      const targetPage3 = page;
      process.env.NODE_ENV === "development" &&
        console.log(await targetPage3.cookies());
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    }
  } catch (error) {
    console.log(error, "login error: browser and page === null");
    return { browser: null, page: null };
  }
  return { browser, page };
};

const fetchNoticesArray = async (browser, page) => {
  console.log("fetching notifications", browser.id, page.browserContext().id);
  var noticesArray = [];
  var currentId = await NoticeModel.findOne({}, { id: 1 })
    .sort({ _id: -1 })
    .exec()
    .then((lastNotice) => {
      const lastId = lastNotice ? lastNotice.id : 0;
      console.log("currentId:", lastId);
      return lastId;
    })
    .catch((err) => {
      process.env.NODE_ENV === "development" && console.log("err>>>>>>>", err);
    });
  var latestId = currentId;

  // {
  //   const targetPage = page;
  //   const targetPage2 = page;
  //   console.log(await targetPage.cookies());
  //   console.log(await targetPage2.content());
  // }
  // go to https://erp.iitkgp.ac.in/TrainingPlacementSSO/Notice.jsp and populate noticesArray
  try {
    {
      const targetPage = page;
      const promises = [];
      let errorOccurred = false;
      promises.push(
        targetPage.waitForNavigation({ waitUntil: "networkidle0" })
      );
      await targetPage.goto(scraperConfig.noticePageUrl, {
        waitUntil: "networkidle0",
      });
      await Promise.all(promises).catch((e) => {
        console.log("nav err:", e);
        errorOccurred = true;
      });
      console.log("errorOccurred", errorOccurred);
      if (errorOccurred) {
        throw new Error("An error occurred during navigarion.");
      }

      const newPage = targetPage;
      // const newPage2 = targetPage;
      // console.log(await newPage2.content());
      // fs.writeFileSync("page.html", await newPage2.content());
      latestId = await newPage.$eval("[id='0'] td:nth-child(2)", (tr) => {
        return parseInt(tr.innerHTML);
      });

      console.log("latestId:", latestId);
      var diff = latestId - currentId;
      console.log("diff:", diff);
      if (diff === 0 || typeof diff === NaN) return [];
      while (diff--) {
        const contents = await newPage
          .$$eval(`tr[id='${diff}'] td`, (tds) =>
            tds.map((td, index) => {
              const anchor = td.querySelector("a");
              anchor &&
                console.log(
                  "Attacment innerHtml:",
                  anchor.innerHTML.split(".")[0].trim()
                );
              return anchor
                ? anchor.innerHTML.split(".")[0].trim()
                : td.innerHTML;
            })
          )
          .catch((e) => console.log("contents not fetched", e));
        const notification = {};
        // console.log("contents", contents.length, contents[0], diff);
        for (var i = 0; i < contents?.length; i++) {
          notification[scraperConfig.notificationHeadings[i] || "extra"] =
            contents[i];
        }
        if (!notification["id"]) console.log("no notice", notification);
        notification["htmlContent"] = "";
        notification["fileBuffer"] = null;
        noticesArray.push(notification);
        console.log("populating notice array");
      }
    }
  } catch (e) {
    throw new error("populate notice array err:", e);
  }
  // go to https://erp.iitkgp.ac.in/TrainingPlacementSSO/ShowContent.jsp?year=2022-2023&id=${noticesArray[diff]["id"]} and add htmlContent
  {
    // latestId = 2721;
    var diff = latestId - currentId;
    console.log(diff);

    while (diff--) {
      const targetPage = page;
      const promises = [];
      targetPage.setDefaultTimeout(10000);
      promises.push(
        targetPage.waitForNavigation(
          { waitUntil: "networkidle0" },
          { timeout: 0 }
        )
      );
      await targetPage.goto(
        `${scraperConfig.showContentUrl}?year=${process.env.YEAR}&id=${noticesArray[diff]["id"]}`
      );
      await Promise.all(promises).then((res) => {
        console.log("notices page");
      });

      const newPage = targetPage;
      const innerElement = await newPage
        .$eval("body div", (tr) => tr.innerHTML)
        .catch((e) => console.log("html not fetched", e));

      noticesArray[diff]["htmlContent"] = innerElement;
      // const htmlContent = fs.readFileSync("page.html", "utf-8");
      // const modifiedHtmlContent = htmlContent.replace(
      //   "<div>",
      //   `<div>${innerElement}`
      // );

      // fs.writeFileSync("page.html", modifiedHtmlContent);
    }
  }
  // go to https://erp.iitkgp.ac.in/TrainingPlacementSSO/AdmFilePDF.htm?type=NOTICE&year=2022-2023&id=${noticesArray[diff]['id']} and add downlodale filebuffer
  {
    let diff = noticesArray?.length;
    while (diff--) {
      console.log(
        "noticeArray length:",
        noticesArray?.length,
        "diff:",
        diff,
        "Attachment:",
        noticesArray[diff]["download"] === "Download"
      );
      if (noticesArray[diff]["download"] === "Download") {
        const targetPage = page;
        await targetPage.setRequestInterception(true);
        targetPage.setDefaultTimeout(10000);
        let errorOccurred = false;
        targetPage.on("request", async (request) => {
          if (!request.isInterceptResolutionHandled()) {
            const config = {
              headers: scraperConfig.AttachmentsHeaders,
            };
            config.headers["Cookie"] = request.headers()["cookie"].trim();
            if (noticesArray[diff]) {
              try {
                console.log("diff:", diff, noticesArray[diff]["id"]);
                const response = await fetch(
                  `${scraperConfig.admFileUrl}?type=${process.env.ADMFILETYPE}&year=${process.env.YEAR}&id=${noticesArray[diff]["id"]}`,
                  config
                );
                const buffer = await response.arrayBuffer();
                const fileBuffer = Buffer.from(buffer);
                noticesArray[diff]["fileBuffer"] = fileBuffer;
                process.env.NODE_ENV === "development" &&
                  console.log("file fetched");
              } catch (e) {
                console.log("admFile error:", e);
                errorOccurred = true;
              }
            }

            // fs.writeFileSync("dwnld.pdf", fileBuffer, (err) => {
            //   console.log("err writing pdf");
            // });
            // console.log(noticesArray);
            // console.log(typeof fileBuffer);
            return request.abort();
          }
        });
        const promises = [];
        promises.push(targetPage.waitForNavigation({ timeout: 0 }));
        await targetPage
          .goto(
            `${scraperConfig.admFileUrl}?type=${process.env.ADMFILETYPE}&year=${process.env.YEAR}&id=${noticesArray[diff]["id"]}`
          )
          .catch((error) => null);

        if (errorOccurred) {
          throw new Error(
            "An error occurred during the request event handling."
          );
        }
        await Promise.all(promises).catch((e) => {
          console.log("err from adm file:", e);
          throw new Error("err from adm file");
        });
      }
    }
  }
  return noticesArray;
};

module.exports = { login, fetchNoticesArray };
