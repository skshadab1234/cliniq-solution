const nodemailer = require('nodemailer')

const GMAIL_NAME = process.env.GMAIL_NAME
const GMAIL_PASS = process.env.GMAIL_PASS
const GMAIL_USER = process.env.GMAIL_USER

// Validate email config at startup
const isEmailConfigured = GMAIL_USER && GMAIL_PASS
if (!isEmailConfigured) {
  console.warn('Warning: Email service not configured. Set GMAIL_USER and GMAIL_PASS in .env')
}

const sendEmail = async (
  toEmail,
  subject,
  htmlContent,
  attachment,
  attachmentFilename
) => {
  // Check if email service is configured
  if (!isEmailConfigured) {
    console.warn('Email not sent: Service not configured')
    return { success: false, message: 'Email service not configured' }
  }

  try {
    // 🔧 Dynamically create transporter based on selected service

    // transporterConfig = {
    //     host: "smtp.office365.com", // fallback SMTP host
    //     port: 587,
    //     secure: false,
    //     auth: {
    //       user: GMAIL_USER,
    //       pass: GMAIL_PASS,
    //     },
    //     tls: {
    //       rejectUnauthorized: false, // for dev/local; set to true in production
    //     },
    //   };
    // } else if (service === "gmail") {
    const transporterConfig = {
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS
      }
    }
    // } else {
    //   return { success: false, message: "Invalid mail service specified" };
    // }

    const transporter = nodemailer.createTransport(transporterConfig)

    const message = {
      from: `${GMAIL_NAME || 'PWS Coding'} <${GMAIL_USER}>`,
      to: toEmail,
      subject,
      html: htmlContent,
      attachments:
        attachment && attachmentFilename
          ? [
              {
                filename: attachmentFilename,
                content: attachment,
                encoding: 'base64'
              }
            ]
          : undefined
    }

    await transporter.verify()
    await transporter.sendMail(message)

    console.log('Email sent to:', toEmail)
    return { success: true, message: 'Email sent successfully' }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, message: error.message }
  }
}

module.exports = sendEmail
