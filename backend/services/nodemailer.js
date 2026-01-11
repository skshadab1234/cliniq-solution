const nodemailer = require('nodemailer')

const GMAIL_NAME = process.env.GMAIL_NAME
const GMAIL_PASS = process.env.GMAIL_PASS
const GMAIL_USER = process.env.GMAIL_USER

const sendEmail = async (
  toEmail,
  subject,
  htmlContent,
  attachment,
  attachmentFilename
) => {
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
