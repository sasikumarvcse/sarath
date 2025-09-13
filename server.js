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

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use Gmail, Outlook, or SMTP
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',   // replace with your Gmail
    pass: process.env.EMAIL_PASS || 'your-app-password'      // use Gmail App Password
  }
});

// Email sending endpoint
app.post('/send-enquiry', (req, res) => {
  const { name, phone, email, destination, dates } = req.body;

  const mailOptions = {
    from: email,
    to: 's.sarath01010@email.com', // Replace with your receiving email
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

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('❌ Error sending email:', error);
      return res.status(500).json({ success: false, message: 'Error sending enquiry' });
    }
    console.log('✅ Email sent:', info.response);
    res.json({ success: true, message: 'Enquiry sent successfully!' });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
