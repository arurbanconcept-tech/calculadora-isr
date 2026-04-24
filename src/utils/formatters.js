// Utilidades de formateo para la calculadora ISR

const fmtCurrency = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
});

const fmtCurrencyFull = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const fmtPct = new Intl.NumberFormat('es-MX', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

const fmtNum = new Intl.NumberFormat('es-MX');

export function formatCurrency(valor) {
  if (valor === null || valor === undefined) return '—';
  return fmtCurrency.format(valor);
}

export function formatCurrencyFull(valor) {
  if (valor === null || valor === undefined) return '—';
  return fmtCurrencyFull.format(valor);
}

export function formatPercent(valor) {
  if (valor === null || valor === undefined) return '—';
  return fmtPct.format(valor);
}

export function formatFactor(valor) {
  if (valor === null || valor === undefined) return '—';
  return valor.toFixed(4);
}

export function formatNumber(valor) {
  if (valor === null || valor === undefined) return '—';
  return fmtNum.format(valor);
}

// "2010-03" → "Marzo 2010"
export function formatMesAnio(mesAnio) {
  if (!mesAnio) return '—';
  const [anio, mes] = mesAnio.split('-');
  const fecha = new Date(Number(anio), Number(mes) - 1, 1);
  return fecha.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
}

// Parsear string numérico con comas → number
export function parseAmount(str) {
  if (!str && str !== 0) return 0;
  const clean = String(str).replace(/[^0-9.]/g, '');
  return parseFloat(clean) || 0;
}

// Formatear input como moneda mientras se escribe
export function formatInputCurrency(valor) {
  if (!valor && valor !== 0) return '';
  const num = parseAmount(valor);
  if (isNaN(num) || num === 0) return '';
  return num.toLocaleString('es-MX');
}

export const MESES_NOMBRES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function getMesLabel(num) {
  return MESES_NOMBRES[Number(num) - 1] || '';
}
