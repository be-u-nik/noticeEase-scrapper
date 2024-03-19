const { google } = require("googleapis");
const credentials = require("./oAuthCredentials.json");
const { client_secret, client_id, redirect_uris } = credentials.web;
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);
async function fetchERPEmails() {
  try {
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
    process.env.NODE_ENV === "development" && console.log("granted gmail");

    const response = await gmail.users.messages.list({
      userId: "me",
      q: `from:${process.env.ERP_EMAIL_FOR_OTP}`,
    });
    const messages = response.data.messages;
    process.env.NODE_ENV === "development" &&
      console.log("messages:", messages);
    if (messages && messages.length > 0) {
      process.env.NODE_ENV === "development" && console.log("Latest Emails:");
      const messageId = messages[0].id;
      const email = await gmail.users.messages.get({
        userId: "me",
        id: messageId,
      });

      const subject = email.data.payload.headers.find(
        (header) => header.name === "Subject"
      ).value;
      const body = email.data.snippet;
      process.env.NODE_ENV === "development" &&
        console.log("Subject:", subject);
      process.env.NODE_ENV === "development" && console.log("Body:", body);
      const otp = body.split(" ").slice(-1)[0];
      process.env.NODE_ENV === "development" && console.log(otp);
      return otp;
    } else {
      process.env.NODE_ENV === "development" && console.log("No emails found.");
    }
  } catch (error) {
    process.env.NODE_ENV === "development" &&
      console.error("Error: fetchERPEmails", error.message);
  }
}
async function getERPLoginOTP() {
  try {
    oAuth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
    });
  } catch (error) {
    process.env.NODE_ENV === "development" && console.log("auth failed", error);
  }
  var latestOTP;
  await new Promise((resolve) =>
    setTimeout(async () => {
      latestOTP = await fetchERPEmails();
      resolve();
    }, 40000)
  );
  process.env.NODE_ENV === "development" && console.log(latestOTP);
  return latestOTP;
}

module.exports = { getERPLoginOTP };
