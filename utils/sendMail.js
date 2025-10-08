import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.mailgun.org",
  port: 587,
  auth: {
    user: "postmaster@e2m.live",
    pass: "#e2m321",
  },
});

export const sendMail = async (to, subject, html, from = "E2M Live <postmaster@e2m.live>") => {
  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return { success: false, error: error.message };
  }
};