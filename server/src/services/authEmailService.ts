import { Resend } from "resend";
import { getAppConfig } from "../config/env.js";
import { AppError } from "../errors/AppError.js";

export type AuthEmailOptions = {
  to: string;
  subject: string;
  text: string;
};

function hasRequiredResendConfig(config: ReturnType<typeof getAppConfig>) {
  return Boolean(config.resendApiKey && config.resendFromEmail);
}

function createHtmlEmail(text: string): string {
  const escapedText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `<p>${escapedText.replace(/\n/g, "<br />")}</p>`;
}

export async function sendAuthEmail({ to, subject, text }: AuthEmailOptions) {
  const config = getAppConfig();

  if (!hasRequiredResendConfig(config)) {
    if (config.nodeEnv === "production") {
      throw new AppError("Resend email service is not configured.", 500, "RESEND_NOT_CONFIGURED");
    }

    console.info(
      [
        "Auth email skipped because Resend is not configured.",
        `To: ${to}`,
        `Subject: ${subject}`,
        text
      ].join("\n")
    );
    return;
  }

  const resend = new Resend(config.resendApiKey);
  const { error } = await resend.emails.send({
    from: config.resendFromEmail,
    to,
    subject,
    text,
    html: createHtmlEmail(text),
    replyTo: config.resendReplyTo || undefined
  });

  if (error) {
    throw new AppError("Email could not be sent.", 502, "EMAIL_SEND_FAILED", error);
  }
}
