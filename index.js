const ServerPort = process.env.PORT || 8000;
const dotenv = require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const noticeRouter = require("./routes/noticeRoutes");
const messagingRouter = require("./routes/messagingRoutes");
const cors = require("cors");

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/notices", noticeRouter);
app.use("/api/messaging", messagingRouter);

app.listen(
  ServerPort,
  () =>
    process.env.NODE_ENV === "development" &&
    console.log(`listening on port ${ServerPort}`)
);

module.exports = app;
