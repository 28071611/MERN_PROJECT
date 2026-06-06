import Item from '../models/Item.js';

export const createItem = async (req, res) => {
  const { name, category, description, type, location, date, contact } = req.body;

  if (!name || !category || !type || !location || !date || !contact) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const item = await Item.create({
      name,
      category,
      description,
      type,
      location,
      date,
      contact,
      reporter: req.user._id || req.user.id,
      reporterName: req.user.name,
      status: 'active'
    });

    return res.status(201).json(item);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getItems = async (req, res) => {
  try {
    const { type, category, search, location } = req.query;
    let query = {};

    if (type) {
      query.type = type;
    }
    if (category) {
      query.category = category;
    }
    
    let items = await Item.find(query);

    // Manual filtering for complex/text search when JSON DB is used or as simple post-filter
    if (search || location) {
      const searchLower = search ? search.toLowerCase() : '';
      const locLower = location ? location.toLowerCase() : '';

      items = items.filter(item => {
        let matchesSearch = true;
        let matchesLoc = true;

        if (searchLower) {
          matchesSearch = (
            item.name.toLowerCase().includes(searchLower) ||
            (item.description && item.description.toLowerCase().includes(searchLower))
          );
        }

        if (locLower) {
          matchesLoc = item.location.toLowerCase().includes(locLower);
        }

        return matchesSearch && matchesLoc;
      });
    }

    // Sort items by creation time descending
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json(items);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    return res.json(item);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check ownership or admin
    const reporterId = item.reporter.toString();
    const currentUserId = (req.user._id || req.user.id).toString();

    if (reporterId !== currentUserId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );

    return res.json(updatedItem);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const reporterId = item.reporter.toString();
    const currentUserId = (req.user._id || req.user.id).toString();

    if (reporterId !== currentUserId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await Item.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Item removed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ reporter: req.user._id || req.user.id });
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(items);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Smart matching logic: Find items of opposite type with same category or similar names
export const getMatches = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const oppositeType = item.type === 'lost' ? 'found' : 'lost';
    
    // Find all items of the opposite type
    let candidates = await Item.find({ type: oppositeType, status: 'active' });

    // Score candidates based on category, name similarity, and location
    const matched = candidates.map(cand => {
      let score = 0;
      
      // Category match is highly relevant
      if (cand.category.toLowerCase() === item.category.toLowerCase()) {
        score += 50;
      }

      // Name similarity (words overlap)
      const itemWords = item.name.toLowerCase().split(/\s+/);
      const candWords = cand.name.toLowerCase().split(/\s+/);
      const overlappingWords = itemWords.filter(word => word.length > 2 && candWords.includes(word));
      score += overlappingWords.length * 20;

      // Location match
      if (cand.location.toLowerCase() === item.location.toLowerCase()) {
        score += 30;
      } else if (
        cand.location.toLowerCase().includes(item.location.toLowerCase()) || 
        item.location.toLowerCase().includes(cand.location.toLowerCase())
      ) {
        score += 15;
      }

      return { item: cand, score };
    })
    .filter(res => res.score > 20) // Only return matches above a minimum similarity threshold
    .sort((a, b) => b.score - a.score)
    .map(res => res.item);

    return res.json(matched);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
