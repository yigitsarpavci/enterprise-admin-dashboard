/**
 * Utility to handle dates consistently across server and client.
 * Normalizes to Turkey timezone (Europe/Istanbul) using official Intl standards.
 */

export function getTodayLocal() {
  // Current time
  const now = new Date();
  
  // Format to string in Istanbul time to get the correct "today" date
  const istanbulDateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now); // Returns YYYY-MM-DD
  
  const [year, month, day] = istanbulDateStr.split('-').map(Number);
  
  // Create a UTC date at 00:00:00 representing that Istanbul day
  // This is what we store in the database
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

export function parseLocalDate(dateStr: string) {
  // dateStr is expected in YYYY-MM-DD format
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

export function formatLocalDate(date: Date) {
  // Returns YYYY-MM-DD in Turkey time
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}
