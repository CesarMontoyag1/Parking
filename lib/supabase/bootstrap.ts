type BootstrapOptions = {
  accountName?: string;
  tenantName?: string;
};

export async function bootstrapAdminSession(accessToken: string, options?: BootstrapOptions) {
  const response = await fetch('/api/bootstrap-admin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      accountName: options?.accountName || 'Mi empresa',
      tenantName: options?.tenantName || 'Sede principal',
    }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(payload.error || 'No se pudo inicializar tu cuenta de administrador.');
  }
}
