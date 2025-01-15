const axios = require('axios');

const testCallback = async () => {
  const callbackUrl = 'https://5a89-41-212-75-53.ngrok-free.app/api/mpesa/callback';
  
  // Sample M-Pesa callback payload with actual CheckoutRequestID
  const payload = {
    "Body": {
      "stkCallback": {
        "MerchantRequestID": "aba0-4119-bd0a-28c60f0ef1ef918090",
        "CheckoutRequestID": "ws_CO_19122024210544289719177208",
        "ResultCode": 0,
        "ResultDesc": "The service request is processed successfully.",
        "CallbackMetadata": {
          "Item": [
            {
              "Name": "Amount",
              "Value": 1.00
            },
            {
              "Name": "MpesaReceiptNumber",
              "Value": "SLJ74BXCX9"
            },
            {
              "Name": "TransactionDate",
              "Value": 20241219210517
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
    console.log('Sending test callback to:', callbackUrl);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await axios.post(callbackUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

testCallback();
