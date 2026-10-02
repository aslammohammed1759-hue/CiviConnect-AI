import React from 'react';
import { 
  CivicIssue, 
  IssueStatus, 
  IssueUrgency 
} from '../types';
import { 
  ThumbsUp, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Building2, 
  MessageSquare,
  Sparkles,
  Zap
} from 'lucide-react';

interface IssueCardProps {
  issue: CivicIssue;
  onSelect: (issue: CivicIssue) => void;
  onUpvote: (id: string, e: React.MouseEvent) => void;
  isUpvoted?: boolean;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  onSelect,
  onUpvote,
  isUpvoted,
}) => {
  const getStatusBadge = (status: IssueStatus) => {
    switch (status) {
      case 'Submitted':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"><Clock className="w-3 h-3" /> Submitted</span>;
      case 'AI Triaged':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200"><Sparkles className="w-3 h-3" /> AI Triaged</span>;
      case 'Assigned':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"><Building2 className="w-3 h-3" /> Assigned</span>;
      case 'In Progress':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300"><Zap className="w-3 h-3 text-amber-600 animate-pulse" /> In Progress</span>;
      case 'Resolved':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> Resolved</span>;
    }
  };

  const getUrgencyBadge = (urgency: IssueUrgency) => {
    switch (urgency) {
      case 'Emergency':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-300 animate-pulse">Emergency</span>;
      case 'High':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-100 text-orange-800">High Urgency</span>;
      case 'Medium':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700">Medium</span>;
      case 'Low':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">Low</span>;
    }
  };

  // Format relative date
  const formatTimeAgo = (dateString: string) => {
    const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div 
      onClick={() => onSelect(issue)}
      className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
    >
      <div>
        {/* Card Header & Photo */}
        {issue.imageUrl && (
          <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
            <img 
              src={issue.imageUrl} 
              alt={issue.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/10 pointer-events-none" />
            
            {/* Top floating badges */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
              <span className="bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-mono px-2 py-0.5 rounded-md font-medium">
                {issue.trackingNumber}
              </span>
              <div className="flex items-center gap-1.5">
                {getUrgencyBadge(issue.urgency)}
              </div>
            </div>

            {/* Bottom floating location & category */}
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
              <span className="font-semibold bg-blue-600/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-[11px]">
                {issue.category}
              </span>
              <span className="text-[11px] text-slate-200">
                {formatTimeAgo(issue.createdAt)}
              </span>
            </div>
          </div>
        )}

        <div className="p-4 sm:p-5">
          {/* If no image, show tracking & urgency */}
          {!issue.imageUrl && (
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {issue.trackingNumber}
                </span>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {issue.category}
                </span>
              </div>
              {getUrgencyBadge(issue.urgency)}
            </div>
          )}

          {/* Title & Description */}
          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
            {issue.title}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {issue.description}
          </p>

          {/* Address & Neighborhood */}
          <div className="mt-3.5 flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{issue.location.address}</span>
            <span className="text-slate-300">•</span>
            <span className="shrink-0 font-medium text-slate-700">{issue.location.neighborhood}</span>
          </div>

          {/* AI Analysis Snippet */}
          {issue.aiAnalysis && (
            <div className="mt-3 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-xs text-slate-600 flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <div className="line-clamp-2">
                <span className="font-semibold text-slate-800">AI Assessment: </span>
                {issue.aiAnalysis.summary}
              </div>
            </div>
          )}

          {/* Severity Meter & Department */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="font-medium text-slate-500">Severity:</span>
              <span className={`font-bold ${issue.severityScore >= 8 ? 'text-red-600' : issue.severityScore >= 6 ? 'text-amber-600' : 'text-blue-600'}`}>
                {issue.severityScore}/10
              </span>
              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden ml-1">
                <div 
                  className={`h-full rounded-full ${
                    issue.severityScore >= 8 ? 'bg-red-500' : issue.severityScore >= 6 ? 'bg-amber-500' : 'bg-blue-500'
                  }`} 
                  style={{ width: `${(issue.severityScore / 10) * 100}%` }}
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
              {issue.department.split('-')[0].trim()}
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer: Status, Comments, and Upvote */}
      <div className="px-4 sm:px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusBadge(issue.status)}
          {issue.comments && issue.comments.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium ml-1">
              <MessageSquare className="w-3 h-3 text-slate-400" />
              {issue.comments.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => onUpvote(issue.id, e)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              isUpvoted 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600'
            }`}
            title="Upvote to raise civic priority in city dispatch"
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-current' : ''}`} />
            <span>{issue.upvotes}</span>
          </button>

          <span className="p-1 rounded-md text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>
  );
};
