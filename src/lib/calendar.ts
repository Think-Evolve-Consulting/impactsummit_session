import { Session } from '@/types/session';

/**
 * Parse a date string like "16 Feb 2026" and time string like "9:30 AM"
 * into an iCal datetime string like "20260216T093000".
 */
function toICalDate(dateStr: string, timeStr: string): string {
  const months: Record<string, string> = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
  };

  const [day, month, year] = dateStr.split(' ');
  const dd = day.padStart(2, '0');
  const mm = months[month] || '01';

  // Parse time like "9:30 AM" or "12:00 PM"
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return `${year}${mm}${dd}T000000`;

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  const hh = String(hours).padStart(2, '0');
  return `${year}${mm}${dd}T${hh}${minutes}00`;
}

/**
 * Escape special characters for iCal text fields.
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Add 1 hour to an iCal datetime string (for default duration).
 */
function addOneHour(icalDate: string): string {
  // icalDate format: 20260216T093000
  const hours = parseInt(icalDate.slice(9, 11), 10);
  const newHours = String(hours + 1).padStart(2, '0');
  return icalDate.slice(0, 9) + newHours + icalDate.slice(11);
}

/**
 * Generate a valid iCalendar string from an array of sessions.
 */
export function generateICS(sessions: Session[]): string {
  const events = sessions.map((session) => {
    let dtStart: string;
    let dtEnd: string;

    // Check if time is a range like "11:30 AM - 1:00 PM"
    const rangeParts = session.time.split(' - ');
    if (rangeParts.length === 2) {
      dtStart = toICalDate(session.date, rangeParts[0].trim());
      dtEnd = toICalDate(session.date, rangeParts[1].trim());
    } else {
      dtStart = toICalDate(session.date, session.time.trim());
      dtEnd = addOneHour(dtStart);
    }

    const location = [session.room, session.location].filter(Boolean).join(', ');

    const descParts: string[] = [];
    if (session.description) {
      descParts.push(session.description.replace('See Less', '').trim());
    }
    if (session.speakers.length > 0) {
      descParts.push('Speakers: ' + session.speakers.join(', '));
    }
    if (session.knowledge_partners.length > 0) {
      descParts.push('Knowledge Partners: ' + session.knowledge_partners.join(', '));
    }

    return [
      'BEGIN:VEVENT',
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${escapeICalText(session.title)}`,
      `LOCATION:${escapeICalText(location)}`,
      `DESCRIPTION:${escapeICalText(descParts.join('\\n'))}`,
      `UID:${session.id}@indiaaisummit2026`,
      'END:VEVENT',
    ].join('\r\n');
  });

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//India AI Summit 2026//EN',
    'CALSCALE:GREGORIAN',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Trigger a browser download of the .ics file.
 */
export function downloadICS(sessions: Session[]): void {
  const icsContent = generateICS(sessions);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'india-ai-summit-2026.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
