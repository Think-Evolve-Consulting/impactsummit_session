export interface TimeRange {
  id: string;
  startTime: string; // "09:00" (24-hour format)
  endTime: string;   // "17:00"
}

/**
 * Parse session time string to minutes from midnight
 * Handles both single times ("9:30 AM") and ranges ("11:30 AM - 1:00 PM")
 * Returns { start: minutes, end: minutes } or null if unparseable
 */
export function parseSessionTime(timeStr: string): { start: number; end: number } | null {
  if (!timeStr) return null;

  // Check if it's a time range (contains " - ")
  if (timeStr.includes(' - ')) {
    const [startStr, endStr] = timeStr.split(' - ').map(s => s.trim());
    const startMinutes = timeToMinutes(startStr);
    const endMinutes = timeToMinutes(endStr);

    if (startMinutes === null || endMinutes === null) return null;

    return { start: startMinutes, end: endMinutes };
  }

  // Single time - treat as 1-hour session
  const minutes = timeToMinutes(timeStr);
  if (minutes === null) return null;

  return { start: minutes, end: minutes + 60 }; // Assume 1-hour duration
}

/**
 * Convert time string like "9:30 AM" to minutes from midnight
 * Returns null if unparseable
 */
export function timeToMinutes(timeStr: string): number | null {
  if (!timeStr) return null;

  // Regex to match time patterns: "9:30 AM", "12:00 PM", etc.
  const regex = /(\d{1,2}):(\d{2})\s*(AM|PM)?/i;
  const match = timeStr.match(regex);

  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3]?.toUpperCase();

  // Convert 12-hour to 24-hour format
  if (period === 'AM') {
    if (hours === 12) hours = 0; // 12 AM = 00:00
  } else if (period === 'PM') {
    if (hours !== 12) hours += 12; // 1 PM = 13:00, but 12 PM = 12:00
  }

  return hours * 60 + minutes;
}

/**
 * Convert minutes from midnight to time string in 24-hour format
 * E.g., 570 → "09:30"
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Check if session time overlaps with any availability range
 * Uses partial overlap matching (recommended by user)
 */
export function timeRangesOverlap(
  sessionStart: number,
  sessionEnd: number,
  availRanges: TimeRange[]
): boolean {
  if (availRanges.length === 0) return true;

  return availRanges.some((range) => {
    const rangeStart = timeStringToMinutes(range.startTime);
    const rangeEnd = timeStringToMinutes(range.endTime);

    if (rangeStart === null || rangeEnd === null) return false;

    // Check for overlap: sessionEnd > rangeStart && sessionStart < rangeEnd
    return sessionEnd > rangeStart && sessionStart < rangeEnd;
  });
}

/**
 * Convert 24-hour time string like "09:00" to minutes from midnight
 */
function timeStringToMinutes(timeStr: string): number | null {
  const parts = timeStr.split(':');
  if (parts.length !== 2) return null;

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (isNaN(hours) || isNaN(minutes)) return null;

  return hours * 60 + minutes;
}

/**
 * Convert TIME_SLOTS preset to time range
 */
export function presetToTimeRange(
  preset: 'Morning' | 'Afternoon' | 'Evening'
): { startTime: string; endTime: string } {
  switch (preset) {
    case 'Morning':
      return { startTime: '09:00', endTime: '12:00' };
    case 'Afternoon':
      return { startTime: '12:00', endTime: '17:00' };
    case 'Evening':
      return { startTime: '17:00', endTime: '21:00' };
    default:
      return { startTime: '09:00', endTime: '17:00' };
  }
}

/**
 * Convert 12-hour format to 24-hour format for storage
 * E.g., "9:00 AM" → "09:00", "2:30 PM" → "14:30"
 */
export function convert12to24(time12: string): string {
  const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return time12; // Return as-is if can't parse

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === 'AM') {
    if (hours === 12) hours = 0;
  } else {
    if (hours !== 12) hours += 12;
  }

  return `${String(hours).padStart(2, '0')}:${minutes}`;
}

/**
 * Convert 24-hour format to 12-hour format for display
 * E.g., "09:00" → "9:00 AM", "14:30" → "2:30 PM"
 */
export function convert24to12(time24: string): string {
  const parts = time24.split(':');
  if (parts.length !== 2) return time24;

  const hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const period = hours < 12 ? 'AM' : 'PM';
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

  return `${displayHour}:${minutes} ${period}`;
}

/**
 * Generate dropdown options for time selection
 * Returns array of times in 12-hour format with 30-minute increments
 * Range: 8:00 AM to 10:00 PM
 */
export function generateTimeOptions(): string[] {
  const options: string[] = [];
  // Start at 8:00 AM (hour=8, minute=0) and end at 10:00 PM (hour=22, minute=0)
  let currentHour = 8;
  let currentMinute = 0;

  while (currentHour < 22 || (currentHour === 22 && currentMinute === 0)) {
    const period = currentHour < 12 ? 'AM' : 'PM';
    const displayHour = currentHour === 0 ? 12 : currentHour > 12 ? currentHour - 12 : currentHour;
    const timeStr = `${displayHour}:${String(currentMinute).padStart(2, '0')} ${period}`;
    options.push(timeStr);

    // Increment by 30 minutes
    currentMinute += 30;
    if (currentMinute >= 60) {
      currentMinute = 0;
      currentHour++;
    }
  }

  return options;
}
