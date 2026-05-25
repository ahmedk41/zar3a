import "dotenv/config";
import { User, AgroExpertProfile } from "../src/models/index.js";

(async () => {
  try {
    const pendingExperts = await User.findAll({
      where: { pendingRole: 'AGRO_EXPERT' },
      include: [AgroExpertProfile],
    });

    console.log('Pending experts found:', pendingExperts.length);
    pendingExperts.forEach(expert => {
      console.log({
        id: expert.id,
        fullName: expert.fullName,
        email: expert.email,
        pendingRole: expert.pendingRole,
        isApproved: expert.isApproved,
        agroProfile: Boolean(expert.AgroExpertProfile),
      });
    });
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
})();