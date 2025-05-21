// simpleEmailTest.js - A very simple test script for Gmail
require('dotenv').config();
const emailNotifier = require('./utils/emailNotifier');

async function runSimpleTest() {
  console.log('=== SIMPLE GMAIL DELIVERY TEST ===');
  console.log('This test uses a minimal email to test Gmail deliverability');
  
  // Add multiple email addresses to test with - change these to your emails
  const testEmails = [
    'hexlertech@gmail.com',
  ];
  
  console.log(`\nTesting delivery to ${testEmails.length} email addresses...`);
  
  // Send a test email to each address
  for (const email of testEmails) {
    console.log(`\nSending to: ${email}`);
    try {
      const result = await emailNotifier.sendTestEmail(email);
      console.log('Result:', result.success ? 'SUCCESS' : 'FAILED');
      
      if (result.success) {
        console.log('Message ID:', result.messageId);
        console.log('VERY IMPORTANT: Check ALL tabs in Gmail (Primary, Promotions, Updates, Spam)');
      } else {
        console.log('Error:', result.error);
      }
    } catch (error) {
      console.error('Error sending test email:', error);
    }
  }
  
  console.log('\n=== TEST COMPLETED ===');
  console.log('Please check your Gmail inbox AND all tabs (Primary, Promotions, Updates, Spam)');
}

// Run the test
runSimpleTest().catch(console.error);