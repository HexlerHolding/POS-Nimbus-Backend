const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: 'gmail', // Use the service shorthand instead of host/port
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Less strict SSL verification
  },
  // Disable the debugging for production
  debug: false, 
  logger: false
});

// Verify connection configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP connection verification failed:', error);
  } else {
    console.log('SMTP server connection verified and ready to send emails');
  }
});

/**
 * Send an email notification with Gmail-specific optimizations
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 * @returns {Promise} - Nodemailer send result
 */
const sendEmail = async (to, subject, html) => {
  console.log('Attempting to send email with the following configuration:');
  console.log(`- From: ${process.env.EMAIL_USER}`);
  console.log(`- To: ${to}`);
  console.log(`- Subject: ${subject}`);
  
  try {
    // Convert HTML to plain text for multi-part emails
    const plainText = html.replace(/<[^>]*>/g, '')
                           .replace(/\s+/g, ' ')
                           .trim();
    
    // Create a more deliverable email structure
    const mailOptions = {
      // Format sender with name+email for better deliverability
      from: `"Habib Catering" <${process.env.EMAIL_USER}>`, 
      to,
      subject,
      // For Gmail, it's important to have both HTML and plain text versions
      text: plainText,
      html,
      // Add Gmail-friendly headers
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'High',
        // Gmail-specific headers that may help with classification
        'X-Entity-Ref-ID': Date.now().toString(), // Unique ID for each message
        'X-Mailer': 'Habib Catering System', // Identify your system
      },
      // Gmail-specific options
      disableFileAccess: true,
      disableUrlAccess: true,
      // Add helpful metadata to avoid spam
      list: {
        unsubscribe: {
          url: `https://habibcatering.com/unsubscribe?email=${to}`,
          comment: 'Unsubscribe from order notifications'
        }
      }
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sending completed:');
    console.log(`- Message ID: ${info.messageId}`);
    
    // Check if the message was accepted
    if (info.accepted && info.accepted.length > 0) {
      console.log(`- Accepted by mail server for: ${info.accepted.join(', ')}`);
      
      // Important: Tell the user to check all Gmail tabs
      console.log(`- IMPORTANT: If using Gmail, check ALL tabs (Primary, Promotions, Updates, Spam)`);
      
      return { 
        success: true, 
        messageId: info.messageId,
        note: "If using Gmail, please check all tabs including Promotions, Updates, and Spam"
      };
    } else {
      console.warn(`- Warning: Email not explicitly accepted by mail server.`);
      return { 
        success: true, 
        messageId: info.messageId, 
        warning: 'Not explicitly accepted' 
      };
    }
  } catch (error) {
    console.error("Error sending email - Full details:");
    console.error(error);
    
    // More detailed error reporting
    if (error.code) console.error(`- Error code: ${error.code}`);
    if (error.command) console.error(`- Failed command: ${error.command}`);
    if (error.response) console.error(`- Server response: ${error.response}`);
    
    return { 
      success: false, 
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    };
  }
};

/**
 * Create HTML content for order placed notification with Gmail-optimized design
 * @param {string} customerName - Name of the customer
 * @param {string} orderNumber - Unique order number
 * @param {Object} orderDetails - Additional order details
 * @returns {string} - HTML content for email
 */
