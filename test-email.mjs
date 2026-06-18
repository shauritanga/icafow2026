import nodemailer from "nodemailer";

async function main() {
  console.log("Configuring transport with:", {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE,
    user: process.env.SMTP_USER,
  });

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      // Do not fail on invalid certs for testing if using shared hosting
      rejectUnauthorized: false
    }
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: "shauritangaathanas@gmail.com",
      subject: "Test Email from ICAFoW 2026",
      text: "Hello Athanas! This is a test email to confirm your SMTP configuration in the ICAFoW 2026 system is working correctly.",
      html: "<h3>Hello Athanas!</h3><p>This is a test email to confirm your SMTP configuration in the <b>ICAFoW 2026</b> system is working correctly.</p>",
    });

    console.log("Message sent successfully! Message ID: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

main();
