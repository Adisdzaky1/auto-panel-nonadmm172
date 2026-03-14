const fetch = require('node-fetch');

const OWNER = process.env.GITHUB_REPO_OWNER || 'Adisdzaky1';
const REPO = process.env.GITHUB_REPO_NAME || 'dbuserstele';
const PATH = process.env.GITHUB_FILE_PATH || 'datapanell.json';
const TOKEN = process.env.GITHUB_TOKEN;

const GITHUB_API_URL = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;

async function readData() {
  console.log('Reading from GitHub...');
  const response = await fetch(GITHUB_API_URL, {
    headers: {
      Authorization: `token ${TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  if (!response.ok) {
    if (response.status === 404) {
      console.log('File not found, returning empty object');
      return {};
    }
    const errorText = await response.text();
    console.error(`GitHub read error ${response.status}:`, errorText);
    throw new Error(`GitHub read error: ${response.status}`);
  }
  const data = await response.json();
  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  console.log('Read success');
  return JSON.parse(content);
}

async function updateData(updater) {
  console.log('Updating GitHub data...');
  let data, sha;
  try {
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        Authorization: `token ${TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (response.ok) {
      const fileInfo = await response.json();
      sha = fileInfo.sha;
      const content = Buffer.from(fileInfo.content, 'base64').toString('utf-8');
      data = JSON.parse(content);
      console.log('Existing file found, sha:', sha);
    } else if (response.status === 404) {
      data = {};
      console.log('File not found, creating new');
    } else {
      const errorText = await response.text();
      console.error(`GitHub read error ${response.status}:`, errorText);
      throw new Error(`GitHub read error: ${response.status}`);
    }
  } catch (e) {
    console.log('Error reading, assuming empty:', e.message);
    data = {};
  }

  const newData = updater(data);
  console.log('New data prepared');

  const jsonContent = JSON.stringify(newData, null, 2);
  const encoded = Buffer.from(jsonContent).toString('base64');
  
  const body = {
    message: 'Update datapanell.json via API',
    content: encoded,
  };
  if (sha) {
    body.sha = sha;
  }

  console.log('Writing to GitHub...');
  const writeResponse = await fetch(GITHUB_API_URL, {
    method: 'PUT',
    headers: {
      Authorization: `token ${TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!writeResponse.ok) {
    const errorText = await writeResponse.text();
    console.error(`GitHub write error ${writeResponse.status}:`, errorText);
    throw new Error(`GitHub write error: ${writeResponse.status}`);
  }
  console.log('GitHub write success');
  return newData;
}

module.exports = { readData, updateData };