const createOrderPlacedEmail = (customerName, orderNumber, orderDetails) => {
  const { orderType, total, cart } = orderDetails;
  
  // Generate cart items HTML
  const cartItemsHtml = cart
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.product_name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  // Gmail-optimized template with simpler design - avoided complex CSS that might trigger spam filters
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <tr>
          <td style="padding: 20px; text-align: center; background-color: #f8f8f8;">
            <h2 style="margin: 0; color: #333;">Order Confirmation</h2>
            <p style="margin: 10px 0 0 0;">Order #${orderNumber}</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px;">
            <p>Hello ${customerName},</p>
            <p>Thank you for your order! We've received your order and are working on it now.</p>
            
            <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
              <tr>
                <td style="padding: 5px;"><strong>Order Type:</strong></td>
                <td style="padding: 5px;">${orderType}</td>
              </tr>
              <tr>
                <td style="padding: 5px;"><strong>Order Number:</strong></td>
                <td style="padding: 5px;">${orderNumber}</td>
              </tr>
            </table>
            
            <h3 style="margin: 20px 0 10px 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f2f2f2;">
                  <th style="padding: 8px; text-align: left;">Item</th>
                  <th style="padding: 8px; text-align: center;">Qty</th>
                  <th style="padding: 8px; text-align: right;">Price</th>
                  <th style="padding: 8px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${cartItemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 12px 8px; text-align: right; border-top: 2px solid #eee;"><strong>Grand Total:</strong></td>
                  <td style="padding: 12px 8px; text-align: right; border-top: 2px solid #eee;"><strong>$${total.toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </table>
            
            <p style="margin-top: 30px; font-weight: bold; color: #4CAF50;">Thank you for choosing Habib Catering!</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 15px; text-align: center; background-color: #f8f8f8; font-size: 12px;">
            <p>If you have any questions, please contact us at ${process.env.EMAIL_USER}</p>
            <p style="margin-top: 5px;">&copy; 2025 Habib Catering. All rights reserved.</p>
            <p style="margin-top: 15px; font-size: 11px; color: #999;">This is an automated message. Please do not reply to this email.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * Create HTML content for order ready notification with Gmail-optimized design
 * @param {string} customerName - Name of the customer
 * @param {string} orderNumber - Unique order number
 * @param {Object} orderDetails - Additional order details
 * @returns {string} - HTML content for email
 */
const createOrderReadyEmail = (customerName, orderNumber, orderDetails) => {
  const { orderType, estimatedTime } = orderDetails;
  
  // Gmail-optimized template with simpler design
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Order is Ready</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <tr>
          <td style="padding: 20px; text-align: center; background-color: #f8f8f8;">
            <h2 style="margin: 0; color: #333;">Your Order is Ready!</h2>
            <p style="margin: 10px 0 0 0;">Order #${orderNumber}</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px;">
            <p>Hello ${customerName},</p>
            <p>Great news! Your order is now ${orderType === 'delivery' ? 'ready for delivery' : 'ready for pickup'}.</p>
            
            ${
              orderType === 'delivery'
                ? `<table width="100%" style="margin: 20px 0; border-left: 4px solid #2196F3; background-color: #e7f3fe; padding: 15px;">
                    <tr>
                      <td>
                        <p style="margin: 0 0 10px 0;"><strong>Estimated Delivery Time:</strong> ${estimatedTime}</p>
                        <p style="margin: 0;">Your order is on its way to your address.</p>
                      </td>
                    </tr>
                   </table>`
                : `<table width="100%" style="margin: 20px 0; border-left: 4px solid #2196F3; background-color: #e7f3fe; padding: 15px;">
                    <tr>
                      <td>
                        <p style="margin: 0 0 10px 0;">Your order is ready for pickup at our branch.</p>
                        <p style="margin: 0;">Please bring your order number for reference.</p>
                      </td>
                    </tr>
                   </table>`
            }
            
            <p style="margin-top: 30px; font-weight: bold; color: #4CAF50;">Thank you for choosing Habib Catering!</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 15px; text-align: center; background-color: #f8f8f8; font-size: 12px;">
            <p>If you have any questions, please contact us at ${process.env.EMAIL_USER}</p>
            <p style="margin-top: 5px;">&copy; 2025 Habib Catering. All rights reserved.</p>
            <p style="margin-top: 15px; font-size: 11px; color: #999;">This is an automated message. Please do not reply to this email.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * Send a simple test email with minimal formatting to test Gmail delivery
 * @param {string} to - Recipient email address
 * @returns {Promise} - Email send result
 */
const sendTestEmail = async (to) => {
  const subject = 'Simple Test Email from Habib Catering';
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Test Email</h2>
      <p>This is a simple test email sent at: ${new Date().toLocaleString()}</p>
      <p>If you're seeing this, your email system is working.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">Habib Catering</p>
    </div>
  `;
  
  return await sendEmail(to, subject, html);
};

module.exports = {
  sendEmail,
  createOrderPlacedEmail,
  createOrderReadyEmail,
  sendTestEmail
};