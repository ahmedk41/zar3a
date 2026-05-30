import { Sequelize } from 'sequelize';
import User from './src/models/User.js';
import AgroExpertProfile from './src/models/AgroExpertProfile.js';

(async () => {
  try {
    const sequelize = new Sequelize('mysql://root:password@localhost:3306/zar3a_db');
    await sequelize.authenticate();
    console.log('Database connected');

    const pendingExperts = await User.findAll({
      where: { pendingRole: 'AGRO_EXPERT', isApproved: false },
      include: [AgroExpertProfile],
    });

    console.log('Pending experts found:', pendingExperts.length);
    pendingExperts.forEach(expert => {
      console.log('ID:', expert.id, 'Name:', expert.fullName, 'Email:', expert.email, 'Has Profile:', !!expert.AgroExpertProfile);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();