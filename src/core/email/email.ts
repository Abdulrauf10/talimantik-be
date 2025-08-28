import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_SERVICE,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  const info = await transporter.sendMail({
    from: `"Talimantik" <${process.env.EMAIL_SERVICE}>`,
    to,
    subject,
    html,
  });

  console.log('Email sent: %s', info.messageId);
}
