import { MercadoPagoConfig } from "mercadopago";

export const mercadoPago = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN as string,
});
