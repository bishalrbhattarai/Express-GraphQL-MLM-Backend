import nodemailer from "nodemailer";
import { secret } from "../config/secret.js";


const clientUrl = process.env.CLIENT_URL;

const transporter = nodemailer.createTransport({
  host: `${secret.SMTP_HOST}`,
  port: secret.SMTP_PORT,
  secure: true, 
  auth: {
    user: `${secret.SMTP_MAIL}`,
    pass: `${secret.SMTP_PASSWORD}`,
  },
});

export const otpVerification = async ({ 
  email,
  subject,
  organizationName,
  otp,
}: any) => {

  const mailOption = {
    from: `Payment Record System <${secret.SMTP_MAIL}>`,
    to: email,
    subject,
    html: `
     <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; background-color: #f3f3f3; font-family: Arial, sans-serif;">
        <tr>
          <td align="center" style="padding: 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15); overflow: hidden;">
              
              <!-- Header Section -->
              <tr>
                <td align="center" style="padding: 20px 40px; background-color: #4CAF50;">
                  <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">${organizationName}</h2>
                </td>
              </tr>
              
              <!-- Body Section -->
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <h1 style="color: #333333; font-size: 24px; margin: 0;">Verify Your OTP</h1>
                  <p style="color: #555555; font-size: 16px; margin: 20px 0 10px;">Hi, ${organizationName},</p>
                  <p style="color: #555555; font-size: 16px; margin: 0 0 20px;">
                    To complete your registration, please use the OTP code below to verify your email:
                  </p>
                  <div style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: #ffffff; font-size: 24px; font-weight: bold; letter-spacing: 2px; border-radius: 5px;">
                    ${otp}
                  </div>
                  <p style="color: #777777; font-size: 14px; margin-top: 20px;">This code is valid for 10 minutes. Do not share it with anyone.</p>
                </td>
              </tr>
              
              <!-- Footer Section -->
              <tr>
                <td align="center" style="padding: 20px; background-color: #f3f3f3;">
                  <p style="color: #999999; font-size: 12px; margin: 0;">
                    If you didn’t request this, please ignore this email.
                  </p>
                  <p style="color: #999999; font-size: 12px; margin: 5px 0;">
                    © ${new Date().getFullYear()} ${organizationName}. All rights reserved.
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
      `,
  };
  await transporter.sendMail(mailOption);
};
