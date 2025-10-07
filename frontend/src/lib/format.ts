export function formatINR(amount: number): string {
  if (isNaN(amount)) return '₹0';
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
}

export function formatINRWithCommas(amount: number): string {
  if (isNaN(amount)) return '0';
  // Indian numbering system: 1,00,00,000 (1 crore)
  const formatter = new Intl.NumberFormat('en-IN');
  return formatter.format(amount);
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString('en-IN')}`;
  }
}

export function formatCurrencyShort(amount: number, currency: string = 'INR'): string {
  const currencySymbol =
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    })
      .formatToParts(0)
      .find((part) => part.type === 'currency')?.value || '';
  if (amount >= 10000000)
    return `${currencySymbol}${(amount / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`;
  if (amount >= 100000)
    return `${currencySymbol}${(amount / 100000).toFixed(1).replace(/\.0$/, '')}L`;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function parseNumber(input: string): number {
  if (!input) return 0;
  const normalized = input.replace(/[₹,\s]/g, '');
  const n = Number(normalized);
  return isNaN(n) ? 0 : n;
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function applyTemplateVariables(text: string, vars: Record<string, string>) {
  if (!text) return '';
  let result = text;

  // Extended list of template variables
  const extendedVars: Record<string, string> = {
    '{couple_names}': vars.couple_names || '',
    '{wedding_date}': vars.wedding_date || '',
    '{client_name}': vars.client_name || vars.couple_names || '',
    '{company_name}': vars.company_name || '',
    '{current_date}': new Date().toLocaleDateString('en-IN'),
    '{current_year}': new Date().getFullYear().toString(),
    '{reference}': vars.reference || '',
    '{venue}': vars.venue || '',
    '{guest_count}': vars.guest_count || '',
    '{event_type}': vars.event_type || 'Wedding',
  };

  Object.entries(extendedVars).forEach(([key, value]) => {
    result = result.replaceAll(key, value);
  });

  return result;
}
