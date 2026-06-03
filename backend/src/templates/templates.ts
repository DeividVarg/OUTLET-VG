export const welcomeTemplate = (name: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1>Bienvenido, ${name}!</h1>
    <p>Tu cuenta ha sido creada exitosamente.</p>
  </div>
`;

export const confirmLoginTemplate = (user: {
  nombre: string;
  codigo: string;
}) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1>Hola ${user.nombre}, cnfirma tu inicio de sesión </h1>
    <p>pon el siguiente codigo en la pagina web</p>
    <p><strong>${user.codigo}</strong></p>
  </div>
`;

export const resetPasswordTemplate = (resetUrl: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1>Restablecer contraseña</h1>
    <p>Recibimos una solicitud para restablecer tu contraseña.</p>
    <a href="${resetUrl}" style="display:inline-block; background:#000; color:#fff; padding:12px 24px; border-radius:24px; text-decoration:none; margin:16px 0;">
      Restablecer contraseña
    </a>
    <p style="color:#666; font-size:12px;">Este enlace expira en 1 hora. Si no solicitaste esto, ignora este correo.</p>
  </div>
`;

export const orderConfirmationTemplate = (data: {
  userName: string;
  purchaseId: string;
  items: Array<{ name: string; quantity: number; unit_price: number }>;
  total: number;
  direction: string;
  phone: string;
}) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #1a1a1a;">¡Gracias por tu compra, ${data.userName}!</h1>
    <p style="color: #666;">Tu pedido fue registrado exitosamente. Te contactaremos pronto para coordinar la entrega.</p>

    <div style="background: #f9f9f9; border-radius: 12px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0; font-size: 12px; color: #999;">ID de pedido</p>
      <p style="margin: 4px 0 0; font-weight: bold; font-size: 14px;">${data.purchaseId}</p>
    </div>

    <h2 style="font-size: 16px; margin-top: 24px;">Productos</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="border-bottom: 1px solid #eee;">
          <th style="text-align: left; padding: 8px 0; font-size: 13px; color: #666;">Producto</th>
          <th style="text-align: center; padding: 8px 0; font-size: 13px; color: #666;">Cant.</th>
          <th style="text-align: right; padding: 8px 0; font-size: 13px; color: #666;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${data.items
          .map(
            (item) => `
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 10px 0; font-size: 14px;">${item.name}</td>
            <td style="padding: 10px 0; text-align: center; font-size: 14px;">${item.quantity}</td>
            <td style="padding: 10px 0; text-align: right; font-size: 14px;">
              $${(item.unit_price * item.quantity).toLocaleString("es-CL")}
            </td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding: 12px 0; font-weight: bold;">Total</td>
          <td style="padding: 12px 0; text-align: right; font-weight: bold; font-size: 16px;">
            $${data.total.toLocaleString("es-CL")}
          </td>
        </tr>
      </tfoot>
    </table>

    <div style="border-top: 1px solid #eee; margin-top: 20px; padding-top: 20px;">
      <h2 style="font-size: 16px;">Datos de entrega</h2>
      <p style="margin: 4px 0; font-size: 14px; color: #444;">📍 ${data.direction}</p>
      <p style="margin: 4px 0; font-size: 14px; color: #444;">📞 ${data.phone}</p>
    </div>

    <p style="margin-top: 24px; font-size: 12px; color: #999;">
      Si tienes alguna pregunta, responde este correo o contáctanos directamente.
    </p>
  </div>
`;

export const internalOrderNotificationTemplate = (data: {
  userName: string;
  userEmail: string;
  purchaseId: string;
  items: Array<{ name: string; quantity: number; unit_price: number }>;
  total: number;
  direction: string;
  phone: string;
  purchaseType: "cart" | "direct";
}) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #e63946; border-radius: 12px;">
    
    <!-- Alerta -->
    <div style="background: #e63946; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
      <h1 style="color: white; margin: 0; font-size: 20px;">🛒 Nueva compra recibida</h1>
      <p style="color: #ffd6d6; margin: 4px 0 0; font-size: 13px;">
        ${new Date().toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        · ${data.purchaseType === "cart" ? "Compra desde carrito" : "Compra directa"}
      </p>
    </div>

    <!-- Datos del cliente -->
    <div style="background: #f9f9f9; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
      <h2 style="font-size: 14px; color: #999; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">Datos del cliente</h2>
      <p style="margin: 4px 0; font-size: 15px;"><strong>Nombre:</strong> ${data.userName}</p>
      <p style="margin: 4px 0; font-size: 15px;"><strong>Email:</strong> <a href="mailto:${data.userEmail}" style="color: #e63946;">${data.userEmail}</a></p>
      <p style="margin: 4px 0; font-size: 15px;"><strong>Teléfono:</strong> <a href="tel:${data.phone}" style="color: #e63946;">${data.phone}</a></p>
    </div>

    <!-- Datos de entrega -->
    <div style="background: #f0f7ff; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
      <h2 style="font-size: 14px; color: #999; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">Dirección de entrega</h2>
      <p style="margin: 4px 0; font-size: 15px;">📍 ${data.direction}</p>
    </div>

    <!-- Productos -->
    <h2 style="font-size: 14px; color: #999; text-transform: uppercase; letter-spacing: 1px;">Productos</h2>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background: #1a1a1a; color: white;">
          <th style="text-align: left; padding: 10px 12px; font-size: 13px; border-radius: 6px 0 0 6px;">Producto</th>
          <th style="text-align: center; padding: 10px 12px; font-size: 13px;">Cant.</th>
          <th style="text-align: right; padding: 10px 12px; font-size: 13px;">P. Unit.</th>
          <th style="text-align: right; padding: 10px 12px; font-size: 13px; border-radius: 0 6px 6px 0;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${data.items
          .map(
            (item, i) => `
          <tr style="background: ${i % 2 === 0 ? "#fff" : "#f9f9f9"}; border-bottom: 1px solid #eee;">
            <td style="padding: 10px 12px; font-size: 14px; font-weight: 600;">${item.name}</td>
            <td style="padding: 10px 12px; text-align: center; font-size: 14px;">${item.quantity}</td>
            <td style="padding: 10px 12px; text-align: right; font-size: 14px; color: #666;">$${Number(item.unit_price).toLocaleString("es-CL")}</td>
            <td style="padding: 10px 12px; text-align: right; font-size: 14px; font-weight: bold;">$${(item.unit_price * item.quantity).toLocaleString("es-CL")}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
      <tfoot>
        <tr style="background: #1a1a1a; color: white;">
          <td colspan="3" style="padding: 12px; font-weight: bold; font-size: 15px; border-radius: 0 0 0 6px;">Total</td>
          <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px; border-radius: 0 0 6px 0;">$${data.total.toLocaleString("es-CL")}</td>
        </tr>
      </tfoot>
    </table>

    <!-- ID de pedido -->
    <div style="background: #f9f9f9; border-radius: 8px; padding: 12px; text-align: center;">
      <p style="margin: 0; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px;">ID de pedido</p>
      <p style="margin: 4px 0 0; font-weight: bold; font-size: 13px; color: #444; font-family: monospace;">${data.purchaseId}</p>
    </div>
  </div>
`;

export const updatePucharse = (status: string, id_purchase: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f7f8fb; color: #222;">
    <div style="background: #fff; border-radius: 18px; padding: 24px; box-shadow: 0 18px 50px rgba(33, 43, 54, 0.08); border: 1px solid #e3e7ef;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="display: inline-block; background: #2f80ed; color: #fff; padding: 10px 18px; border-radius: 999px; font-size: 13px; letter-spacing: .4px;">Actualización de compra</span>
      </div>

      <h1 style="font-size: 24px; margin: 0 0 18px; color: #111;">¡Tu pedido ha sido actualizado!</h1>
      <p style="margin: 0 0 22px; line-height: 1.7; color: #4f5d78;">La compra con número <strong>${id_purchase}</strong> ha sido actualizada a:</p>

      <div style="display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 16px 20px; border-radius: 16px; background: #eef6ff; color: #1f5cd4; font-weight: 700; font-size: 16px; margin-bottom: 24px;">
        <span style="width: 10px; height: 10px; background: #2f80ed; border-radius: 50%; display: inline-block;"></span>
        ${status}
      </div>

      <div style="background: #f8fcff; border: 1px solid #dceefd; border-radius: 14px; padding: 18px;">
        <p style="margin: 0; color: #556680; font-size: 14px; line-height: 1.7;">Si tienes preguntas sobre tu pedido o necesitas ayuda con la entrega, responde este correo y nuestro equipo te atenderá a la brevedad.</p>
      </div>
    </div>
  </div>
`;

// src/templates/email.templates.ts
export const paymentFailedTemplate = (data: {
  userName: string;
  purchaseId: string;
  reason: string;
}) => {
  const reasonMessages: Record<string, string> = {
    FAILED: "El pago fue rechazado por el banco.",
    NULLIFIED: "La transacción fue anulada.",
    PARTIALLY_NULLIFIED: "La transacción fue parcialmente anulada.",
    REVERSED: "La transacción fue revertida.",
  };

  const reasonText =
    reasonMessages[data.reason] ?? "El pago no pudo procesarse.";

  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">

    <!-- Header -->
    <div style="background: #e63946; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
      <h1 style="color: white; margin: 0; font-size: 22px;">❌ Pago no procesado</h1>
    </div>

    <p style="color: #444; font-size: 15px;">Hola <strong>${data.userName}</strong>,</p>
    <p style="color: #444; font-size: 15px;">${reasonText}</p>
    <p style="color: #666; font-size: 14px;">Tu pedido quedó cancelado — ningún monto fue cobrado.</p>

    <!-- ID pedido -->
    <div style="background: #f9f9f9; border-radius: 10px; padding: 14px; margin: 20px 0; text-align: center;">
      <p style="margin: 0; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px;">ID de pedido</p>
      <p style="margin: 4px 0 0; font-weight: bold; font-size: 13px; color: #444; font-family: monospace;">${data.purchaseId}</p>
    </div>

    <!-- Opciones -->
    <div style="background: #fff8e1; border-radius: 10px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #666;">Puedes intentarlo de nuevo o contactarnos si el problema persiste.</p>
    </div>

    <p style="margin-top: 24px; font-size: 12px; color: #999;">
      Si tienes alguna pregunta, responde este correo o contáctanos directamente.
    </p>
  </div>
  `;
};
