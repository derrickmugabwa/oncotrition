const axios = require('axios');

const testBasicCallback = async () => {
  const testData = {
    test: true,
    timestamp: new Date().toISOString(),
    message: 'Test callback'
  };

  try {
    console.log('Sending test to basic callback endpoint...');
    const response = await axios.post(
      'https://32b5-197-136-154-2.ngrok-free.app/api/basic-callback',
      testData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    } : error.message);
  }
};

testBasicCallback();
