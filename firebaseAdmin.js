const admin = require("firebase-admin");

const serviceAccount = require("./cdc-service-account-keypair.json"); //instead of this, use a .env file
const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const messaging = app.messaging();

module.exports = messaging;
