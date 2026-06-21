import nodemailer from "nodemailer";

interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Creates a singleton transporter to prevent memory leaks in serverless environments
 */
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false // Production-ready safeguard for some shared hosts
    }
  });
  
  return transporter;
}

export async function sendEmail({ to, subject, text, html }: EmailPayload) {
  if (!process.env.SMTP_HOST) {
    console.warn("Email warning: SMTP_HOST not configured. Skipping email dispatch.");
    return false;
  }

  try {
    const tp = getTransporter();
    await tp.sendMail({
      from: process.env.SMTP_FROM || `"ICAFoW" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send email to", to, error);
    return false;
  }
}

/**
 * Sends a welcome/confirmation email to the registering user.
 */
export async function sendRegistrationConfirmation(email: string, fullName: string, typeLabel: string) {
  const subject = `Welcome to ICAFoW 2026 - Registration Received`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #6d071a;">ICAFoW 2026</h2>
      <p>Dear ${fullName},</p>
      <p>Thank you for submitting your <strong>${typeLabel}</strong> application for the International Conference on AI & the Future of Work (ICAFoW 2026).</p>
      <p>We have successfully received your details. Our team is currently reviewing your submission. You can expect to hear from us shortly regarding the next steps.</p>
      <p>If you have any immediate questions, please don't hesitate to contact us.</p>
      <br />
      <p>Warm regards,<br /><strong>The ICAFoW 2026 Team</strong></p>
    </div>
  `;

  const text = `Dear ${fullName},\n\nThank you for submitting your ${typeLabel} application for ICAFoW 2026.\nWe have successfully received your details. Our team will contact you shortly regarding next steps.\n\nWarm regards,\nThe ICAFoW 2026 Team`;

  return sendEmail({ to: email, subject, text, html });
}

/**
 * Sends a notification to the admins regarding a new registration.
 */
export async function sendAdminAlert(to: string | string[], data: { name: string, email: string, type: string, reference: string }) {
  if (!to || (Array.isArray(to) && to.length === 0)) return false;
  
  const subject = `New ${data.type} Registration: ${data.name}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #6d071a;">New Registration Alert</h2>
      <p>A new <strong>${data.type}</strong> has just registered on the ICAFoW platform.</p>
      <ul>
        <li><strong>Name:</strong> ${data.name}</li>
        <li><strong>Email:</strong> ${data.email}</li>
        <li><strong>Reference:</strong> ${data.reference}</li>
      </ul>
      <p>Log in to the admin dashboard to view the full details.</p>
    </div>
  `;

  const text = `New Registration Alert\n\nType: ${data.type}\nName: ${data.name}\nEmail: ${data.email}\nReference: ${data.reference}`;

  return sendEmail({ to: Array.isArray(to) ? to.join(', ') : to, subject, text, html });
}

/**
 * Sends a welcome email to a newly created dashboard administrator with their temporary credentials.
 */
export async function sendAdminWelcomeEmail(email: string, name: string, tempPassword: string) {
  const subject = `Welcome to ICAFoW 2026 Admin Dashboard`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #6d071a;">ICAFoW Dashboard Access</h2>
      <p>Dear ${name},</p>
      <p>An administrator account has been created for you on the ICAFoW 2026 platform.</p>
      <p>You can log in to the dashboard at: <strong><a href="https://aiconference.arifa.org/admin/login">https://aiconference.arifa.org/admin/login</a></strong></p>
      <p><strong>Your Temporary Credentials:</strong></p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Password:</strong> ${tempPassword}</li>
      </ul>
      <p><em>Please keep this information secure.</em></p>
      <br />
      <p>Warm regards,<br /><strong>The ICAFoW System</strong></p>
    </div>
  `;

  const text = `Dear ${name},\n\nAn admin account has been created for you on the ICAFoW 2026 platform.\n\nLogin URL: https://aiconference.arifa.org/admin/login\nEmail: ${email}\nPassword: ${tempPassword}\n\nWarm regards,\nThe ICAFoW System`;

  return sendEmail({ to: email, subject, text, html });
}

/**
 * Sends an approval/verification notification email to an attendee/speaker.
 */
export async function sendApprovalNotification(email: string, name: string, typeLabel: string) {
  const subject = `Congratulations! Your ${typeLabel} Application is Approved`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #10b981;">Application Approved</h2>
      <p>Dear ${name},</p>
      <p>We are thrilled to inform you that your <strong>${typeLabel}</strong> application for the International Conference on AI & the Future of Work (ICAFoW 2026) has been officially approved!</p>
      <p>Your profile and details are now confirmed in our system.</p>
      <p>Our team will be in touch with you shortly with further details and next steps to prepare for the conference.</p>
      <p>If you have any questions, please don't hesitate to contact us.</p>
      <br />
      <p>Warm regards,<br /><strong>The ICAFoW 2026 Team</strong></p>
    </div>
  `;

  const text = `Dear ${name},\n\nWe are thrilled to inform you that your ${typeLabel} application for ICAFoW 2026 has been officially approved!\n\nOur team will be in touch shortly with further details.\n\nWarm regards,\nThe ICAFoW 2026 Team`;

  return sendEmail({ to: email, subject, text, html });
}
