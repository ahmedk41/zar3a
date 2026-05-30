import "dotenv/config";
import { User } from "../src/models/index.js";
import { hashPassword } from "../src/utils/auth.js";

const createPendingExperts = async () => {
  try {
    console.log("🔧 Creating test pending experts...");

    // Create test users who chose AGRO_EXPERT role
    const testUsers = [
      {
        fullName: "John Expert",
        username: "john_expert",
        email: "john.expert@test.com",
        phone: "1111111111",
        password: "password123"
      },
      {
        fullName: "Sarah Specialist",
        username: "sarah_specialist",
        email: "sarah.specialist@test.com",
        phone: "2222222222",
        password: "password123"
      },
      {
        fullName: "Mike Consultant",
        username: "mike_consultant",
        email: "mike.consultant@test.com",
        phone: "3333333333",
        password: "password123"
      }
    ];

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (existingUser) {
        console.log(`✅ User ${userData.email} already exists`);
        continue;
      }

      // Create user
      const user = await User.create({
        fullName: userData.fullName,
        username: userData.username,
        email: userData.email,
        phone: userData.phone,
        passwordHash: await hashPassword(userData.password),
        role: null,
        pendingRole: 'AGRO_EXPERT',
        isApproved: false,
        isVerified: true,
      });

      console.log(`✅ Created pending expert: ${userData.email} (ID: ${user.id})`);
    }

    console.log("🎉 Test pending experts creation completed!");

  } catch (error) {
    console.error("❌ Error creating test users:", error);
  } finally {
    process.exit(0);
  }
};

createPendingExperts();