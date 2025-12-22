const mongoose = require("mongoose");

const connectDB = async () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then((conn) => {
      console.log(`Connected to MongoDB: ${conn.connection.name}`);
    })
    .catch((err) => console.error("MongoDB connection error:", err));
};

module.exports = connectDB;
