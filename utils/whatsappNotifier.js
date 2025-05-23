// utils/whatsappNotifier.js - Fixed version
const axios = require('axios');
require('dotenv').config();
const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

/**
 * Format phone number to Twilio format based on country
 * @param {string} phoneNumber - Raw phone number
 * @returns {string} - Formatted phone number
 */
const formatPhoneNumber = (phoneNumber) => {
  // Remove any spaces or dashes
  const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
  
  if (cleanPhone.startsWith('03')) {
    // Pakistan number: Replace leading '03' with '+923'
    return `+92${cleanPhone.substring(1)}`;
  } else if (cleanPhone.startsWith('1') && cleanPhone.length === 10) {
    // US number: Add '+1' prefix if it's a 10-digit number
    return `+1${cleanPhone}`;
  } else if (cleanPhone.startsWith('+')) {
    // Already in international format
    return cleanPhone;
  } else {
    throw new Error(`Invalid phone number format: ${phoneNumber}`);
  }
};

/**
 * Send a WhatsApp message using Twilio
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string} message - Message to send
 * @returns {Promise<Object>} - Response containing success status and data/error
 */
const sendWhatsAppMessage = async (phoneNumber, message) => {
  try {
    // Validate input
    if (!phoneNumber || phoneNumber.trim() === '') {
      console.log('No phone number provided, skipping WhatsApp notification');
      return { success: false, error: 'No phone number provided' };
    }

    if (!message || message.trim() === '') {
      console.log('No message provided, skipping WhatsApp notification');
      return { success: false, error: 'No message provided' };
    }

    // Validate environment variables
    if (!process.env.TWILIO_WHATSAPP_NUMBER) {
      console.error('TWILIO_WHATSAPP_NUMBER not set in environment variables');
      return { success: false, error: 'WhatsApp number not configured' };
    }

    if (!process.env.ACCOUNT_SID || !process.env.AUTH_TOKEN) {
      console.error('Twilio credentials not set in environment variables');
      return { success: false, error: 'Twilio credentials not configured' };
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log(`Attempting to send WhatsApp message to ${formattedPhone}`);
    console.log(`Using Twilio WhatsApp number: ${process.env.TWILIO_WHATSAPP_NUMBER}`);

    // Send the message using Twilio
    const response = await client.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`, // Properly format the from number
      to: `whatsapp:${formattedPhone}`,


    });

    console.log(`Message sent successfully to ${formattedPhone}: ${response.sid}`);
    return { success: true, data: response };
  } catch (error) {
    console.error(`Error sending message to ${phoneNumber}:`, error.message);
    
    // Provide more specific error messages
    if (error.message.includes('Channel')) {
      console.error('Make sure your Twilio WhatsApp number is properly configured');
    } else if (error.message.includes('Invalid phone number')) {
      console.error('Check the phone number format');
    }
    
    return { success: false, error: error.message };
  }
};

/**
 * Test WhatsApp connection
 * @returns {Promise<Object>} - Test result
 */
const testWhatsAppConnection = async () => {
  try {
    console.log('Testing WhatsApp connection...');
    console.log('Twilio Account SID:', process.env.ACCOUNT_SID ? 'Set' : 'Not set');
    console.log('Twilio Auth Token:', process.env.AUTH_TOKEN ? 'Set' : 'Not set');
    console.log('WhatsApp Number:', process.env.TWILIO_WHATSAPP_NUMBER);
    
    // Try to get account info
    const account = await client.api.accounts(process.env.ACCOUNT_SID).fetch();
    console.log('Twilio account status:', account.status);
    
    return { success: true, accountStatus: account.status };
  } catch (error) {
    console.error('WhatsApp connection test failed:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWhatsAppMessage,
  testWhatsAppConnection,
};