const BASE_URL = process.env.ASAAS_BASE_URL ?? 'https://api.asaas.com';
const API_KEY  = process.env.ASAAS_API_KEY ?? '';

function asaasHeaders() {
  return {
    'Content-Type': 'application/json',
    'access_token': API_KEY,
    'User-Agent': 'NomeMagnetico/1.0',
  };
}

async function asaasFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...asaasHeaders(), ...(options.headers ?? {}) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Asaas ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

async function findOrCreateCustomer(userId: string, email: string, name: string): Promise<string> {
  const list = await asaasFetch<{ data: Array<{ id: string }> }>(
    `/api/v3/customers?externalReference=${encodeURIComponent(userId)}&limit=1`
  );
  if (list.data.length > 0) return list.data[0].id;

  const customer = await asaasFetch<{ id: string }>('/api/v3/customers', {
    method: 'POST',
    body: JSON.stringify({
      name: name || email.split('@')[0],
      email,
      externalReference: userId,
    }),
  });
  return customer.id;
}

export interface PixChargeResult {
  chargeId: string;
  pixCopiaECola: string;
  qrCodeImage: string;
  expirationDate: string;
}

export async function createPixCharge(params: {
  userId: string;
  productType: string;
  userEmail: string;
  userName: string;
  value: number;
  description: string;
}): Promise<PixChargeResult> {
  const customerId = await findOrCreateCustomer(params.userId, params.userEmail, params.userName);

  const d = new Date();
  const dueDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const payment = await asaasFetch<{ id: string }>('/api/v3/payments', {
    method: 'POST',
    body: JSON.stringify({
      customer: customerId,
      billingType: 'PIX',
      value: params.value,
      dueDate,
      description: params.description,
      externalReference: `nomemagnetico:${params.userId}:${params.productType}`,
    }),
  });

  const qr = await asaasFetch<{ encodedImage: string; payload: string; expirationDate: string }>(
    `/api/v3/payments/${payment.id}/pixQrCode`
  );

  return {
    chargeId: payment.id,
    pixCopiaECola: qr.payload,
    qrCodeImage: qr.encodedImage,
    expirationDate: qr.expirationDate,
  };
}

export function verifyWebhookToken(token: string): boolean {
  const expected = process.env.ASAAS_WEBHOOK_TOKEN ?? '';
  return expected.length > 0 && token === expected;
}
