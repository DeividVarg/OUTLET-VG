import { sendEmail } from "../utils/resend";
import { response } from "../utils/response";
import { Request, Response } from "express";

interface ContactPayload {
  question: string;
  email: string;
}

export async function sendContactEmail(req: Request, res: Response) {
  const { question, email } = req.body as ContactPayload;
  const internalEmail = process.env.INTERNAL_EMAIL as string;

  console.log("Received contact email request:", { question, email });

  if (!question?.trim() || !email?.trim()) {
    return response({
      res,
      code: 400,
      message: "El campo 'question' y 'email' son requeridos",
      data: null,
    });
  }

  await sendEmail({
    to: internalEmail,
    subject: "📩 Nueva consulta desde el sitio web",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Nueva consulta recibida</h2>
        <hr />
        <p><strong>Email del cliente:</strong> ${email}</p>
        <p><strong>Pregunta:</strong></p>
        <blockquote style="border-left: 4px solid #ddd; padding-left: 12px; color: #555;">
          ${question}
        </blockquote>
        <hr />
        <small style="color: #999;">Responde este email para contactar directamente al cliente.</small>
      </div>
    `,
    reply_to: email,
  });

  return response({
    res,
    code: 200,
    message: "Correo enviado correctamente",
    data: null,
  });
}
