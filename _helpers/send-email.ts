import nodemailer from 'nodemailer';
import config from '../config.json';

const appConfig = config as any;

export default async function sendEmail({ to, subject, html, from = appConfig.emailFrom }: any) {
  const user = appConfig?.smtpOptions?.auth?.user;
  const pass = appConfig?.smtpOptions?.auth?.pass;
  const usingPlaceholderCreds =
    !user ||
    !pass ||
    user === 'your-ethereal-user-here' ||
    pass === 'your-ethereal-pass-here' ||
    String(user).includes('PASTE_THE_NEW_') ||
    String(pass).includes('PASTE_THE_NEW_');

  try {
    if (usingPlaceholderCreds) {
      console.warn('SMTP credentials in config.json are placeholders.');
      console.warn('Set smtpOptions.auth.user and smtpOptions.auth.pass to a real Ethereal account to see messages in your Ethereal inbox.');

      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      const info = await transporter.sendMail({ from, to, subject, html });
      const previewUrl = nodemailer.getTestMessageUrl(info as any);

      console.log(`to:${to}`);
      console.log(`subject:${subject}`);
      console.log(`etherealUser:${testAccount.user}`);
      console.log(`etherealPass:${testAccount.pass}`);
      console.log(`etherealMessage:${previewUrl}`);
      return;
    }

    const transporter = nodemailer.createTransport(appConfig.smtpOptions);
    await transporter.sendMail({ from, to, subject, html });
  } catch (error: any) {
    console.warn(`Email send failed: ${error?.message || error}`);
  }
}