import nodemailer from 'nodemailer';

export const sendResetPasswordEmail = async (to: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: `"IndianWeddings.com" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Reset Your Password',
    html: `
      <p>Hello,</p>
      <p>You requested to reset your password.</p>
      <p>Your OTP is: <b>${otp}</b></p>
      <p>This code will expire in 10 minutes.</p>
    `,
  });

  return info;
};
