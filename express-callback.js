const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001; // Different port than Next.js

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Helper function to log to file
async function logToFile(message) {
  try {
    const logDir = path.join(__dirname, 'logs');
    const logFile = path.join(logDir, 'express-callback.log');
    
    try {
      await fs.access(logDir);
    } catch {
      await fs.mkdir(logDir, { recursive: true });
    }
    
    const logMessage = `${new Date().toISOString()} - ${message}\n`;
    await fs.appendFile(logFile, logMessage, 'utf8');
    console.log(logMessage.trim());
  } catch (error) {
    console.error('Logging error:', error);
  }
}

// Callback endpoint
app.post('/api/mpesa/callback', async (req, res) => {
  await logToFile('=== EXPRESS MPESA CALLBACK RECEIVED ===');
  await logToFile(`Headers: ${JSON.stringify(req.headers, null, 2)}`);
  await logToFile(`Body: ${JSON.stringify(req.body, null, 2)}`);
  await logToFile('=== EXPRESS MPESA CALLBACK END ===');

  res.status(200).json({
    ResultCode: 0,
    ResultDesc: "Success"
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Express server is running!' });
});

app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
