import 'dotenv/config';
import mongoose from 'mongoose';
import Claim from '../models/Claim.js';
import Item from '../models/Item.js';
import User from '../models/User.js';

const localHosts = new Set(['localhost', '127.0.0.1', '::1']);
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error('MONGO_URI must point to a local MongoDB instance to seed guide data.');
}

const mongoHost = new URL(mongoUri).hostname;
if (!localHosts.has(mongoHost) || process.env.NODE_ENV === 'production') {
  throw new Error('Guide data can only be seeded into a local, non-production MongoDB database.');
}

const guideItems = [
  {
    _id: new mongoose.Types.ObjectId('672000000000000000000001'),
    name: 'Navy Canvas Backpack',
    category: 'Bags / Backpack',
    description: 'Navy backpack with a green sketchbook and brass compass keychain inside.',
    type: 'found',
    location: 'Central Library',
    detailedLocation: { building: 'Main Library', floor: '2', area: 'West Reading Area' },
    date: '2026-10-11',
    contact: '202-555-0142',
    status: 'active'
  },
  {
    _id: new mongoose.Types.ObjectId('672000000000000000000002'),
    name: 'Brass Keyring with Blue Tag',
    category: 'Keys',
    description: 'Three keys on a brass ring with a small blue plastic tag.',
    type: 'lost',
    location: 'Science Block',
    detailedLocation: { building: 'Science Block', floor: '1', area: 'Near Room 104' },
    date: '2026-10-12',
    contact: '202-555-0142',
    status: 'active'
  },
  {
    _id: new mongoose.Types.ObjectId('672000000000000000000003'),
    name: 'Stainless Steel Water Bottle',
    category: 'Other',
    description: 'Silver insulated bottle with a small mountain sticker.',
    type: 'lost',
    location: 'Sports Complex',
    detailedLocation: { building: 'Sports Complex', area: 'Indoor court' },
    date: '2026-10-10',
    contact: '202-555-0142',
    status: 'active'
  },
  {
    _id: new mongoose.Types.ObjectId('672000000000000000000004'),
    name: 'Student ID Holder',
    category: 'ID Card / Badge',
    description: 'Blue card holder with a silver clip. Item has been returned.',
    type: 'found',
    location: 'Student Center',
    detailedLocation: { building: 'Student Center', floor: '1', area: 'Reception desk' },
    date: '2026-10-08',
    contact: '202-555-0142',
    status: 'recovered'
  }
];

const guideClaim = {
  _id: new mongoose.Types.ObjectId('672000000000000000000101'),
  item: guideItems[0]._id,
  claimantName: 'Guide Demo Claimant',
  message: 'I believe this backpack is mine.',
  verificationInfo: 'It contains my green sketchbook and brass compass keychain.',
  status: 'pending'
};

const seedGuideData = async () => {
  await mongoose.connect(mongoUri);

  const reporter = await User.findOne({ isAdmin: true }).sort({ createdAt: 1 })
    || await User.findOne().sort({ createdAt: 1 });
  if (!reporter) {
    throw new Error('Create a user account before seeding guide data.');
  }

  let insertedItems = 0;
  for (const guideItem of guideItems) {
    const { _id, ...itemData } = guideItem;
    const result = await Item.updateOne(
      { _id },
      { $setOnInsert: { ...itemData, reporter: reporter._id.toString(), reporterName: 'Guide Demo Reporter' } },
      { upsert: true }
    );
    insertedItems += result.upsertedCount;
  }

  const { _id: claimId, ...claimData } = guideClaim;
  const claimResult = await Claim.updateOne(
    { _id: claimId },
    { $setOnInsert: { ...claimData, claimant: null } },
    { upsert: true }
  );

  console.log(`Guide data ready: ${insertedItems} item(s) added, ${claimResult.upsertedCount} claim(s) added.`);
};

try {
  await seedGuideData();
} catch (error) {
  console.error(`Could not seed guide data: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
