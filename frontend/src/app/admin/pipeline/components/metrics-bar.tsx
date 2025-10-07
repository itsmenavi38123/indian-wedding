import { Lead } from './types';

type Props = { leads: Lead[] };

export default function MetricsBar({ leads }: Props) {
  const totalValue = leads.reduce((sum, l) => sum + l.budget, 0);
  const total = leads.length;
  const completed = leads.filter((l) => l.stage === 'COMPLETED').length;
  const conversion = total === 0 ? 0 : Math.round((completed / total) * 100);
  const avg = total === 0 ? 0 : Math.round(totalValue / total);

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 w-80 sm:w-full">
      <MetricCard label="Total Pipeline Value" value={formatCurrency(totalValue)} />
      <MetricCard label="Conversion Rate" value={`${conversion}%`} />
      <MetricCard label="Average Deal Size" value={formatCurrency(avg)} />
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm flex flex-col">
      <p className="text-xs sm:text-sm font-medium text-gray-600">{label}</p>
      <p className="mt-1 text-lg sm:text-xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}
