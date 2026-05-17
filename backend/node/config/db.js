const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URL;
  const dbName = process.env.DB_NAME;
  if (!uri) throw new Error('MONGO_URL missing in env');
  if (!dbName) throw new Error('DB_NAME missing in env');

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { dbName });
  // eslint-disable-next-line no-console
  console.log(`[mongo] connected to ${dbName}`);
}

module.exports = connectDB;
