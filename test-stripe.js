const Twilio = require('twilio');

// Twilio credentials
const accountSid = 'AC97a1888e143dd85fff00b9652c79e32b';
const authToken = '26357532e8031b3182246cf50c68e243';
const twilioWhatsAppNumber = 'whatsapp:+14155238886';

// Initialize Twilio client
const client = new Twilio(accountSid, authToken);

// Function to send WhatsApp message
async function sendWhatsAppMessage(toNumber, message) {
  try {
    const response = await client.messages.create({
      body: message,
      from: twilioWhatsAppNumber,
      to: `whatsapp:${toNumber}` // Ensure the recipient number is in E.164 format with 'whatsapp:' prefix
    });
    console.log('Message sent successfully!');
    console.log('Message SID:', response.sid);
  } catch (error) {
    console.error('Error sending message:', error.message);
  }
}

// Example usage: Replace '+1234567890' with the recipient's phone number in E.164 format
sendWhatsAppMessage('+923207209829', 'Hello! This is a test message from Twilio WhatsApp API.');