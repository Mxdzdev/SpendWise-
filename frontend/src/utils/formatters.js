export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // Adiciona o timezone offset para não voltar 1 dia
  const dtDateOnly = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
  return new Intl.DateTimeFormat('pt-BR').format(dtDateOnly);
};

export const formatMonthYear = (monthStr) => {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const date = new Date(year, parseInt(month) - 1);
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
};
