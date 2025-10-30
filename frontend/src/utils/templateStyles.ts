const templateStyles: Record<string, any> = {
  classic: {
    background: 'bg-gradient-to-b from-stone-50 via-white to-emerald-50',
    header: 'bg-gradient-to-r from-stone-200 to-emerald-100 text-gray-800',
    accent: 'text-emerald-600',
    font: 'font-serif tracking-wide',
    divider: 'border-t border-stone-300',
  },
  modern: {
    background: 'bg-gradient-to-b from-gray-50 to-gray-100',
    header: 'bg-gradient-to-r from-blue-600 to-teal-500 text-white',
    accent: 'text-blue-700',
    font: 'font-sans tracking-wide',
    divider: 'border-t border-blue-300',
  },
  traditional: {
    background: 'bg-gradient-to-b from-yellow-50 to-purple-50',
    header: 'bg-gradient-to-r from-purple-700 to-yellow-500 text-white',
    accent: 'text-purple-800',
    font: 'font-playfair',
    divider: 'border-t-2 border-yellow-400',
  },
  strach: {
    background: 'bg-white',
    header: 'bg-transparent text-gray-800 border-b border-dashed border-gray-300',
    accent: 'text-gray-500 italic',
    font: 'font-sans',
    divider: 'border-t border-dashed border-gray-300',
  },
};

export const getTemplateStyle = (templateId?: string) =>
  templateStyles[templateId ?? 'classic'] || templateStyles.classic;
