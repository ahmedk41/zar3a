// scripts/create-admin.js
import "dotenv/config";
import { User } from "../src/models/index.js";
import { hashPassword } from "../src/utils/auth.js";

const ADMIN_EMAIL = "admin@zar3a.com";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

const createAdmin = async () => {
  try {
    console.log("🔧 Creating admin user...");

    const existingAdminByEmail = await User.findOne({ where: { email: ADMIN_EMAIL } });
    if (existingAdminByEmail) {
      console.log("✅ Admin user already exists:", existingAdminByEmail.email);
      return;
    }

    const existingAdmin = await User.findOne({ where: { role: 'ADMIN' } });
    if (existingAdmin) {
      console.log("⚠️ Admin role already exists with a different email:", existingAdmin.email);
      await User.update({ email: ADMIN_EMAIL, username: ADMIN_USERNAME }, { where: { id: existingAdmin.id } });
      console.log("✅ Updated existing admin to:", ADMIN_EMAIL);
      return;
    }

    const adminUser = await User.create({
      fullName: "System Administrator",
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      phone: "0000000000",
      passwordHash: await hashPassword(ADMIN_PASSWORD),
      role: "ADMIN",
      isApproved: true,
      isVerified: true,
    });

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email:", adminUser.email);
    console.log("🔑 Password:", ADMIN_PASSWORD);
    console.log("🆔 User ID:", adminUser.id);

  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    process.exit(0);
  }
};

createAdmin();