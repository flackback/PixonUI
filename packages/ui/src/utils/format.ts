/**
 * Formats a date into a readable string.
 */
export function formatDate(date: Date | string | number, options: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
}): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', options).format(d);
}

/**
 * Formats a number with locale-specific separators.
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Formats a number as currency.
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
