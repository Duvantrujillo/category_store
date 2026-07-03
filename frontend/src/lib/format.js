export function formatMoneyCOP(n) {
  return `$${Number(n ?? 0).toLocaleString("es-CO")}`;
}

export function formatDateTimeCO(date, options) {
  if (!date) return "";
  return new Date(date).toLocaleString("es-CO", options);
}

export function formatDateCO(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("es-CO");
}
