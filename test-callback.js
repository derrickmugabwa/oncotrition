const axios = require('axios');

const testCallback = async () => {
  const payload = {
    "Body": {
      "stkCallback": {
        "MerchantRequestID": "8db8-42b1-b82f-13000588c937236735",
        "CheckoutRequestID": "ws_CO_13122024144230457719177208",
        "ResultCode": 0,
        "ResultDesc": "The service request is processed successfully.",
        "CallbackMetadata": {
          "Item": [
            {
              "Name": "Amount",
              "Value": 1
            },
            {
              "Name": "MpesaReceiptNumber",
              "Value": "SLD0BMGTLG"
            },
            {
              "Name": "Balance"
            },
            {
              "Name": "TransactionDate",
              "Value": 20241213144149
            },
            {
              "Name": "PhoneNumber",
              "Value": 254719177208
            }
          ]
        }
      }
    }
  };

  try {
    // Test the main callback endpoint
    const mainResponse = await axios.post('http://localhost:3000/api/mpesa/callback', payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Main callback response:', mainResponse.data);

    // Test the test callback endpoint
    const testResponse = await axios.post('http://localhost:3000/api/test-callback', payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Test callback response:', testResponse.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

testCallback();
