const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const User = require('../models/User');
const Community = require('../models/Community');
const Event = require('../models/Event');
const Companion = require('../models/Companion');
const MarketplaceItem = require('../models/MarketplaceItem');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Community.deleteMany({}),
      Event.deleteMany({}),
      Companion.deleteMany({}),
      MarketplaceItem.deleteMany({})
    ]);

    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@letsresonate.com',
      password: 'admin123',
      phone: '+91 9876543210',
      role: 'admin',
      bio: 'Platform administrator for Let\'s Resonate',
      gender: 'prefer-not-to-say',
      profileImage: '',
      location: { type: 'Point', coordinates: [85.3096, 23.3441], city: 'Ranchi' },
      interests: ['technology', 'management'],
      trustScore: 100,
      verification: { isVerified: true, status: 'verified', verifiedAt: new Date() }
    });

    // Create demo users
    const demoUsers = [
      {
        name: 'Rahul Sharma',
        email: 'rahul@demo.com',
        password: 'demo123',
        phone: '+91 9876543211',
        bio: 'Photographer & traveler. Love exploring new places and meeting new people! 📷🌍',
        gender: 'male',
        location: { type: 'Point', coordinates: [85.3240, 23.3500], city: 'Ranchi' },
        interests: ['photography', 'travel', 'hiking', 'food'],
        languages: ['Hindi', 'English'],
        trustScore: 87,
        verification: { isVerified: true, status: 'verified', verifiedAt: new Date() }
      },
      {
        name: 'Priya Patel',
        email: 'priya@demo.com',
        password: 'demo123',
        phone: '+91 9876543212',
        bio: 'Art enthusiast | Yoga practitioner | Looking for creative souls to connect with ✨',
        gender: 'female',
        location: { type: 'Point', coordinates: [85.3100, 23.3550], city: 'Ranchi' },
        interests: ['art', 'yoga', 'music', 'cooking'],
        languages: ['Hindi', 'English', 'Gujarati'],
        trustScore: 92,
        verification: { isVerified: true, status: 'verified', verifiedAt: new Date() }
      },
      {
        name: 'Amit Kumar',
        email: 'amit@demo.com',
        password: 'demo123',
        phone: '+91 9876543213',
        bio: 'Software developer by day, musician by night 🎸 Always up for jam sessions!',
        gender: 'male',
        location: { type: 'Point', coordinates: [85.3350, 23.3600], city: 'Ranchi' },
        interests: ['music', 'technology', 'gaming', 'sports'],
        languages: ['Hindi', 'English'],
        trustScore: 75,
        verification: { isVerified: false, status: 'none' }
      },
      {
        name: 'Sneha Gupta',
        email: 'sneha@demo.com',
        password: 'demo123',
        phone: '+91 9876543214',
        bio: 'Foodie | Blogger | Adventure seeker 🏔️ Let\'s explore together!',
        gender: 'female',
        location: { type: 'Point', coordinates: [85.2900, 23.3400], city: 'Ranchi' },
        interests: ['food', 'blogging', 'adventure', 'photography'],
        languages: ['Hindi', 'English', 'Bengali'],
        trustScore: 81,
        verification: { isVerified: true, status: 'verified', verifiedAt: new Date() }
      },
      {
        name: 'Vikram Singh',
        email: 'vikram@demo.com',
        password: 'demo123',
        phone: '+91 9876543215',
        bio: 'Fitness coach and outdoor enthusiast. Love trekking and rock climbing! 💪',
        gender: 'male',
        location: { type: 'Point', coordinates: [85.3180, 23.3650], city: 'Ranchi' },
        interests: ['fitness', 'trekking', 'rock-climbing', 'nutrition'],
        languages: ['Hindi', 'English', 'Punjabi'],
        trustScore: 88,
        verification: { isVerified: true, status: 'verified', verifiedAt: new Date() },
        isCompanion: true
      },
      {
        name: 'Ananya Roy',
        email: 'ananya@demo.com',
        password: 'demo123',
        phone: '+91 9876543216',
        bio: 'Literature lover | Coffee addict ☕ | Looking for book club members',
        gender: 'female',
        location: { type: 'Point', coordinates: [85.3050, 23.3350], city: 'Ranchi' },
        interests: ['reading', 'writing', 'coffee', 'movies'],
        languages: ['Hindi', 'English', 'Bengali'],
        trustScore: 79
      },
      {
        name: 'Rohan Mehta',
        email: 'rohan@demo.com',
        password: 'demo123',
        phone: '+91 9876543217',
        bio: 'DJ & Music producer 🎧 Always looking for new venues and collaborations',
        gender: 'male',
        location: { type: 'Point', coordinates: [85.3400, 23.3480], city: 'Ranchi' },
        interests: ['music', 'djing', 'nightlife', 'technology'],
        languages: ['Hindi', 'English'],
        trustScore: 72,
        isCompanion: true
      },
      {
        name: 'Kavya Nair',
        email: 'kavya@demo.com',
        password: 'demo123',
        phone: '+91 9876543218',
        bio: 'Dance instructor | Cultural events organizer | Spreading joy through dance 💃',
        gender: 'female',
        location: { type: 'Point', coordinates: [85.2950, 23.3520], city: 'Ranchi' },
        interests: ['dance', 'culture', 'events', 'travel'],
        languages: ['Hindi', 'English', 'Malayalam'],
        trustScore: 91,
        verification: { isVerified: true, status: 'verified', verifiedAt: new Date() },
        isCompanion: true
      }
    ];

    const users = await User.create(demoUsers);
    console.log(`Created ${users.length} demo users + 1 admin`);

    // Create communities
    const communities = await Community.create([
      {
        name: 'Ranchi Photographers',
        description: 'A community for photography enthusiasts in Ranchi. Share your best shots, learn techniques, and join photo walks!',
        category: 'photography',
        location: { type: 'Point', coordinates: [85.3096, 23.3441], city: 'Ranchi' },
        creator: users[0]._id,
        members: [
          { user: users[0]._id, role: 'admin' },
          { user: users[1]._id },
          { user: users[3]._id },
          { user: users[7]._id }
        ],
        memberCount: 4,
        tags: ['photography', 'art', 'creative']
      },
      {
        name: 'Jharkhand Trekkers',
        description: 'Explore the beautiful hills and forests of Jharkhand! Weekly treks, camping trips, and nature walks.',
        category: 'nature',
        location: { type: 'Point', coordinates: [85.3200, 23.3500], city: 'Ranchi' },
        creator: users[4]._id,
        members: [
          { user: users[4]._id, role: 'admin' },
          { user: users[0]._id },
          { user: users[2]._id },
          { user: users[3]._id },
          { user: users[6]._id }
        ],
        memberCount: 5,
        tags: ['trekking', 'nature', 'adventure', 'fitness']
      },
      {
        name: 'Foodies of Ranchi',
        description: 'Discover hidden food gems, share recipes, and organize food crawls across the city!',
        category: 'food',
        location: { type: 'Point', coordinates: [85.3100, 23.3440], city: 'Ranchi' },
        creator: users[3]._id,
        members: [
          { user: users[3]._id, role: 'admin' },
          { user: users[1]._id },
          { user: users[5]._id },
          { user: users[7]._id }
        ],
        memberCount: 4,
        tags: ['food', 'cooking', 'restaurants']
      },
      {
        name: 'Tech Meetup Ranchi',
        description: 'Monthly tech meetups, hackathons, and coding sessions. Open to developers, designers, and tech enthusiasts.',
        category: 'tech',
        location: { type: 'Point', coordinates: [85.3150, 23.3460], city: 'Ranchi' },
        creator: users[2]._id,
        members: [
          { user: users[2]._id, role: 'admin' },
          { user: users[6]._id },
          { user: users[0]._id }
        ],
        memberCount: 3,
        tags: ['technology', 'coding', 'startups']
      },
      {
        name: 'Music Lovers Jharkhand',
        description: 'For anyone who loves music! Live performances, jam sessions, and music sharing.',
        category: 'music',
        location: { type: 'Point', coordinates: [85.3300, 23.3480], city: 'Ranchi' },
        creator: users[6]._id,
        members: [
          { user: users[6]._id, role: 'admin' },
          { user: users[2]._id },
          { user: users[7]._id },
          { user: users[1]._id }
        ],
        memberCount: 4,
        tags: ['music', 'live', 'concerts']
      }
    ]);
    console.log(`Created ${communities.length} communities`);

    // Create events
    const now = new Date();
    const events = await Event.create([
      {
        title: 'Golden Hour Photography Walk',
        description: 'Join us for a beautiful photography walk around Ranchi Lake during golden hour. Bring your camera or phone!',
        category: 'photography',
        location: { type: 'Point', coordinates: [85.3240, 23.3600], address: 'Ranchi Lake', city: 'Ranchi' },
        date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        time: '05:00 PM',
        organizer: users[0]._id,
        community: communities[0]._id,
        participants: [{ user: users[0]._id }, { user: users[1]._id }, { user: users[3]._id }],
        participantCount: 3,
        maxParticipants: 20,
        tags: ['photography', 'nature', 'golden-hour']
      },
      {
        title: 'Weekend Trek to Hundru Falls',
        description: 'A moderate difficulty trek to the stunning Hundru Falls. All fitness levels welcome. Lunch provided!',
        category: 'adventure',
        location: { type: 'Point', coordinates: [85.4300, 23.4200], address: 'Hundru Falls', city: 'Ranchi' },
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        time: '06:00 AM',
        organizer: users[4]._id,
        community: communities[1]._id,
        participants: [{ user: users[4]._id }, { user: users[0]._id }, { user: users[2]._id }, { user: users[3]._id }],
        participantCount: 4,
        maxParticipants: 15,
        isFree: false,
        price: 500,
        tags: ['trekking', 'waterfall', 'adventure']
      },
      {
        title: 'Street Food Crawl - Main Road',
        description: 'Explore the best street food in Ranchi! We\'ll visit 5 iconic food stalls.',
        category: 'food',
        location: { type: 'Point', coordinates: [85.3100, 23.3500], address: 'Main Road', city: 'Ranchi' },
        date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        time: '06:00 PM',
        organizer: users[3]._id,
        community: communities[2]._id,
        participants: [{ user: users[3]._id }, { user: users[1]._id }, { user: users[5]._id }],
        participantCount: 3,
        maxParticipants: 12,
        tags: ['food', 'street-food', 'culture']
      },
      {
        title: 'React.js Workshop for Beginners',
        description: 'Learn React.js from scratch! Hands-on workshop with live coding. Laptop required.',
        category: 'workshop',
        location: { type: 'Point', coordinates: [85.3150, 23.3460], address: 'Tech Hub Ranchi', city: 'Ranchi' },
        date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        time: '10:00 AM',
        organizer: users[2]._id,
        community: communities[3]._id,
        participants: [{ user: users[2]._id }, { user: users[6]._id }],
        participantCount: 2,
        maxParticipants: 30,
        tags: ['react', 'coding', 'workshop']
      },
      {
        title: 'Open Mic Night',
        description: 'Showcase your talent! Singers, musicians, poets, and comedians welcome. First come, first perform.',
        category: 'music',
        location: { type: 'Point', coordinates: [85.3300, 23.3480], address: 'Café Central', city: 'Ranchi' },
        date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        time: '07:00 PM',
        organizer: users[6]._id,
        community: communities[4]._id,
        participants: [{ user: users[6]._id }, { user: users[2]._id }, { user: users[7]._id }, { user: users[1]._id }],
        participantCount: 4,
        maxParticipants: 40,
        tags: ['music', 'open-mic', 'performance']
      }
    ]);
    console.log(`Created ${events.length} events`);

    // Create companion profiles
    const companions = await Companion.create([
      {
        user: users[4]._id,
        tagline: 'Your adventure buddy in Ranchi!',
        about: 'Certified fitness trainer and outdoor enthusiast. I know every trail around Jharkhand. Let me show you the hidden gems!',
        specialties: ['adventure', 'fitness', 'exploration'],
        languages: ['Hindi', 'English', 'Punjabi'],
        hourlyRate: 500,
        location: { type: 'Point', coordinates: [85.3180, 23.3650], city: 'Ranchi' },
        availability: 'available',
        rating: 4.8,
        totalReviews: 24,
        totalBookings: 32,
        isApproved: true,
        schedule: [
          { day: 'monday', startTime: '06:00', endTime: '20:00' },
          { day: 'wednesday', startTime: '06:00', endTime: '20:00' },
          { day: 'friday', startTime: '06:00', endTime: '20:00' },
          { day: 'saturday', startTime: '06:00', endTime: '22:00' },
          { day: 'sunday', startTime: '06:00', endTime: '22:00' }
        ]
      },
      {
        user: users[6]._id,
        tagline: 'Explore Ranchi\'s nightlife with me!',
        about: 'Music producer and nightlife expert. I know all the best clubs, cafes, and live music venues in Ranchi.',
        specialties: ['nightlife', 'food', 'cultural'],
        languages: ['Hindi', 'English'],
        hourlyRate: 400,
        location: { type: 'Point', coordinates: [85.3400, 23.3480], city: 'Ranchi' },
        availability: 'available',
        rating: 4.5,
        totalReviews: 15,
        totalBookings: 20,
        isApproved: true,
        schedule: [
          { day: 'thursday', startTime: '17:00', endTime: '23:00' },
          { day: 'friday', startTime: '17:00', endTime: '23:00' },
          { day: 'saturday', startTime: '15:00', endTime: '23:00' }
        ]
      },
      {
        user: users[7]._id,
        tagline: 'Cultural companion & dance guide',
        about: 'Professional dance instructor with deep knowledge of Jharkhand\'s culture. I\'ll take you to the best cultural spots!',
        specialties: ['cultural', 'exploration', 'photography'],
        languages: ['Hindi', 'English', 'Malayalam'],
        hourlyRate: 600,
        location: { type: 'Point', coordinates: [85.2950, 23.3520], city: 'Ranchi' },
        availability: 'available',
        rating: 4.9,
        totalReviews: 31,
        totalBookings: 45,
        isApproved: true,
        schedule: [
          { day: 'monday', startTime: '09:00', endTime: '18:00' },
          { day: 'tuesday', startTime: '09:00', endTime: '18:00' },
          { day: 'wednesday', startTime: '09:00', endTime: '18:00' },
          { day: 'saturday', startTime: '10:00', endTime: '20:00' },
          { day: 'sunday', startTime: '10:00', endTime: '20:00' }
        ]
      }
    ]);
    console.log(`Created ${companions.length} companion profiles`);

    // Create marketplace items
    const marketplaceItems = await MarketplaceItem.create([
      {
        title: 'Canon EOS 1500D DSLR Camera',
        description: 'Rent my DSLR for your weekend trips. Comes with 18-55mm kit lens. Perfect for beginners.',
        category: 'photography',
        type: 'rent',
        price: 800,
        priceUnit: 'per-day',
        condition: 'good',
        location: { type: 'Point', coordinates: [85.3240, 23.3500], city: 'Ranchi' },
        seller: users[0]._id,
        views: 45
      },
      {
        title: 'Camping Tent (4 Person)',
        description: 'Waterproof camping tent, used only 3 times. Great for Jharkhand monsoon treks.',
        category: 'camping',
        type: 'rent',
        price: 500,
        priceUnit: 'per-day',
        condition: 'like-new',
        location: { type: 'Point', coordinates: [85.3180, 23.3650], city: 'Ranchi' },
        seller: users[4]._id,
        views: 32
      },
      {
        title: 'Mountain Bike - Hero Sprint',
        description: 'Well-maintained mountain bike, perfect for exploring Ranchi trails.',
        category: 'sports',
        type: 'rent',
        price: 300,
        priceUnit: 'per-day',
        condition: 'good',
        location: { type: 'Point', coordinates: [85.3350, 23.3600], city: 'Ranchi' },
        seller: users[2]._id,
        views: 28
      },
      {
        title: 'Portable Bluetooth Speaker',
        description: 'JBL Flip 5, perfect for outdoor gatherings and picnics.',
        category: 'electronics',
        type: 'rent',
        price: 200,
        priceUnit: 'per-day',
        condition: 'like-new',
        location: { type: 'Point', coordinates: [85.3400, 23.3480], city: 'Ranchi' },
        seller: users[6]._id,
        views: 19
      },
      {
        title: 'Travel Backpack 60L',
        description: 'Wildcraft 60L rucksack. Perfect for multi-day treks. Selling because I upgraded.',
        category: 'camping',
        type: 'sell',
        price: 2500,
        priceUnit: 'fixed',
        condition: 'good',
        location: { type: 'Point', coordinates: [85.3100, 23.3550], city: 'Ranchi' },
        seller: users[1]._id,
        views: 15
      },
      {
        title: 'Yoga Mat & Blocks Set',
        description: 'Premium yoga mat with 2 blocks. Sharing for free during community yoga sessions!',
        category: 'sports',
        type: 'share',
        price: 0,
        priceUnit: 'free',
        condition: 'good',
        location: { type: 'Point', coordinates: [85.3100, 23.3550], city: 'Ranchi' },
        seller: users[1]._id,
        views: 22
      }
    ]);
    console.log(`Created ${marketplaceItems.length} marketplace items`);

    console.log('\n✅ Seed data complete!');
    console.log('\n📧 Login credentials:');
    console.log('  Admin: admin@letsresonate.com / admin123');
    console.log('  User:  rahul@demo.com / demo123');
    console.log('  User:  priya@demo.com / demo123');
    console.log('  User:  amit@demo.com / demo123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
