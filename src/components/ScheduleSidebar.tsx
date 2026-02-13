import { X, Calendar, Clock, MapPin } from 'lucide-react';
import { Session } from '../types/session';

interface ScheduleSidebarProps {
  scheduleIds: string[];
  allSessions: Session[];
  onRemove: (id: string) => void;
  onSelectSession: (session: Session) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ScheduleSidebar({ scheduleIds, allSessions, onRemove, onSelectSession, isOpen, onClose }: ScheduleSidebarProps) {
  const scheduledSessions = allSessions.filter((s) => scheduleIds.includes(s.id));
  
  const groupedByDate = scheduledSessions.reduce((acc, session) => {
    const date = session.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {} as Record<string, Session[]>);

  const content = (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
          <Calendar size={16} className="text-cyan-400" /> My Schedule
        </h3>
        <span className="px-2 py-0.5 bg-cyan-400/20 text-cyan-400 text-xs font-medium rounded-full">
          {scheduledSessions.length}
        </span>
      </div>

      {scheduledSessions.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-6">
          Bookmark sessions to build your schedule
        </p>
      ) : (
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin">
          {Object.entries(groupedByDate).map(([date, dateSessions]) => (
            <div key={date}>
              <p className="text-xs font-medium text-purple-400 mb-2">{date}</p>
              {dateSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-slate-800/50 rounded-lg p-3 mb-2 cursor-pointer hover:bg-slate-700/50 transition-colors group border border-slate-700/30"
                  onClick={() => onSelectSession(session)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-medium text-white line-clamp-2">
                      {session.title}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-600/50 rounded"
                    >
                      <X size={12} className="text-slate-400" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={10} className="text-cyan-400" />
                      {session.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={10} className="text-cyan-400" />
                      <span className="truncate max-w-[80px]">{session.room}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop - renders inline */}
      <div className="hidden lg:block">{content}</div>

      {/* Mobile Bottom Sheet */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <div className="absolute bottom-0 left-0 right-0 glass-card rounded-t-2xl max-h-[70vh] overflow-hidden">
            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-cyan-400" /> My Schedule ({scheduledSessions.length})
              </h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-700/50 rounded-lg">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(70vh-60px)]">
              {scheduledSessions.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  No sessions added yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {scheduledSessions.map((session) => (
                    <div
                      key={session.id}
                      className="bg-slate-800/50 rounded-lg p-3 flex justify-between items-start border border-slate-700/30"
                      onClick={() => {
                        onSelectSession(session);
                        onClose();
                      }}
                    >
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-white line-clamp-1">
                          {session.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {session.date} | {session.time}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(session.id);
                        }}
                        className="p-1 hover:bg-slate-600/50 rounded ml-2"
                      >
                        <X size={14} className="text-slate-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
