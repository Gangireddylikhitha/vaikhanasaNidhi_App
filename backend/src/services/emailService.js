const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER?.trim();
  let pass = process.env.SMTP_PASS?.trim();
  if (pass) {
    pass = pass.replace(/\s+/g, '');
  }
  const service = process.env.SMTP_SERVICE?.trim() || (user?.endsWith('@gmail.com') ? 'gmail' : undefined);

  if (service && user && pass) {
    transporter = nodemailer.createTransport({
      service,
      auth: { user, pass },
    });
  } else if (host && user && pass) {
    const port = Number(process.env.SMTP_PORT) || 587;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  return transporter;
}

/**
 * Sends a password reset OTP email to the user.
 * If SMTP is not yet configured, prints to console so development is seamless.
 */
async function sendOtpEmail({ to, otp, username, name }) {
  const mailer = getTransporter();
  const smtpUser = process.env.SMTP_USER?.trim();

  // If using Gmail SMTP, the From address MUST match the authenticated Gmail account,
  // otherwise spam filters flag it as address spoofing / phishing.
  const from = (smtpUser && smtpUser.endsWith('@gmail.com'))
    ? `"వైఖానస నిధి" <${smtpUser}>`
    : (process.env.EMAIL_FROM || (smtpUser ? `"వైఖానస నిధి" <${smtpUser}>` : '"వైఖానస నిధి" <noreply@vaikhanasanidhi.com>'));

  // Clean subject without raw numbers (numbers in subject lines trigger spam filters)
  const subject = 'వైఖానస నిధి - పాస్‌వర్డ్ రీసెట్ కోడ్ / Password Reset Code';
  const displayName = name || username || 'భక్తుడు';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #0f1015; color: #f5f5f5; padding: 24px; border-radius: 12px; max-width: 520px; margin: auto; border: 1px solid #c88f2d;">
      <h2 style="color: #e4b24b; margin-top: 0; text-align: center;">వైఖానస నిధి - Vaikhanasa Nidhi</h2>
      <p style="font-size: 15px;">నమస్కారం <strong>${displayName}</strong>,</p>
      <p style="font-size: 14px; color: #ccc;">
        మీ ఖాతా పాస్‌వర్డ్ రీసెట్ కొరకు క్రింది OTP ని ఉపయోగించండి:<br/>
        Use the One-Time Password (OTP) below to reset your account password:
      </p>
      <div style="background-color: #1a1c24; border: 1px dashed #e4b24b; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #e4b24b;">${otp}</span>
      </div>
      <p style="font-size: 13px; color: #aaa;">
        ఈ OTP 10 నిమిషాల పాటు మాత్రమే చెల్లుతుంది. మీరు ఈ అభ్యర్థన చేయకపోతే, దయచేసి ఈ ఈమెయిల్‌ను విస్మరించండి.<br/>
        <em>This OTP is valid for 10 minutes. If you did not request this reset, please ignore this email.</em>
      </p>
      <hr style="border: 0; border-top: 1px solid #2a2c38; margin: 20px 0;" />
      <p style="font-size: 11px; color: #777; text-align: center;">
        Username: <strong>${username}</strong><br/>
        Vaikhanasa Nidhi Sacred Library
      </p>
    </div>
  `;

  if (!mailer) {
    console.log('\n======================================================');
    console.log(' [EMAIL SERVICE - CONSOLE FALLBACK / SMTP NOT CONFIGURED]');
    console.log(` To: ${to}`);
    console.log(` Username: ${username}`);
    console.log(` OTP Code: ${otp}`);
    console.log(` Valid for: 10 minutes`);
    console.log(' Note: To send actual emails, set SMTP_USER and SMTP_PASS in backend/.env');
    console.log('======================================================\n');
    return { success: true, simulated: true };
  }

  try {
    await mailer.sendMail({
      from,
      replyTo: smtpUser || from,
      to,
      subject,
      html: htmlContent,
      text: `నమస్కారం ${displayName},\n\nమీ వైఖానస నిధి పాస్‌వర్డ్ రీసెట్ OTP: ${otp}\nఈ OTP 10 నిమిషాలు చెల్లుతుంది.\nUsername: ${username}`,
    });
    return { success: true, simulated: false };
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    throw error;
  }
}

module.exports = {
  sendOtpEmail,
};
