import { Client, Environment } from 'square';

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Production,
});

export async function createPayment(amount: number, sourceId: string, email: string) {
  const { result } = await client.paymentsApi.createPayment({
    sourceId,
    amountMoney: {
      amount: BigInt(amount * 100), // $19.99 -> 1999 cents
      currency: 'USD',
    },
    idempotencyKey: `${Date.now()}-${email}`,
  });

  return result.payment;
}

export async function verifyPayment(paymentId: string) {
  const { result } = await client.paymentsApi.getPayment(paymentId);
  return result.payment?.status === 'COMPLETED';
}
