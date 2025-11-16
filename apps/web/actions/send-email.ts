"use server";

import { getBaseUrl } from "@repo/ui/lib/utils";

type SendEmailParams = {
  to: string;
  subject: string;
  text?: string;
  type: "reset-password" | "verify-email" | "password-changed";
};

export const sendEmail = async ({
  to,
  subject,
  text,
  type = "verify-email",
}: SendEmailParams) => {
  const response = await fetch(`${getBaseUrl()}/api/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, subject, text, type }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send email: ${await response.json()}`);
  }

  return await response.json();
};
