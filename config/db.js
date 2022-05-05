const mongoose = require('mongoose');

const DB = process.env.DATABASE;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      //   useFindAndModify: false,
    });
    console.log(`MongoDB Connected:${conn.connection.host} `);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;
