import { useState, useMemo } from 'react';
import { Calendar, Search, X, Clock, MapPin, Users, Bookmark, BookmarkCheck, ChevronRight, Download, Tag, Layers, Layout, Github } from 'lucide-react';
import { useSessions, useFilteredSessions, useSchedule } from './hooks/useSessions';
import { useAvailability } from './hooks/useAvailability';
import { Session, FilterState, TIME_SLOTS, SECTORS, THEMATICS, FORMATS, classifyTag } from './types/session';
import { cn } from '@/lib/utils';
import { downloadICS } from '@/lib/calendar';
import { presetToTimeRange, generateTimeOptions, convert12to24, convert24to12 } from './lib/timeUtils';
import './index.css';

function App() {
  const { sessions, loading, error } = useSessions();
  const { schedule, toggleSchedule, isInSchedule, removeFromSchedule } = useSchedule();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    topics: [],
    dates: [],
    times: [],
    locations: [],
    knowledgePartners: [],
    speakers: [],
    timeSlots: [],
    sectors: [],
    thematics: [],
    formats: [],
  });
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showSchedulePanel, setShowSchedulePanel] = useState(false);
  const [partnerInput, setPartnerInput] = useState('');
  const [speakerInput, setSpeakerInput] = useState('');
  const [showPartnerSuggestions, setShowPartnerSuggestions] = useState(false);
  const [showSpeakerSuggestions, setShowSpeakerSuggestions] = useState(false);

  const { ranges: availabilityRanges, rememberAvailability, addTimeRange, removeTimeRange, clearAllRanges, toggleRemember } = useAvailability();
  const [showAvailabilityPanel, setShowAvailabilityPanel] = useState(false);
  const [availStartTime, setAvailStartTime] = useState('9:00');
  const [availEndTime, setAvailEndTime] = useState('5:00');
  const [startPeriod, setStartPeriod] = useState<'AM' | 'PM'>('AM');
  const [endPeriod, setEndPeriod] = useState<'AM' | 'PM'>('PM');
  const [timeRangeError, setTimeRangeError] = useState<string>('');

  const uniqueDates = useMemo(() => [...new Set(sessions.map((s) => s.date))].sort(), [sessions]);
  const uniqueLocations = useMemo(() => [...new Set(sessions.map((s) => s.location))].sort(), [sessions]);
  const uniqueKnowledgePartners = useMemo(() =>
    [...new Set(sessions.flatMap((s) => s.knowledge_partners))].filter(Boolean).sort(),
    [sessions]
  );
  const uniqueSpeakers = useMemo(() =>
    [...new Set(sessions.flatMap((s) => s.speakers))].filter(Boolean).sort(),
    [sessions]
  );

  const usedSectors = useMemo(() =>
    SECTORS.filter((s) => sessions.some((sess) => sess.tags?.includes(s))),
    [sessions]
  );
  const usedThematics = useMemo(() =>
    THEMATICS.filter((t) => sessions.some((sess) => sess.tags?.includes(t))),
    [sessions]
  );
  const usedFormats = useMemo(() =>
    FORMATS.filter((f) => sessions.some((sess) => sess.tags?.includes(f))),
    [sessions]
  );

  const filteredPartnerSuggestions = useMemo(() => {
    if (!partnerInput.trim()) return [];
    const q = partnerInput.toLowerCase();
    return uniqueKnowledgePartners
      .filter((p) => p.toLowerCase().includes(q) && !filters.knowledgePartners.includes(p))
      .slice(0, 6);
  }, [partnerInput, uniqueKnowledgePartners, filters.knowledgePartners]);

  const filteredSpeakerSuggestions = useMemo(() => {
    if (!speakerInput.trim()) return [];
    const q = speakerInput.toLowerCase();
    return uniqueSpeakers
      .filter((s) => s.toLowerCase().includes(q) && !filters.speakers.includes(s))
      .slice(0, 6);
  }, [speakerInput, uniqueSpeakers, filters.speakers]);

  const filteredSessions = useFilteredSessions(sessions, filters, searchQuery, speakerInput, partnerInput, availabilityRanges);
  const scheduledSessions = sessions.filter((s) => schedule.includes(s.id));

  const featuredSession = filteredSessions[0];
  const regularSessions = filteredSessions.slice(1);

  const topSpeakers = useMemo(() => {
    const speakerCount: Record<string, number> = {};
    sessions.forEach((s) => {
      s.speakers.forEach((sp) => {
        speakerCount[sp] = (speakerCount[sp] || 0) + 1;
      });
    });
    return Object.entries(speakerCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name]) => name);
  }, [sessions]);

  const toggleFilter = (type: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((v) => v !== value)
        : [...prev[type], value],
    }));
  };

  const clearFilters = () => {
    setFilters({ topics: [], dates: [], times: [], locations: [], knowledgePartners: [], speakers: [], timeSlots: [], sectors: [], thematics: [], formats: [] });
    setSearchQuery('');
    setPartnerInput('');
    setSpeakerInput('');
    clearAllRanges();
  };

  const hasActiveFilters = filters.topics.length > 0 || filters.dates.length > 0 ||
    filters.locations.length > 0 || filters.knowledgePartners.length > 0 ||
    filters.speakers.length > 0 || filters.timeSlots.length > 0 ||
    filters.sectors.length > 0 || filters.thematics.length > 0 || filters.formats.length > 0 ||
    availabilityRanges.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c]">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white/60">Loading sessions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c]">
        <div className="glass-card p-8 text-center">
          <p className="text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1c]" onClick={() => { setShowPartnerSuggestions(false); setShowSpeakerSuggestions(false); }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-40 glass-nav">
        <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/Think-Evolve-Consulting/impactsummit_session"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="View on GitHub"
            >
              <Github size={20} />
            </a>
            <img src="/ai-summit-logo.png" alt="AI Impact Summit 2026" className="h-10 w-auto" />
            <span className="font-semibold text-white hidden sm:block">India AI Summit 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sessions..."
                className="w-64 h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <button
              onClick={() => setShowSchedulePanel(true)}
              className="flex items-center gap-2 px-4 py-2 accent-gradient rounded-xl text-white font-medium text-sm"
            >
              <Calendar size={16} />
              <span>{schedule.length}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex max-w-[1800px] mx-auto px-4 py-8 gap-4">
        {/* Left Sidebar - Sector/Domain + Format */}
        <aside className="hidden xl:block w-60 shrink-0 sticky top-20 self-start max-h-[calc(100vh-5rem)] overflow-y-auto space-y-4 pr-1 scrollbar-hide">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Layers size={16} className="text-rose-400 shrink-0" />
              <span className="text-white/50 text-xs font-medium uppercase tracking-wider">Sector / Domain</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {usedSectors.map((sector) => (
                <button
                  key={sector}
                  onClick={() => toggleFilter('sectors', sector)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium text-left transition-all",
                    filters.sectors.includes(sector)
                      ? "bg-rose-500/30 text-rose-300 border border-rose-500/50"
                      : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
                  )}
                >
                  {sector}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Layout size={16} className="text-teal-400 shrink-0" />
              <span className="text-white/50 text-xs font-medium uppercase tracking-wider">Format</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {usedFormats.map((format) => (
                <button
                  key={format}
                  onClick={() => toggleFilter('formats', format)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium text-left transition-all",
                    filters.formats.includes(format)
                      ? "bg-teal-500/30 text-teal-300 border border-teal-500/50"
                      : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
                  )}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
        {/* Mobile Search */}
        <div className="md:hidden mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sessions..."
              className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50"
            />
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-4 auto-rows-[minmax(80px,auto)]">
          
          {/* Featured Session - Large Card */}
          {featuredSession && (
            <div
              onClick={() => setSelectedSession(featuredSession)}
              className="col-span-12 lg:col-span-7 row-span-4 glass-card glass-card-hover p-6 cursor-pointer transition-all duration-300"
            >
              <p className="text-xs font-medium text-purple-400 uppercase tracking-wider mb-2">Featured Session</p>
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4 line-clamp-2">{featuredSession.title}</h2>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl accent-gradient flex items-center justify-center">
                  <Users size={28} className="text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Speakers</p>
                  <p className="text-white font-medium">{featuredSession.speakers.length > 0 ? featuredSession.speakers.slice(0, 2).join(', ') : 'TBA'}</p>
                </div>
              </div>

              <div className="glass-card p-4 mb-4">
                <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Schedule</p>
                <p className="text-lg font-semibold text-white">{featuredSession.date}, {featuredSession.time}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="tag-purple px-3 py-1 rounded-full text-xs font-medium">{featuredSession.topic}</span>
                <span className="tag-cyan px-3 py-1 rounded-full text-xs font-medium">{featuredSession.location}</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSchedule(featuredSession.id);
                }}
                className={cn(
                  "mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  isInSchedule(featuredSession.id)
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "accent-gradient text-white"
                )}
              >
                {isInSchedule(featuredSession.id) ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                {isInSchedule(featuredSession.id) ? 'Saved' : 'Add to Schedule'}
              </button>
            </div>
          )}

          {/* Speaker Highlights - Medium Card */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-5 row-span-2 glass-card p-5">
            <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-4">Speaker Highlights</p>
            <div className="grid grid-cols-2 gap-4">
              {topSpeakers.slice(0, 4).map((speaker, idx) => (
                <div key={speaker} className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm",
                    idx % 2 === 0 ? "bg-purple-500/30" : "bg-cyan-500/30"
                  )}>
                    {speaker.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm truncate">{speaker}</p>
                    <p className="text-white/50 text-xs">Speaker</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule Preview - Medium Card */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-5 row-span-2 glass-card p-5">
            <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">Schedule Preview</p>
            <div className="space-y-2">
              {scheduledSessions.length === 0 ? (
                <p className="text-white/40 text-sm py-4 text-center">No sessions saved yet</p>
              ) : (
                scheduledSessions.slice(0, 3).map((session) => (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                  >
                    <div className="w-1 h-10 rounded-full bg-cyan-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{session.title}</p>
                      <p className="text-white/50 text-xs">{session.time}</p>
                    </div>
                    <ChevronRight size={16} className="text-white/30" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Venue & Time Slot Filters */}
          <div className="col-span-12 sm:col-span-6 row-span-1 glass-card p-4">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
              <MapPin size={16} className="text-cyan-400 shrink-0" />
              <span className="text-white/50 text-xs shrink-0">Venue:</span>
              {uniqueLocations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => toggleFilter('locations', loc)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                    filters.locations.includes(loc)
                      ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500/50"
                      : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
                  )}
                >
                  {loc.length > 20 ? loc.substring(0, 20) + '...' : loc}
                </button>
              ))}
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-white/50 hover:text-white text-xs flex items-center gap-1 shrink-0">
                  <X size={14} /> Clear all
                </button>
              )}
            </div>
          </div>

          {/* Time & Availability Filter */}
          <div className="col-span-12 sm:col-span-6 row-span-1 glass-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock size={16} className="text-purple-400 shrink-0" />
              <span className="text-white/50 text-xs shrink-0">Time:</span>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-2 flex-wrap">
              {TIME_SLOTS.map((slot) => {
                const range = presetToTimeRange(slot);
                const isActive = availabilityRanges.some(
                  r => r.startTime === range.startTime && r.endTime === range.endTime
                );
                return (
                  <button
                    key={slot}
                    onClick={() => {
                      if (isActive) {
                        const match = availabilityRanges.find(
                          r => r.startTime === range.startTime
                        );
                        if (match) removeTimeRange(match.id);
                      } else {
                        addTimeRange(range.startTime, range.endTime);
                      }
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                      isActive
                        ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                        : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
                    )}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Time Range */}
          <div className="col-span-12 sm:col-span-6 row-span-1 glass-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <Clock size={16} className="text-purple-400 shrink-0" />
              <span className="text-white/50 text-xs shrink-0">Custom Time Range (8 AM - 10 PM):</span>
            </div>

            {/* Time Inputs */}
            <div className="mb-3 space-y-2">
              {/* Start Time Row */}
              <div className="flex gap-2 items-center">
                <span className="text-white/60 text-xs w-12">From:</span>
                <input
                  type="text"
                  value={availStartTime}
                  onChange={(e) => setAvailStartTime(e.target.value)}
                  placeholder="9:00"
                  className="w-20 h-9 px-3 rounded-lg bg-[#1a1f2e] border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50 placeholder:text-white/40"
                />
                <div className="flex gap-1">
                  <button
                    onClick={() => setStartPeriod('AM')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      startPeriod === 'AM'
                        ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                        : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
                    )}
                  >
                    AM
                  </button>
                  <button
                    onClick={() => setStartPeriod('PM')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      startPeriod === 'PM'
                        ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                        : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
                    )}
                  >
                    PM
                  </button>
                </div>
              </div>

              {/* End Time Row */}
              <div className="flex gap-2 items-center">
                <span className="text-white/60 text-xs w-12">To:</span>
                <input
                  type="text"
                  value={availEndTime}
                  onChange={(e) => setAvailEndTime(e.target.value)}
                  placeholder="5:00"
                  className="w-20 h-9 px-3 rounded-lg bg-[#1a1f2e] border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50 placeholder:text-white/40"
                />
                <div className="flex gap-1">
                  <button
                    onClick={() => setEndPeriod('AM')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      endPeriod === 'AM'
                        ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                        : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
                    )}
                  >
                    AM
                  </button>
                  <button
                    onClick={() => setEndPeriod('PM')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      endPeriod === 'PM'
                        ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                        : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
                    )}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>

            {/* Add Button */}
            <button
              onClick={() => {
                setTimeRangeError('');
                const startTimeStr = `${availStartTime.trim()} ${startPeriod}`;
                const endTimeStr = `${availEndTime.trim()} ${endPeriod}`;
                const start24 = convert12to24(startTimeStr);
                const end24 = convert12to24(endTimeStr);

                // Validate time range (8 AM = 08:00, 10 PM = 22:00)
                if (start24 < '08:00' || end24 > '22:00') {
                  setTimeRangeError('Time must be between 8 AM and 10 PM');
                  return;
                }

                if (start24 >= end24) {
                  setTimeRangeError('Start time must be before end time');
                  return;
                }

                addTimeRange(start24, end24);
                setTimeRangeError('');
              }}
              className="w-full px-3 py-2 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-medium hover:bg-purple-500/30 border border-purple-500/30 mb-3"
            >
              Add Time Range
            </button>

            {/* Error Message */}
            {timeRangeError && (
              <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                {timeRangeError}
              </div>
            )}

            {/* Active Ranges */}
            {availabilityRanges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {availabilityRanges.map((range) => (
                  <span
                    key={range.id}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-medium border border-purple-500/30"
                  >
                    {convert24to12(range.startTime)} - {convert24to12(range.endTime)}
                    <button
                      onClick={() => removeTimeRange(range.id)}
                      className="hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Remember Toggle */}
            <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberAvailability}
                onChange={toggleRemember}
                className="w-3 h-3 accent-purple-500"
              />
              Remember my availability
            </label>
          </div>

          {/* Sector/Domain Filter - inline for mobile, hidden on xl (shown in sidebar) */}
          <div className="col-span-12 row-span-1 glass-card p-4 xl:hidden">
            <div className="flex items-center gap-3 mb-2">
              <Layers size={16} className="text-rose-400 shrink-0" />
              <span className="text-white/50 text-xs shrink-0">Sector / Domain:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {usedSectors.map((sector) => (
                <button
                  key={sector}
                  onClick={() => toggleFilter('sectors', sector)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                    filters.sectors.includes(sector)
                      ? "bg-rose-500/30 text-rose-300 border border-rose-500/50"
                      : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
                  )}
                >
                  {sector}
                </button>
              ))}
            </div>
          </div>

          {/* Thematic Filter - inline for mobile, hidden on xl (shown in sidebar) */}
          <div className="col-span-12 row-span-1 glass-card p-4 xl:hidden">
            <div className="flex items-center gap-3 mb-2">
              <Tag size={16} className="text-amber-400 shrink-0" />
              <span className="text-white/50 text-xs shrink-0">Thematic:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {usedThematics.map((thematic) => (
                <button
                  key={thematic}
                  onClick={() => toggleFilter('thematics', thematic)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                    filters.thematics.includes(thematic)
                      ? "bg-amber-500/30 text-amber-300 border border-amber-500/50"
                      : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
                  )}
                >
                  {thematic}
                </button>
              ))}
            </div>
          </div>

          {/* Format Filter - inline for mobile, hidden on xl (shown in sidebar) */}
          <div className="col-span-12 sm:col-span-6 row-span-1 glass-card p-4 xl:hidden">
            <div className="flex items-center gap-3 mb-2">
              <Layout size={16} className="text-teal-400 shrink-0" />
              <span className="text-white/50 text-xs shrink-0">Format:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {usedFormats.map((format) => (
                <button
                  key={format}
                  onClick={() => toggleFilter('formats', format)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                    filters.formats.includes(format)
                      ? "bg-teal-500/30 text-teal-300 border border-teal-500/50"
                      : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
                  )}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>

          {/* Knowledge Partners Filter */}
          <div className="col-span-12 sm:col-span-6 row-span-1 glass-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <Users size={16} className="text-green-400 shrink-0" />
              <span className="text-white/50 text-xs shrink-0">Knowledge Partners:</span>
            </div>
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={partnerInput}
                onChange={(e) => { setPartnerInput(e.target.value); setShowPartnerSuggestions(true); }}
                onFocus={() => setShowPartnerSuggestions(true)}
                placeholder="Type partner name..."
                className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-green-500/50"
              />
              {showPartnerSuggestions && filteredPartnerSuggestions.length > 0 && (
                <div className="absolute z-50 bottom-full mb-1 w-full glass-modal rounded-lg border border-white/10 py-1 max-h-48 overflow-y-auto">
                  {filteredPartnerSuggestions.map((partner) => (
                    <button
                      key={partner}
                      onClick={() => {
                        toggleFilter('knowledgePartners', partner);
                        setPartnerInput('');
                        setShowPartnerSuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors truncate"
                    >
                      {partner}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {filters.knowledgePartners.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {filters.knowledgePartners.map((partner) => (
                  <span key={partner} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/20 text-green-300 text-xs font-medium border border-green-500/30">
                    {partner.length > 25 ? partner.substring(0, 25) + '...' : partner}
                    <button onClick={() => toggleFilter('knowledgePartners', partner)} className="hover:text-white">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Speakers Filter */}
          <div className="col-span-12 sm:col-span-6 row-span-1 glass-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <Users size={16} className="text-orange-400 shrink-0" />
              <span className="text-white/50 text-xs shrink-0">Speakers:</span>
            </div>
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={speakerInput}
                onChange={(e) => { setSpeakerInput(e.target.value); setShowSpeakerSuggestions(true); }}
                onFocus={() => setShowSpeakerSuggestions(true)}
                placeholder="Type speaker name..."
                className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-orange-500/50"
              />
              {showSpeakerSuggestions && filteredSpeakerSuggestions.length > 0 && (
                <div className="absolute z-50 bottom-full mb-1 w-full glass-modal rounded-lg border border-white/10 py-1 max-h-48 overflow-y-auto">
                  {filteredSpeakerSuggestions.map((speaker) => (
                    <button
                      key={speaker}
                      onClick={() => {
                        toggleFilter('speakers', speaker);
                        setSpeakerInput('');
                        setShowSpeakerSuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors truncate"
                    >
                      {speaker}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {filters.speakers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {filters.speakers.map((speaker) => (
                  <span key={speaker} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/20 text-orange-300 text-xs font-medium border border-orange-500/30">
                    {speaker.length > 30 ? speaker.substring(0, 30) + '...' : speaker}
                    <button onClick={() => toggleFilter('speakers', speaker)} className="hover:text-white">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="col-span-6 sm:col-span-3 row-span-1 glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Calendar size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{filteredSessions.length}</p>
              <p className="text-white/50 text-xs">Sessions</p>
            </div>
          </div>

          <div className="col-span-6 sm:col-span-3 row-span-1 glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Users size={20} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{new Set(filteredSessions.flatMap(s => s.speakers)).size}</p>
              <p className="text-white/50 text-xs">Speakers</p>
            </div>
          </div>

          <div className="col-span-6 sm:col-span-3 row-span-1 glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <MapPin size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{new Set(filteredSessions.map(s => s.location)).size}</p>
              <p className="text-white/50 text-xs">Venues</p>
            </div>
          </div>

          <div className="col-span-6 sm:col-span-3 row-span-1 glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Bookmark size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{schedule.length}</p>
              <p className="text-white/50 text-xs">Saved</p>
            </div>
          </div>

          {/* Date Filter Pills */}
          <div className="col-span-12 row-span-1 flex items-center gap-3 overflow-x-auto scrollbar-hide py-2">
            <span className="text-white/50 text-sm shrink-0">Dates:</span>
            {uniqueDates.map((date) => (
              <button
                key={date}
                onClick={() => toggleFilter('dates', date)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                  filters.dates.includes(date)
                    ? "accent-gradient text-white"
                    : "glass-card text-white/70 hover:text-white"
                )}
              >
                {date}
              </button>
            ))}
          </div>

          {/* Session Grid */}
          {filteredSessions.length === 0 ? (
            <div className="col-span-12 glass-card p-12 text-center">
              <p className="text-white/50 mb-2">
                {availabilityRanges.length > 0
                  ? 'There are no sessions scheduled in the given time frame'
                  : 'No sessions match your filters'}
              </p>
              <p className="text-white/40 text-sm mb-4">
                {availabilityRanges.length > 0
                  ? 'Try adjusting your time range or clear filters to see all sessions'
                  : 'Try adjusting your filters or clear them to see all sessions'}
              </p>
              <button onClick={clearFilters} className="text-purple-400 hover:text-purple-300">Clear filters</button>
            </div>
          ) : (
            regularSessions.map((session, idx) => (
              <div
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className={cn(
                  "glass-card glass-card-hover p-5 cursor-pointer transition-all duration-300",
                  idx % 5 === 0 ? "col-span-12 sm:col-span-6 lg:col-span-4 row-span-2" :
                  idx % 5 === 1 ? "col-span-12 sm:col-span-6 lg:col-span-4 row-span-2" :
                  "col-span-12 sm:col-span-6 lg:col-span-4 row-span-2"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={cn(
                    "px-2 py-1 rounded-lg text-xs font-medium",
                    idx % 3 === 0 ? "tag-purple" : idx % 3 === 1 ? "tag-cyan" : "tag-blue"
                  )}>
                    {session.topic}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSchedule(session.id);
                    }}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      isInSchedule(session.id) ? "text-purple-400 bg-purple-500/20" : "text-white/30 hover:text-white/60"
                    )}
                  >
                    {isInSchedule(session.id) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                  </button>
                </div>

                <h3 className="text-white font-semibold mb-3 line-clamp-2">{session.title}</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-white/60">
                    <Clock size={14} />
                    <span>{session.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <MapPin size={14} />
                    <span className="truncate">{session.room}</span>
                  </div>
                  {session.speakers.length > 0 && (
                    <div className="flex items-center gap-2 text-white/60">
                      <Users size={14} />
                      <span>{session.speakers.length} speaker{session.speakers.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

        {/* Right Sidebar - Thematic */}
        <aside className="hidden xl:block w-60 shrink-0 sticky top-20 self-start max-h-[calc(100vh-5rem)] overflow-y-auto space-y-4 pl-1 scrollbar-hide">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Tag size={16} className="text-amber-400 shrink-0" />
              <span className="text-white/50 text-xs font-medium uppercase tracking-wider">Thematic</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {usedThematics.map((thematic) => (
                <button
                  key={thematic}
                  onClick={() => toggleFilter('thematics', thematic)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium text-left transition-all",
                    filters.thematics.includes(thematic)
                      ? "bg-amber-500/30 text-amber-300 border border-amber-500/50"
                      : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
                  )}
                >
                  {thematic}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Session Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedSession(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative glass-modal rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
          >
            <button
              onClick={() => setSelectedSession(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X size={20} className="text-white" />
            </button>

            <div className="p-8">
              <span className="tag-purple px-3 py-1 rounded-full text-xs font-medium">{selectedSession.topic}</span>

              <h2 className="text-2xl font-bold text-white mt-4 mb-6 pr-8">{selectedSession.title}</h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="glass-card p-4">
                  <p className="text-xs text-white/50 mb-1">Date & Time</p>
                  <p className="text-white font-medium">{selectedSession.date}</p>
                  <p className="text-white/70">{selectedSession.time}</p>
                </div>
                <div className="glass-card p-4">
                  <p className="text-xs text-white/50 mb-1">Location</p>
                  <p className="text-white font-medium">{selectedSession.location}</p>
                  <p className="text-white/70 text-sm truncate">{selectedSession.room}</p>
                </div>
              </div>

              {selectedSession.description && (
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-2">About</h4>
                  <p className="text-white/70 leading-relaxed">{selectedSession.description.replace('See Less', '').trim()}</p>
                </div>
              )}

              {selectedSession.speakers.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-3">Speakers ({selectedSession.speakers.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSession.speakers.map((speaker, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-white/10 rounded-full text-sm text-white">{speaker}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedSession.knowledge_partners.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-2">Knowledge Partners</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSession.knowledge_partners.map((partner, idx) => (
                      <span key={idx} className="tag-cyan px-3 py-1 rounded-full text-sm">{partner}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedSession.tags?.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-white font-semibold mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSession.tags.map((tag, idx) => {
                      const cat = classifyTag(tag);
                      const colorClass = cat === 'sector' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : cat === 'format' ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                      return (
                        <span key={idx} className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>{tag}</span>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={() => toggleSchedule(selectedSession.id)}
                className={cn(
                  "w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
                  isInSchedule(selectedSession.id)
                    ? "bg-white/10 text-white border border-white/20 hover:bg-white/15"
                    : "accent-gradient text-white"
                )}
              >
                {isInSchedule(selectedSession.id) ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                {isInSchedule(selectedSession.id) ? 'Remove from Schedule' : 'Add to My Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Panel */}
      {showSchedulePanel && (
        <div className="fixed inset-0 z-50" onClick={() => setShowSchedulePanel(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 bottom-0 w-full max-w-md glass-modal border-l border-white/10"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Calendar size={20} /> My Schedule ({scheduledSessions.length})
              </h3>
              <div className="flex items-center gap-2">
                {scheduledSessions.length > 0 && (
                  <button
                    onClick={() => downloadICS(scheduledSessions)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
                  >
                    <Download size={16} /> Export .ics
                  </button>
                )}
                <button onClick={() => setShowSchedulePanel(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto h-[calc(100vh-80px)]">
              {scheduledSessions.length === 0 ? (
                <p className="text-white/50 text-center py-8">No sessions saved yet. Browse and bookmark sessions to build your schedule.</p>
              ) : (
                <div className="space-y-3">
                  {scheduledSessions.map((session) => (
                    <div
                      key={session.id}
                      className="glass-card p-4 cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => {
                        setSelectedSession(session);
                        setShowSchedulePanel(false);
                      }}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium line-clamp-2 mb-1">{session.title}</h4>
                          <p className="text-white/50 text-sm">{session.date} | {session.time}</p>
                          <p className="text-white/40 text-xs mt-1 truncate">{session.room}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromSchedule(session.id);
                          }}
                          className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer Footer */}
      <footer className="border-t border-white/10 py-4 px-6 text-center">
        <p className="text-white/40 text-xs">
          Session data is derived from the official{' '}
          <a href="https://impact.indiaai.gov.in/sessions" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">
            India AI Impact Summit 2026
          </a>
          {' '}website, which should be taken as the ground truth.
        </p>
        <p className="text-white/40 text-xs mt-1">
          Developed by{' '}
          <a href="https://www.thinkevolveconsulting.com/resources/case-studies-articles/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">
            Think Evolve Labs
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
