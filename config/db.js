const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // const dbUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}`;
    const dbUri = process.env.MONGO_URI;
    const conn = await mongoose.connect(dbUri);
    process.env.NODE_ENV === "development" &&
      console.log(
        `MongoDB Connected -> DB: ${conn.connection.db.databaseName}`
      );
    console.log("connected to db");
  } catch (error) {
    process.env.NODE_ENV === "development" &&
      console.log(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
