import { useState, useEffect, useMemo } from 'react';
import { Session, FilterState, inferTopic, classifyTag, TimeRange } from '../types/session';
import { parseSessionTime, timeRangesOverlap } from '../lib/timeUtils';
import { createSpeakerNameMapping, normalizeSpeakers } from '../lib/speakerUtils';

interface RawSession {
  title: string;
  date: string;
  time: string;
  location: string;
  room: string;
  speakers: string[];
  description: string;
  knowledge_partners: string[];
  tags?: string[];
}

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/sessions.json')
      .then((res) => res.json())
      .then((data: RawSession[]) => {
        // Create speaker name mapping to consolidate variations
        const allSpeakers = data.flatMap(session => session.speakers);
        const speakerMapping = createSpeakerNameMapping(allSpeakers);

        // Process sessions with normalized speaker names
        const processedSessions = data.map((session, index) => ({
          ...session,
          id: `session-${index}`,
          topic: inferTopic(session.title, session.description),
          tags: session.tags || [],
          speakers: normalizeSpeakers(session.speakers, speakerMapping),
        }));
        setSessions(processedSessions);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { sessions, loading, error };
}

export function useFilteredSessions(
  sessions: Session[],
  filters: FilterState,
  searchQuery: string,
  speakerQuery = '',
  partnerQuery = '',
  availabilityRanges: TimeRange[] = [],
) {
  return useMemo(() => {
    let filtered = sessions;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.speakers.some((sp) => sp.toLowerCase().includes(query)) ||
          s.knowledge_partners.some((kp) => kp.toLowerCase().includes(query))
      );
    }

    if (filters.topics.length > 0) {
      filtered = filtered.filter((s) => s.topic && filters.topics.includes(s.topic));
    }

    if (filters.dates.length > 0) {
      filtered = filtered.filter((s) => filters.dates.includes(s.date));
    }

    if (filters.times.length > 0) {
      filtered = filtered.filter((s) => {
        const hour = parseInt(s.time.split(':')[0]);
        const isPM = s.time.toLowerCase().includes('pm');
        const actualHour = isPM && hour !== 12 ? hour + 12 : hour;

        return filters.times.some((t) => {
          if (t === 'Morning') return actualHour >= 9 && actualHour < 12;
          if (t === 'Afternoon') return actualHour >= 12 && actualHour < 17;
          if (t === 'Evening') return actualHour >= 17;
          return true;
        });
      });
    }

    if (filters.locations.length > 0) {
      filtered = filtered.filter((s) => filters.locations.includes(s.location));
    }

    // Filter by selected partner tags OR typed partner text
    const partnerTerms = [...filters.knowledgePartners];
    if (partnerQuery.trim()) partnerTerms.push(partnerQuery.trim());
    if (partnerTerms.length > 0) {
      filtered = filtered.filter((s) =>
        s.knowledge_partners.some((kp) =>
          partnerTerms.some((term) => kp.toLowerCase().includes(term.toLowerCase()))
        )
      );
    }

    // Filter by selected speaker tags OR typed speaker text
    const speakerTerms = [...filters.speakers];
    if (speakerQuery.trim()) speakerTerms.push(speakerQuery.trim());
    if (speakerTerms.length > 0) {
      filtered = filtered.filter((s) =>
        s.speakers.some((sp) =>
          speakerTerms.some((term) => sp.toLowerCase().includes(term.toLowerCase()))
        )
      );
    }

    if (filters.sectors.length > 0) {
      filtered = filtered.filter((s) =>
        s.tags.some((tag) => classifyTag(tag) === 'sector' && filters.sectors.includes(tag))
      );
    }

    if (filters.thematics.length > 0) {
      filtered = filtered.filter((s) =>
        s.tags.some((tag) => classifyTag(tag) === 'thematic' && filters.thematics.includes(tag))
      );
    }

    if (filters.formats.length > 0) {
      filtered = filtered.filter((s) =>
        s.tags.some((tag) => classifyTag(tag) === 'format' && filters.formats.includes(tag))
      );
    }

    if (filters.timeSlots.length > 0) {
      filtered = filtered.filter((s) => {
        const timeMatch = s.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (!timeMatch) return true;
        let hour = parseInt(timeMatch[1]);
        const period = timeMatch[3]?.toUpperCase();
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;

        return filters.timeSlots.some((slot) => {
          if (slot === 'Morning') return hour < 12;
          if (slot === 'Afternoon') return hour >= 12 && hour < 17;
          if (slot === 'Evening') return hour >= 17;
          return true;
        });
      });
    }

    // Availability filter
    if (availabilityRanges.length > 0) {
      filtered = filtered.filter((session) => {
        const parsedTime = parseSessionTime(session.time);
        if (!parsedTime) return true; // Unparseable → pass through
        return timeRangesOverlap(parsedTime.start, parsedTime.end, availabilityRanges);
      });
    }

    return filtered;
  }, [sessions, filters, searchQuery, speakerQuery, partnerQuery, availabilityRanges]);
}

export function useSchedule() {
  const [schedule, setSchedule] = useState<string[]>(() => {
    const saved = localStorage.getItem('ai-summit-schedule');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('ai-summit-schedule', JSON.stringify(schedule));
  }, [schedule]);

  const addToSchedule = (sessionId: string) => {
    setSchedule((prev) => [...new Set([...prev, sessionId])]);
  };

  const removeFromSchedule = (sessionId: string) => {
    setSchedule((prev) => prev.filter((id) => id !== sessionId));
  };

  const isInSchedule = (sessionId: string) => schedule.includes(sessionId);

  const toggleSchedule = (sessionId: string) => {
    if (isInSchedule(sessionId)) {
      removeFromSchedule(sessionId);
    } else {
      addToSchedule(sessionId);
    }
  };

  return { schedule, addToSchedule, removeFromSchedule, isInSchedule, toggleSchedule };
}
