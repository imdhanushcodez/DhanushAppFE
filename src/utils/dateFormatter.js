// Date formatting and day-of-week helper (US-06, Table design day_of_week 1=Monday..7=Sunday)

export const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getTodayDayOfWeek = () => {
  // JavaScript Date: 0=Sun, 1=Mon, ..., 6=Sat
  // Specs requirement: 1=Monday to 7=Sunday
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 7 : jsDay;
};

export const DAYS_OF_WEEK = [
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' },
  { id: 7, name: 'Sunday' },
];

