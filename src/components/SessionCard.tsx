import { useState } from 'react';
import { MapPin, Clock, Users, Bookmark, BookmarkCheck, Calendar, Play, VideoOff } from 'lucide-react';
import { Session } from '../types/session';

interface SessionCardProps {
  session: Session;
  isBookmarked: boolean;
  onToggleBookmark: (e: React.MouseEvent) => void;
  onClick: () => void;
  size?: 'small' | 'medium' | 'large';
}

export function SessionCard({ session, isBookmarked, onToggleBookmark, onClick, size = 'medium' }: SessionCardProps) {
  const isLarge = size === 'large';
  const isSmall = size === 'small';
  const [showNoVideoPopup, setShowNoVideoPopup] = useState(false);

  const handleNoVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNoVideoPopup(true);
    setTimeout(() => setShowNoVideoPopup(false), 2500);
  };


  return (
    <div
      onClick={onClick}
      className={`glass-card rounded-2xl cursor-pointer transition-all duration-300 relative group hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 ${
        isBookmarked ? 'ring-1 ring-cyan-400/50' : ''
      } ${isLarge ? 'p-6' : isSmall ? 'p-4' : 'p-5'}`}
    >
      <button
        onClick={onToggleBookmark}
        className={`absolute top-3 right-3 p-2 rounded-lg transition-all duration-200 ${
          isBookmarked
            ? 'text-cyan-400 bg-cyan-400/20'
            : 'text-slate-400 hover:text-cyan-400 hover:bg-white/10'
        }`}
      >
        {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
      </button>

      <div className="pr-10">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="inline-block px-2.5 py-1 text-xs font-medium bg-purple-500/20 text-purple-300 rounded-lg">
            {session.topic}
          </span>
          {session.youtube_url ? (
            <a
              href={session.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-700 text-white border border-red-600 hover:bg-red-600 transition-all duration-200"
            >
              <Play size={10} className="fill-current" />
              Watch Session
            </a>
          ) : (
            <div className="relative">
              <button
                onClick={handleNoVideoClick}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-700 text-slate-400 border border-slate-600 hover:bg-slate-600 hover:text-slate-300 transition-all duration-200 cursor-pointer"
              >
                <VideoOff size={10} />
                Not available
              </button>
              {showNoVideoPopup && (
                <div className="absolute bottom-full left-0 mb-1.5 z-20 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-xs text-slate-300 shadow-xl whitespace-nowrap">
                  <span className="text-yellow-400 font-medium">No recording available</span> for this session
                  <div className="absolute top-full left-3 w-2 h-2 bg-slate-800 border-r border-b border-slate-600 rotate-45 -mt-1" />
                </div>
              )}
            </div>
          )}
        </div>

        <h3 className={`font-semibold text-white mb-3 line-clamp-2 ${isLarge ? 'text-xl' : isSmall ? 'text-sm' : 'text-base'}`}>
          {session.title}
        </h3>

        <div className={`flex flex-wrap gap-3 text-slate-400 mb-3 ${isSmall ? 'text-xs' : 'text-sm'}`}>
          <div className="flex items-center gap-1.5">
            <Calendar size={isSmall ? 12 : 14} className="text-cyan-400" />
            <span>{session.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={isSmall ? 12 : 14} className="text-cyan-400" />
            <span>{session.time}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={isSmall ? 12 : 14} className="text-cyan-400" />
            <span className="truncate max-w-[100px]">{session.room}</span>
          </div>
        </div>

        {session.speakers.length > 0 && (
          <div className={`flex items-center gap-1.5 text-slate-500 ${isSmall ? 'text-xs' : 'text-sm'}`}>
            <Users size={isSmall ? 12 : 14} className="text-purple-400" />
            <span>{session.speakers.length} speaker{session.speakers.length > 1 ? 's' : ''}</span>
          </div>
        )}

        {!isSmall && session.description && (
          <p className="mt-3 text-sm text-slate-500 line-clamp-2">
            {session.description.replace('See Less', '').trim()}
          </p>
        )}
      </div>
    </div>
  );
}
