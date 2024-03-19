const scraperConfig = {
  loginPageUrl: "https://erp.iitkgp.ac.in/IIT_ERP3/",
  tpStudentPageUrl:
    "https://erp.iitkgp.ac.in/TrainingPlacementSSO/TPStudent.jsp",
  noticePageUrl: "https://erp.iitkgp.ac.in/TrainingPlacementSSO/Notice.jsp",
  showContentUrl:
    "https://erp.iitkgp.ac.in/TrainingPlacementSSO/ShowContent.jsp",
  admFileUrl: "https://erp.iitkgp.ac.in/TrainingPlacementSSO/AdmFilePDF.htm",
  inputType: [
    "textarea",
    "text",
    "url",
    "tel",
    "search",
    "password",
    "number",
    "email",
  ],
  loginPageSelectors: {
    user_idSelector: [
      ["aria/Stakeholder code/login id"],
      ["#user_id"],
      ['xpath///*[@id="user_id"]'],
      ["pierce/#user_id"],
    ],
    passwordSelector: [
      ["aria/Password"],
      ["#password"],
      ['xpath///*[@id="password"]'],
      ["pierce/#password"],
    ],
    answerSelector: [
      ["#answer"],
      ['xpath///*[@id="answer"]'],
      ["pierce/#answer"],
    ],
    sendOTPButtonSelector: [
      ["#getotp"],
      ['xpath///*[@id="getotp"]'],
      ["pierce/#getotp"],
      ["text/Send OTP"],
    ],
    OTPSelector: [
      ["#email_otp1"],
      ['xpath///*[@id="email_otp1"]'],
      ["pierce/#email_otp1"],
    ],
    submitButtonSelector: [
      // ['aria/Sign In[role="button"]'],
      ["#loginFormSubmitButton"],
      ['xpath///*[@id="loginFormSubmitButton"]'],
      ["pierce/#loginFormSubmitButton"],
    ],
  },
  notificationHeadings: [
    "sno",
    "id",
    "type",
    "subject",
    "company",
    "notice",
    "noticeBy",
    "noticeTime",
    "download",
    "upload",
    "deactivate",
  ],
  NoticePageHeders: {
    "Accept":
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-US,en;q=0.9",
    "Connection": "keep-alive",
    // "Cookie": "ssoToken=6E2FFA7E1C589659035877FCCFB135DA.worker2D159664401E49D59AC66767587A7917F.worker2RJOYOMUOWF3304JW4OYE2FYCJ96PQCDAGS3T9UNDPHXZV1V4VNBEW7GD8PEE92NB; JSID#/IIT_ERP3=D159664401E49D59AC66767587A7917F.worker2; JSID#/Academic=8D4C12279E2FAE9886E3E5D7A67DA14E.worker3; JSID#/ERPAccounts=A2D082331811B1106818F07F5064ED5F.worker3",
    "Host": "erp.iitkgp.ac.in",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "sec-ch-ua":
      '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
  },
  AttachmentsHeaders: {
    "Accept":
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-US,en;q=0.9",
    "Connection": "keep-alive",
    "Host": "erp.iitkgp.ac.in",
    "Referer": "https://erp.iitkgp.ac.in/TrainingPlacementSSO/Notice.jsp",
    "Sec-Fetch-Dest": "iframe",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "sec-ch-ua":
      '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
  },
};

module.exports = { scraperConfig };
