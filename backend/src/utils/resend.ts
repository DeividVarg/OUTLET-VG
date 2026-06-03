import { resend } from "../config/resend";

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  reply_to?: string;
};

export const sendEmail = async ({ to, subject, html, reply_to }: EmailOptions) => {
  const { data, error } = await resend.emails.send({
    from: process.env.FROM_EMAIL as string,
    to,
    subject,
    html,
    ...(reply_to && { reply_to }),
  });

  if (error) throw new Error(`Failed to send email: ${error.message}`);

  return data;
};
