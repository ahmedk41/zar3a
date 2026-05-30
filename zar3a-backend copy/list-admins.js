import { User } from "./src/models/index.js";

(async () => {
  try {
    const admins = await User.findAll({
      where: { role: 'ADMIN' },
      attributes: ['id', 'fullName', 'username', 'email', 'phone']
    });

    console.log('Admin users found:', admins.length);
    admins.forEach(admin => {
      console.log(`ID: ${admin.id}, Name: ${admin.fullName}, Email: ${admin.email}, Username: ${admin.username}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();