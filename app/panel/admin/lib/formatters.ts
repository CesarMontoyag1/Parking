import type { PaymentRow, RevenuePoint } from './types';

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatShortMoney(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }

  return `$${value.toFixed(0)}`;
}

export function buildRevenueHistory(payments: PaymentRow[], days: number): RevenuePoint[] {
  const byDay = new Map<string, number>();

  payments.forEach((payment) => {
    const day = payment.paid_at.slice(0, 10);
    byDay.set(day, (byDay.get(day) || 0) + payment.amount);
  });

  const result: RevenuePoint[] = [];
  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const dayKey = date.toISOString().slice(0, 10);
    result.push({ day: dayKey, total: Number((byDay.get(dayKey) || 0).toFixed(2)) });
  }

  return result;
}
