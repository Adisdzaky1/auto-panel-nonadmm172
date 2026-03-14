const fetch = require('node-fetch');
const { updateData } = require('../utils/github');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Missing id' });
  }

  try {
    // Simpan ke GitHub dengan status pending
    await updateData((data) => {
      data[id] = {
        id: id,
        status: 'pending',
        message: null,
        created_at: new Date().toISOString()
      };
      return data;
    });

    // Kirim perintah /start ke userbot via bot Telegram
    const botToken = process.env.BOT_TOKEN;
    const chatId = process.env.USERBOT_CHAT_ID;
    const text = `/mulaii ${id}`;
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: text })
    });
    const result = await response.json();
    if (!result.ok) {
      return res.status(500).json({ error: 'Failed to send message to userbot', details: result });
    }

    res.status(200).json({ status: 'triggered', id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
