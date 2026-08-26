import mongoose from 'mongoose';

const ClaimSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  claimant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  claimantName: { type: String, required: true },
  message: { type: String },
  verificationInfo: { type: String },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const Claim = mongoose.models.Claim || mongoose.model('Claim', ClaimSchema);

export default Claim;
