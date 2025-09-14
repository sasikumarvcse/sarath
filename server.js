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
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ✅ Corrected Nodemailer config
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your Gmail
    pass: process.env.EMAIL_PASS  // app password
  },
  debug: true,
  logger: true
});

// Enquiry endpoint
app.post('/send-enquiry', (req, res) => {
  console.log('📨 Received enquiry:', req.body);

  const { name, phone, email, destination, dates } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,       // sender = your Gmail
    to: process.env.EMAIL_USER,         // receiver = your Gmail
    replyTo: email,                     // reply will go to customer
    subject: `Travel Enquiry: ${destination || 'General'}`,
    html: `
      <h2>New Travel Enquiry</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Destination/Package:</strong> ${destination || 'Not specified'}</p>
      <p><strong>Travel Dates:</strong> ${dates || 'Not specified'}</p>
      <p><em>This enquiry was sent from the My Trip Executive website.</em></p>
    `
  };

  console.log('📤 Sending to:', process.env.EMAIL_USER);

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('❌ Error:', error);
      return res.status(500).json({ success: false, message: 'Error sending enquiry', error: error.toString() });
    }

    console.log('✅ Email sent:', info.messageId);
    res.json({ success: true, message: 'Enquiry sent successfully!', messageId: info.messageId });
  });
});

// Test endpoint
app.get('/test-email', (req, res) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: 'Test Email from My Trip Executive',
    text: 'This is a test email to verify setup is working.'
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) return res.status(500).send(`Error: ${error.toString()}`);
    res.send(`✅ Test email sent to ${process.env.EMAIL_USER}! Message ID: ${info.messageId}`);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Sending and receiving emails via: ${process.env.EMAIL_USER}`);
});
