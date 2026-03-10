const fetch = require('node-fetch');

const OWNER = process.env.GITHUB_REPO_OWNER || 'Adisdzaky1';
const REPO = process.env.GITHUB_REPO_NAME || 'dbusertele';
const PATH = process.env.GITHUB_FILE_PATH || 'datapanell.json';
const TOKEN = process.env.GITHUB_TOKEN;

const GITHUB_API_URL = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;

async function readData() {
  const response = await fetch(GITHUB_API_URL, {
    headers: {
      Authorization: `token ${TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  if (!response.ok) {
    if (response.status === 404) {
      return {};
    }
    throw new Error(`GitHub read error: ${response.status}`);
  }
  const data = await response.json();
  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  return JSON.parse(content);
}

async function writeData(content, sha) {
  const jsonContent = JSON.stringify(content, null, 2);
  const encoded = Buffer.from(jsonContent).toString('base64');
  
  const body = {
    message: 'Update datapanell.json via API',
    content: encoded,
  };
  if (sha) {
    body.sha = sha;
  }

  const response = await fetch(GITHUB_API_URL, {
    method: 'PUT',
    headers: {
      Authorization: `token ${TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`GitHub write error: ${response.status}`);
  }
  return await response.json();
}

async function updateData(updater) {
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
    } else if (response.status === 404) {
      data = {};
    } else {
      throw new Error(`GitHub read error: ${response.status}`);
    }
  } catch (e) {
    data = {};
  }

  const newData = updater(data);

  const jsonContent = JSON.stringify(newData, null, 2);
  const encoded = Buffer.from(jsonContent).toString('base64');
  
  const body = {
    message: 'Update datapanell.json via API',
    content: encoded,
  };
  if (sha) {
    body.sha = sha;
  }

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
    throw new Error(`GitHub write error: ${writeResponse.status}`);
  }
  return newData;
}

module.exports = { readData, writeData, updateData };