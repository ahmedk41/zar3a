import axios from 'axios';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

if (!BREVO_API_KEY) {
  console.warn('Warning: BREVO_API_KEY environment variable is not set');
}

export const sendMail = async ({ to, subject, html, text }) => {
  try {
    const emailData = {
      sender: {
        name: 'Zar3a Team',
        email: 'mjkk605@gmail.com'
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    };

    const response = await axios.post(BREVO_API_URL, emailData, {
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
    });

    console.log('📧 Email sent successfully via Brevo:', response.data);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    console.error('❌ Failed to send email via Brevo:', errorMessage);

    // Check for IP authorization error
    if (error.response?.status === 401 && errorMessage.includes('unrecognised IP address')) {
      console.error('🔐 Brevo API Key requires IP whitelisting. Please add your IP address to the authorized IPs in your Brevo account: https://app.brevo.com/security/authorised_ips');
    }

    // Fallback: log email content for development
    console.log('💌 Email fallback (not sent):');
    console.log({ to, subject, html, text });

    throw new Error(`Email service error: ${errorMessage}`);
  }
};
