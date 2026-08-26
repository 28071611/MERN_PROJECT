import Claim from '../models/Claim.js';
import Item from '../models/Item.js';

export const createClaim = async (req, res) => {
  try {
    const itemId = req.params.id;
    const { message, verificationInfo } = req.body;

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const claimantName = req.user?.name || req.body.claimantName || 'Anonymous';

    const claim = await Claim.create({
      item: itemId,
      claimant: req.user?._id || null,
      claimantName,
      message: message || '',
      verificationInfo: verificationInfo || ''
    });

    return res.status(201).json(claim);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getClaimsForItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Only the item reporter or admin can view claims
    const currentUserId = (req.user._id || req.user.id).toString();
    if (item.reporter.toString() !== currentUserId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view claims' });
    }

    const claims = await Claim.find({ item: itemId }).sort({ createdAt: -1 });
    return res.json(claims);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updateClaimStatus = async (req, res) => {
  try {
    const claimId = req.params.id;
    const { status } = req.body; // expected 'accepted' or 'rejected'

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const claim = await Claim.findById(claimId);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    const item = await Item.findById(claim.item);
    if (!item) return res.status(404).json({ message: 'Associated item not found' });

    const currentUserId = (req.user._id || req.user.id).toString();
    if (item.reporter.toString() !== currentUserId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update claim' });
    }

    claim.status = status;
    await claim.save();

    if (status === 'accepted') {
      item.status = 'recovered';
      await item.save();
    }

    return res.json(claim);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
