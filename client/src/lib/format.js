export const currency = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value) || 0);
export const number = value => new Intl.NumberFormat('en-IN').format(Number(value) || 0);
export const dateLabel = value => value ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)) : '—';
export const initials = value => String(value || 'U').trim().split(/\\s+/).slice(0,2).map(x => x[0]).join('').toUpperCase();
