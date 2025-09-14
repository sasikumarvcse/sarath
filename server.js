require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  debug: true,
  logger: true
});

// Verify email configuration on startup
transporter.verify(function(error, success) {
  if (error) {
    console.log('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Enquiry endpoint
app.post('/send-enquiry', (req, res) => {
  console.log('📨 Received enquiry:', req.body);

  const { name, phone, email, destination, dates } = req.body;

  // Email content for the business
  const businessMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    replyTo: email,
    subject: `New Travel Enquiry: ${destination || 'General'}`,
    html: `
      <h2>New Travel Enquiry Received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Destination/Package:</strong> ${destination || 'Not specified'}</p>
      <p><strong>Travel Dates:</strong> ${dates || 'Not specified'}</p>
      <p><em>This enquiry was sent from the My Trip Executive website.</em></p>
    `
  };

  // Email content for the customer (confirmation)
  const customerMailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Thank you for your enquiry with My Trip Executive`,
    html: `
      <h2>Thank you for contacting My Trip Executive!</h2>
      <p>Dear ${name},</p>
      <p>We have received your enquiry for <strong>${destination || 'a travel package'}</strong> 
      and our team will contact you within 24 hours at ${phone} or ${email}.</p>
      <p>If you have any urgent questions, please call us at +91 7022537255.</p>
      <br>
      <p>Best regards,</p>
      <p><strong>My Trip Executive Team</strong></p>
      <p>📞 +91 7022537255 | ✉ info@mytripexecutive.com</p>
    `
  };

  // Send email to business
  transporter.sendMail(businessMailOptions, (error, info) => {
    if (error) {
      console.error('❌ Error sending business email:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error sending enquiry', 
        error: error.toString() 
      });
    }

    console.log('✅ Business email sent:', info.messageId);
    
    // Send confirmation email to customer
    transporter.sendMail(customerMailOptions, (error, info) => {
      if (error) {
        console.error('❌ Error sending customer confirmation:', error);
        // Still return success since the business received the enquiry
      } else {
        console.log('✅ Customer confirmation sent:', info.messageId);
      }
      
      res.json({ 
        success: true, 
        message: 'Enquiry sent successfully!', 
        messageId: info.messageId 
      });
    });
  });
});

// Test endpoint
app.get('/test-email', (req, res) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: 'Test Email from My Trip Executive',
    text: 'This is a test email to verify the email setup is working correctly.'
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send(`Error: ${error.toString()}`);
    }
    res.send(`✅ Test email sent successfully! Message ID: ${info.messageId}`);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  if (process.env.EMAIL_USER) {
    console.log(`📧 Emails will be sent from: ${process.env.EMAIL_USER}`);
  } else {
    console.log('❌ EMAIL_USER not set in environment variables');
  }
});