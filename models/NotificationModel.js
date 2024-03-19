const mongoose = require("mongoose");

const noticeCounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 1 },
});

const NoticeCounter = mongoose.model("NoticeCounter", noticeCounterSchema);

const noticeSchema = new mongoose.Schema(
  {
    sno: {
      type: Number,
      required: true,
    },
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    customSno: {
      type: Number,
      unique: true,
      default: 0,
    },
    type: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    notice: {
      type: String,
      required: true,
    },
    noticeBy: {
      type: String,
      required: true,
    },
    noticeTime: {
      type: Date,
      required: true,
    },
    download: {
      type: String,
      default: "",
    },
    upload: {
      type: String,
      default: "Upload",
    },
    deactivate: {
      type: String,
      default: "deactivate",
    },
    htmlContent: {
      type: String,
      required: true,
    },
    fileBuffer: {
      type: Buffer,
      default: null,
    },
  },
  { timestamps: true }
);

noticeSchema.pre("save", async function (next) {
  if (!this.isNew) {
    return next();
  }
  try {
    const noticeCounter = await NoticeCounter.findByIdAndUpdate(
      { _id: "customSno" },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    ).lean();

    this.customSno = noticeCounter.seq;
    next();
  } catch (error) {
    next(error);
  }
});

const NoticeModel = mongoose.model("Notice", noticeSchema);

module.exports = NoticeModel;
