import nodemailer from 'nodemailer';
import config from '../config.json';

const appConfig = config as any;

export default async function sendEmail({ to, subject, html, from = process.env.EMAIL_FROM || appConfig.emailFrom }: any) {
  const sendgridApiKey = process.env.SENDGRID_API_KEY;

  try {
    let transporter;

    if (sendgridApiKey) {
      // Use SendGrid SMTP
      transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: sendgridApiKey
        }
      });
    } else {
      // Fallback to Ethereal/Local SMTP
      const user = appConfig?.smtpOptions?.auth?.user;
      const pass = appConfig?.smtpOptions?.auth?.pass;
      const usingPlaceholderCreds = !user || !pass || user === 'your-ethereal-user-here';

      if (usingPlaceholderCreds) {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
        
        const info = await transporter.sendMail({ from, to, subject, html });
        console.log(`Ethereal Preview: ${nodemailer.getTestMessageUrl(info as any)}`);
        return;
      }

      transporter = nodemailer.createTransport(appConfig.smtpOptions);
    }

    await transporter.sendMail({ from, to, subject, html });
    console.log(`Email sent successfully to ${to}`);
  } catch (error: any) {
    console.error(`Email send failed: ${error?.message || error}`);
  }
}