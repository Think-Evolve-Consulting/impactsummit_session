import { X, MapPin, Clock, Users, Building2, Bookmark, BookmarkCheck } from 'lucide-react';
import { Session } from '../types/session';

interface SessionModalProps {
  session: Session;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onClose: () => void;
}

export function SessionModal({ session, isBookmarked, onToggleBookmark, onClose }: SessionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative glass-card rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
        >
          <X size={18} className="text-slate-400" />
        </button>

        <div className="p-6">
          <span className="inline-block px-3 py-1 text-xs font-medium bg-purple-500/20 text-purple-300 rounded-lg mb-4">
            {session.topic}
          </span>

          <h2 className="text-xl font-bold text-white mb-6 pr-8">
            {session.title}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-3 bg-slate-800/30 rounded-xl p-3">
              <Clock size={18} className="text-cyan-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">Date & Time</p>
                <p className="text-sm font-medium text-white">{session.date}</p>
                <p className="text-sm text-slate-300">{session.time}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-slate-800/30 rounded-xl p-3">
              <MapPin size={18} className="text-cyan-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">Location</p>
                <p className="text-sm font-medium text-white">{session.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-slate-800/30 rounded-xl p-3 col-span-2">
              <Building2 size={18} className="text-purple-400 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">Room</p>
                <p className="text-sm font-medium text-white">{session.room}</p>
              </div>
            </div>
          </div>

          {session.description && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-white mb-2">About</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                {session.description.replace('See Less', '').trim()}
              </p>
            </div>
          )}

          {session.speakers.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Users size={16} className="text-purple-400" /> Speakers ({session.speakers.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {session.speakers.map((speaker, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300"
                  >
                    {speaker}
                  </span>
                ))}
              </div>
            </div>
          )}

          {session.knowledge_partners.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-white mb-2">Knowledge Partners</h4>
              <div className="flex flex-wrap gap-2">
                {session.knowledge_partners.map((partner, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 rounded-lg text-sm"
                  >
                    {partner}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={onToggleBookmark}
            className={`w-full py-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              isBookmarked
                ? 'bg-slate-700/50 text-slate-300 border border-slate-600/50 hover:bg-slate-600/50'
                : 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:opacity-90'
            }`}
          >
            {isBookmarked ? (
              <>
                <BookmarkCheck size={18} /> Remove from Schedule
              </>
            ) : (
              <>
                <Bookmark size={18} /> Add to My Schedule
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
