const { updateData } = require('../utils/github');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { id, message } = req.body;
  if (!id || !message) {
    return res.status(400).json({ error: 'Missing id or message' });
  }

  try {
    await updateData((data) => {
      if (data[id]) {
        data[id].status = 'done';
        data[id].message = message;
      } else {
        data[id] = {
          id: id,
          status: 'done',
          message: message,
          created_at: new Date().toISOString()
        };
      }
      return data;
    });

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};