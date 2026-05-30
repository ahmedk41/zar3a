import 'dotenv/config';
import { sequelize, User, AgroExpertProfile, ExpertListing } from './src/models/index.js';
import { hashPassword } from './src/utils/auth.js';

const seedExperts = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database.');

    // Clear existing experts and listings to avoid duplicates
    const expertEmails = ['dr.salem@zar3a.com', 'eng.sarah@zar3a.com', 'prof.mohamed@zar3a.com'];
    const existingExperts = await User.findAll({ where: { email: expertEmails } });
    for (const exp of existingExperts) {
      await ExpertListing.destroy({ where: { userId: exp.id } });
      await AgroExpertProfile.destroy({ where: { userId: exp.id } });
      await exp.destroy();
    }

    const hashed = await hashPassword('password123');

    // Create 3 Approved Experts
    const expert1 = await User.create({
      fullName: 'Dr. Ahmed Salem',
      username: 'ahmed_salem',
      email: 'dr.salem@zar3a.com',
      phone: '123456789012',
      passwordHash: hashed,
      role: 'AGRO_EXPERT',
      isApproved: true,
      isVerified: true,
    });

    const expert2 = await User.create({
      fullName: 'Eng. Sarah Younis',
      username: 'sarah_younis',
      email: 'eng.sarah@zar3a.com',
      phone: '123456789013',
      passwordHash: hashed,
      role: 'AGRO_EXPERT',
      isApproved: true,
      isVerified: true,
    });

    const expert3 = await User.create({
      fullName: 'Prof. Mohamed Ali',
      username: 'mohamed_ali',
      email: 'prof.mohamed@zar3a.com',
      phone: '123456789014',
      passwordHash: hashed,
      role: 'AGRO_EXPERT',
      isApproved: true,
      isVerified: true,
    });

    // Create AgroExpertProfiles
    await AgroExpertProfile.create({
      userId: expert1.id,
      academicDegree: 'PhD in Soil Science',
      experienceYears: 15,
      bio: 'Specializes in smart irrigation systems and soil salinity management.',
    });

    await AgroExpertProfile.create({
      userId: expert2.id,
      academicDegree: 'MSc in Plant Pathology',
      experienceYears: 8,
      bio: 'Expert in greenhouse crop diseases and biological control.',
    });

    await AgroExpertProfile.create({
      userId: expert3.id,
      academicDegree: 'PhD in Agronomy',
      experienceYears: 20,
      bio: 'Consultant for vertical farming and hydroponic systems.',
    });

    // Create ExpertListings
    await ExpertListing.create({
      userId: expert1.id,
      title: 'Soil & Irrigation Specialist',
      specialty: 'Soil & Irrigation Specialist',
      description: 'Specializes in smart irrigation systems and soil salinity management for desert environments.',
      hourlyRate: 220,
      location: 'Cairo',
      imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
      isVerified: true,
    });

    await ExpertListing.create({
      userId: expert2.id,
      title: 'Plant Pathology Expert',
      specialty: 'Plant Pathology Expert',
      description: 'Expert in identifying and treating fungal and viral diseases in greenhouse crops.',
      hourlyRate: 180,
      location: 'Alexandria',
      imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      isVerified: true,
    });

    await ExpertListing.create({
      userId: expert3.id,
      title: 'Hydroponics Consultant',
      specialty: 'Hydroponics Consultant',
      description: 'Pioneer in vertical farming and nutrient film technique (NFT) systems in Egypt.',
      hourlyRate: 300,
      location: 'Giza',
      imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mohamed',
      isVerified: true,
    });

    console.log('✅ Experts and listings seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedExperts();
