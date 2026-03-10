const { readData } = require('../utils/github');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Missing id' });
  }

  try {
    const data = await readData();
    const entry = data[id];
    if (!entry) {
      return res.status(404).json({ error: 'Not found' });
    }
    if (entry.status === 'pending') {
      return res.status(202).json({ status: 'pending' });
    }
    res.status(200).json({ id: entry.id, message: entry.message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};