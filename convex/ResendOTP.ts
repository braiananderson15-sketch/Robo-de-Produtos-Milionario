import { Email } from "@convex-dev/auth/providers/Email";
import { generateRandomString } from "@oslojs/crypto/random";
import { Resend } from "resend";
import { remetenteValido } from "./remetente";
export const ResendOTP = Email({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  from: process.env.AUTH_EMAIL_FROM ?? "",
  maxAge: 60 * 15,
  generateVerificationToken() {
    return generateRandomString(
      {
        read(bytes) {
          crypto.getRandomValues(bytes);
        },
      },
      "0123456789",
      8,
    );
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const apiKey = process.env.AUTH_RESEND_KEY,
      from = provider.from ?? "";
    if (!apiKey || !remetenteValido(from))
      throw new Error(
        "Configure AUTH_RESEND_KEY e AUTH_EMAIL_FROM no Convex com seu domínio verificado.",
      );
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to: email,
      subject: "Seu código de acesso",
      text: `Seu código de acesso é ${token}.\n\nEle vale por 15 minutos e só pode ser usado uma vez. Se você não pediu este código, ignore este e-mail.`,
    });
    if (error)
      throw new Error(
        "Não foi possível enviar o código de acesso. Confira o domínio e o remetente no Resend.",
      );
  },
});
