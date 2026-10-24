// Creates (or updates) an admin account directly in the database.
// Admins can't register through the public API on purpose.
//
// Usage:
//   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=yourStrongPassword npm run create-admin
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");

const run = async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, MONGO_URL } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !MONGO_URL) {
    console.error("Set ADMIN_EMAIL, ADMIN_PASSWORD and MONGO_URL first.");
    process.exit(1);
  }
  await mongoose.connect(MONGO_URL);
  const password = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await userModel.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    {
      role: "admin",
      name: "Admin",
      email: ADMIN_EMAIL,
      password,
      address: "N/A",
      phone: "N/A",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`Admin ready: ${ADMIN_EMAIL}`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
