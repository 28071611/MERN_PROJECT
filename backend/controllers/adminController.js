import User from '../models/User.js';
import Item from '../models/Item.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    // Exclude password hashes from response
    const sanitizedUsers = users.map(u => ({
      _id: u._id || u.id,
      name: u.name,
      email: u.email,
      isAdmin: u.isAdmin,
      createdAt: u.createdAt
    }));
    return res.json(sanitizedUsers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isAdmin) {
      return res.status(400).json({ message: 'Cannot delete an Admin user' });
    }

    // Delete user's posts
    await Item.deleteMany({ reporter: userId });
    
    // Delete user
    await User.findByIdAndDelete(userId);

    return res.json({ message: 'User and their reported items removed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getSystemStats = async (req, res) => {
  try {
    const totalUsers = (await User.find({})).length;
    const items = await Item.find({});

    const totalItems = items.length;
    const lostItems = items.filter(i => i.type === 'lost').length;
    const foundItems = items.filter(i => i.type === 'found').length;
    const activeItems = items.filter(i => i.status === 'active').length;
    const recoveredItems = items.filter(i => i.status === 'recovered').length;

    // Category breakdown
    const categories = {};
    items.forEach(i => {
      categories[i.category] = (categories[i.category] || 0) + 1;
    });

    return res.json({
      totalUsers,
      totalItems,
      lostItems,
      foundItems,
      activeItems,
      recoveredItems,
      categories
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
