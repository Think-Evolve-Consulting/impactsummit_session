import { MapPin, Clock, Users, Bookmark, BookmarkCheck, Calendar } from 'lucide-react';
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
        <span className="inline-block px-2.5 py-1 text-xs font-medium bg-purple-500/20 text-purple-300 rounded-lg mb-3">
          {session.topic}
        </span>
        
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
