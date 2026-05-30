import { User } from "./src/models/index.js";
import { hashPassword } from "./src/utils/auth.js";

(async () => {
  try {
    const admin = await User.findOne({ where: { role: 'ADMIN' } });
    if (!admin) {
      console.log('No admin user found');
      process.exit(1);
    }

    const newPasswordHash = await hashPassword('admin123');
    await User.update(
      { passwordHash: newPasswordHash },
      { where: { id: admin.id } }
    );

    console.log(`✅ Admin password updated for ${admin.email}`);
    console.log('New password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();