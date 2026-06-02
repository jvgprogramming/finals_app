/** Parse "12:00 PM - 2:00 PM" or "12:00 PM" to 24h "HH:mm:ss". */
export function parseTimeSlotStart(timeSlot: string): string {
  const start = timeSlot.split('-')[0].trim();
  const match = start.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return '12:00:00';
  }
  let hour = parseInt(match[1], 10);
  const minute = match[2];
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && hour !== 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${minute}:00`;
}

/** Format for Laravel `Y-m-d H:i:s` validation. */
export function formatDeliveryDateForApi(date: string, timeSlot: string): string {
  const time = parseTimeSlotStart(timeSlot);
  return `${date} ${time}`;
}
