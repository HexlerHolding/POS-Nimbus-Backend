// utils/whatsappNotifier.js
const axios = require('axios');
require('dotenv').config();

// WhatsApp Business API credentials from environment variables
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v22.0/685913754599207/messages';
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;

/**
 * Send a WhatsApp message using templates
 * @param {string} phoneNumber - Recipient's phone number
 * @param {Object|null} parameters - Template parameters (if required)
 * @param {string} templateName - Name of the pre-approved WhatsApp template
 * @returns {Promise<Object>} - Response containing success status and data/error
 */
const sendWhatsAppMessage = async (phoneNumber, parameters = null, templateName = 'hello_world') => {
  try {
    // Validate input
    if (!phoneNumber || phoneNumber.trim() === '') {
      console.log('No phone number provided, skipping WhatsApp notification');
      return { success: false, error: 'No phone number provided' };
    }
    
    if (!WHATSAPP_API_TOKEN) {
      console.log('WhatsApp API token not configured');
      return { success: false, error: 'WhatsApp API not configured' };
    }
    
    // Format phone number - ensure it has country code
    let formattedPhone = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      // For Pakistan numbers, remove leading 0 and add country code
      formattedPhone = phoneNumber.startsWith('0')
        ? '+92' + phoneNumber.substring(1)
        : '+92' + phoneNumber;
    }
    
    console.log(`Sending WhatsApp template message to ${formattedPhone} using template: ${templateName}`);
    
    // Prepare the request based on the template type
    let requestBody = {
      messaging_product: 'whatsapp',
      to: formattedPhone,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: 'en_US'
        }
      }
    };
    
    // Only add parameters if provided and template requires them
    if (parameters && templateName !== 'hello_world') {
      // Different templates may have different component types
      // This is a general structure that works with basic text parameters
      requestBody.template.components = [
        {
          type: 'body',
          parameters: parameters
        }
      ];
    }
    
    // Log the actual request body for debugging
    console.log('WhatsApp API request body:', JSON.stringify(requestBody));
    
    // Send the request to WhatsApp Business API
    const response = await axios.post(
      WHATSAPP_API_URL,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('WhatsApp notification sent successfully:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error.response ? error.response.data : error.message);
    return { success: false, error: error.message };
  }
};

// Helper functions to create parameters for different templates
const createOrderParameters = (customerName, orderNumber) => {
  return [
    { type: 'text', text: customerName || 'Valued Customer' },
    { type: 'text', text: orderNumber || '####' }
  ];
};

const createDeliveryParameters = (customerName, estimatedTime) => {
  return [
    { type: 'text', text: customerName || 'Valued Customer' },
    { type: 'text', text: estimatedTime || '30 minutes' }
  ];
};

const createCancellationParameters = (customerName, reason) => {
  return [
    { type: 'text', text: customerName || 'Valued Customer' },
    { type: 'text', text: reason || 'unavoidable circumstances' }
  ];
};

module.exports = {
  sendWhatsAppMessage,
  
  // Template names for different notification types
  templates: {
    orderPlaced: 'hello_world',
    orderReady: 'hello_world',
    orderCancelled: 'hello_world'
  },
  
  // Helper functions for creating parameters
  createOrderParameters,
  createDeliveryParameters,
  createCancellationParameters,
  
  // Message templates - for reference only, actual messages are defined in WhatsApp Business templates
  messages: {
    orderPlaced: (customerName) => 
      `Hello ${customerName}, your order has been placed successfully! We'll notify you when it's ready.`,
    
    orderReady: (customerName) => 
      `Hello ${customerName}, your order is now ready and is being prepared for delivery. It should arrive shortly!`,
      
    orderCancelled: (customerName) => 
      `Hello ${customerName}, we regret to inform you that your order has been cancelled. Please contact us if you have any questions.`
  }
};