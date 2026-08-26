import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  images: [{ type: String }],
  type: { type: String, enum: ['lost', 'found'], required: true },
  location: { type: String, required: true },
  detailedLocation: {
    building: { type: String },
    block: { type: String },
    floor: { type: String },
    room: { type: String },
    area: { type: String }
  },
  date: { type: String, required: true },
  contact: { type: String, required: true },
  reporter: { type: String, required: true },
  reporterName: { type: String, required: true },
  status: { type: String, enum: ['active', 'recovered'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

const Item = mongoose.models.Item || mongoose.model('Item', ItemSchema);

export default Item;
