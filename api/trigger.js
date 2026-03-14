// api/trigger.js
const fetch = require('node-fetch');
const { updateData } = require('../utils/github');

module.exports = async (req, res) => {
  console.log('Trigger received:', req.method, req.body);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Missing id' });
  }

  try {
    // Simpan ke GitHub
    await updateData((data) => {
      data[id] = {
        id: id,
        status: 'pending',
        message: null,
        created_at: new Date().toISOString()
      };
      return data;
    });

    // Kirim ke userbot via bot Telegram
    const botToken = process.env.BOT_TOKEN;
    const userbotChatId = process.env.USERBOT_CHAT_ID;

    if (!botToken || !userbotChatId) {
      console.error('Missing BOT_TOKEN or USERBOT_CHAT_ID');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const text = `/mulaii ${id}`;
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    console.log(`Sending to userbot ${userbotChatId}: ${text}`);
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: userbotChatId, text: text })
    });

    const result = await response.json();
    console.log('Telegram response:', result);

    if (!result.ok) {
      console.error('Telegram error:', result);
      return res.status(500).json({ error: 'Failed to send message to userbot', details: result });
    }

    res.status(200).json({ status: 'triggered', id });
  } catch (error) {
    console.error('Trigger error:', error);
    res.status(500).json({ error: error.message });
  }
};
