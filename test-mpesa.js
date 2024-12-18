const axios = require('axios');

const simulateCallback = async () => {
  const sampleData = {
    "Body": {
      "stkCallback": {
        "MerchantRequestID": "29115-34620561-1",
        "CheckoutRequestID": "ws_CO_191220191020363925",
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
              "Value": "NLJ7RT61SV"
            },
            {
              "Name": "TransactionDate",
              "Value": 20191219102115
            },
            {
              "Name": "PhoneNumber",
              "Value": 254722000000
            }
          ]
        }
      }
    }
  };

  try {
    console.log('Sending test callback to:', process.env.MPESA_CALLBACK_URL);
    const response = await axios.post(
      'https://32b5-197-136-154-2.ngrok-free.app/api/mpesa/callback',
      sampleData,
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

simulateCallback();
