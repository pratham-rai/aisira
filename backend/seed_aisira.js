const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Event = require('./models/Event');

dotenv.config();

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected! Clearing database...');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});

    console.log('Database cleared. Creating users...');

    // Create Passwords
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1 Master Admin
    const masterAdmin = await User.create({
      email: 'master@aisira.com',
      password: hashedPassword,
      displayName: 'Master Admin',
      role: 'masterAdmin',
      isVerified: true
    });

    // 1 Admin
    const adminUser = await User.create({
      email: 'admin@aisira.com',
      password: hashedPassword,
      displayName: 'Tulunadu Admin',
      role: 'admin',
      isVerified: true
    });

    // 2 Users
    const user1 = await User.create({
      email: 'user1@example.com',
      password: hashedPassword,
      displayName: 'Kiran Kumar',
      role: 'user',
      isVerified: true
    });

    const user2 = await User.create({
      email: 'user2@example.com',
      password: hashedPassword,
      displayName: 'Priya Rai',
      role: 'user',
      isVerified: true
    });

    console.log('Users created. Creating 10 test events...');

    const events = [
      {
        category: 'Yakshagana',
        prasanga: 'Karna Parva',
        troupe: 'Dharmasthala Mela',
        date: '2026-05-20',
        time: '21:30',
        location: 'Dharmasthala Temple Grounds',
        status: 'approved',
        submittedBy: masterAdmin._id,
        submittedByName: masterAdmin.displayName
      },
      {
        category: 'Nema/Kola',
        prasanga: 'Panjurli Daiva Kola',
        troupe: 'Local Committee',
        thittu: 'N/A',
        date: '2026-05-22',
        time: '20:00',
        location: 'Puttur Mahalingeshwara Temple',
        status: 'approved',
        submittedBy: adminUser._id,
        submittedByName: adminUser.displayName
      },
      {
        category: 'Kambala',
        prasanga: 'Mulkky Kambala',
        troupe: 'Kambala Committee',
        date: '2026-05-25',
        endDate: '2026-05-26',
        time: '08:00',
        location: 'Mulky Paddy Fields',
        status: 'approved',
        submittedBy: user1._id,
        submittedByName: user1.displayName
      },
      {
        category: 'Nataka',
        prasanga: 'Shivadhutha Guliga',
        troupe: 'Vijay Kumar Kodialbail Team',
        date: '2026-05-18',
        time: '18:30',
        location: 'Town Hall, Mangalore',
        status: 'approved',
        submittedBy: adminUser._id,
        submittedByName: adminUser.displayName
      },
      {
        category: 'Temple Annual Fair',
        prasanga: 'Annual Jathre Utsava',
        troupe: 'Kulashekara Temple',
        date: '2026-05-15',
        endDate: '2026-05-19',
        time: '09:00',
        location: 'Kulashekara, Mangalore',
        status: 'approved',
        submittedBy: masterAdmin._id,
        submittedByName: masterAdmin.displayName
      },
      {
        category: 'Yakshagana',
        prasanga: 'Mahisha Mardini',
        troupe: 'Kateel Mela',
        date: '2026-06-01',
        time: '21:00',
        location: 'Kateel Temple',
        status: 'approved',
        submittedBy: user2._id,
        submittedByName: user2.displayName
      },
      {
        category: 'Nema/Kola',
        prasanga: 'Guliga Daiva Nema',
        troupe: 'Family Ritual',
        date: '2026-05-30',
        time: '22:00',
        location: 'Vamanjoor, Mangalore',
        status: 'approved',
        submittedBy: adminUser._id,
        submittedByName: adminUser.displayName
      },
      {
        category: 'Kambala',
        prasanga: 'Sankupoonja Kambala',
        troupe: 'Udupi Kambala Samithi',
        date: '2026-06-05',
        time: '09:00',
        location: 'Udupi Fields',
        status: 'approved',
        submittedBy: user1._id,
        submittedByName: user1.displayName
      },
      {
        category: 'Other Events',
        prasanga: 'Coastal Food Festival',
        troupe: 'Mangalore Tourism',
        date: '2026-05-28',
        endDate: '2026-05-31',
        time: '11:00',
        location: 'Karavali Utsav Ground',
        status: 'approved',
        submittedBy: masterAdmin._id,
        submittedByName: masterAdmin.displayName
      },
      {
        category: 'Yakshagana',
        prasanga: 'Sudhanva Garva Bhanga',
        troupe: 'Saligrama Mela',
        date: '2026-05-24',
        time: '20:30',
        location: 'Saligrama, Kundapura',
        status: 'pending',
        submittedBy: user2._id,
        submittedByName: user2.displayName
      }
    ];

    await Event.insertMany(events);
    console.log('All test events created successfully!');

    console.log('--------------------------------------------------');
    console.log('Seeding Complete! Use these credentials:');
    console.log('Master Admin: master@aisira.com / password123');
    console.log('Admin: admin@aisira.com / password123');
    console.log('Users: user1@example.com, user2@example.com / password123');
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
