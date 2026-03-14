// api/callback.js
const { updateData } = require('../utils/github');

module.exports = async (req, res) => {
  console.log('Callback received:', req.method, req.body);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { id, message } = req.body;
  if (!id || !message) {
    console.error('Missing id or message', { id, message });
    return res.status(400).json({ error: 'Missing id or message' });
  }

  try {
    console.log(`Updating data for id: ${id}`);
    await updateData((data) => {
      if (data[id]) {
        data[id].status = 'done';
        data[id].message = message;
        console.log(`Existing entry updated for ${id}`);
      } else {
        data[id] = {
          id: id,
          status: 'done',
          message: message,
          created_at: new Date().toISOString()
        };
        console.log(`New entry created for ${id}`);
      }
      return data;
    });

    console.log(`Successfully updated GitHub for id: ${id}`);
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Error in callback:', error);
    res.status(500).json({ error: error.message });
  }
};
