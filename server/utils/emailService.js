import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.auth.user,
      pass: config.email.auth.pass,
    },
  });
};

export const sendVerificationEmail = async (email, token) => {
  try {
    const transporter = createTransporter(); // Create a transporter using the configuration
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: 'Verify Your Email - Bug Hunter',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Bug Hunter!</h2>
          <p style="color: #666;">Thank you for signing up. Please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Verify Email</a>
          <p style="color: #666;">Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
          <p style="color: #999; font-size: 12px;">This link will expire in 24 hours.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions); // Send the email
    console.log('Verification email sent:', info.messageId); // Log the message ID for reference
    return info;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (email, token) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: 'Reset Your Password - Bug Hunter',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p style="color: #666;">You requested a password reset. Click the button below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
          <p style="color: #666;">Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${resetUrl}</p>
          <p style="color: #999; font-size: 12px;">This link will expire in 1 hour.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

export const sendNotificationEmail = async (email, subject, message) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${subject}</h2>
          <p style="color: #666;">${message}</p>
          <p style="color: #999; font-size: 12px;">This is an automated notification from Bug Hunter.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Notification email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending notification email:', error);
    throw error;
  }
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendNotificationEmail,
};
