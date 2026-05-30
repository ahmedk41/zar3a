import { User } from "./src/models/index.js";
import { hashPassword } from "./src/utils/auth.js";

(async () => {
  try {
    const password = 'admin123';
    const passwordHash = await hashPassword(password);

    const [user, created] = await User.findOrCreate({
      where: { email: 'admin@zar3a.com' },
      defaults: {
        fullName: 'admin',
        username: 'admin',
        phone: '201503933299',
        passwordHash,
        role: 'ADMIN',
        isVerified: true,
        isApproved: true,
        isActive: true,
      }
    });

    if (created) {
      console.log('✅ Admin user created successfully:');
      console.log(`   Email: ${user.email}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Role: ${user.role}`);
    } else {
      console.log('ℹ️ Admin user already exists. Updating credentials...');
      await user.update({
        fullName: 'admin',
        username: 'admin',
        phone: '201503933299',
        passwordHash,
        role: 'ADMIN',
        isVerified: true,
        isApproved: true,
        isActive: true,
      });
      console.log('✅ Admin user updated successfully.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating/updating admin user:', error);
    process.exit(1);
  }
})();
