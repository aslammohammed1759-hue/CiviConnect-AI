import React, { useState } from 'react';
import { 
  CivicIssue, 
  IssueStatus 
} from '../types';
import { 
  X, 
  ThumbsUp, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Building2, 
  Sparkles, 
  AlertTriangle, 
  Send, 
  User, 
  HardHat, 
  ShieldCheck, 
  Calendar,
  Layers,
  ArrowRight,
  Loader2,
  Share2,
  Check
} from 'lucide-react';

interface IssueDetailModalProps {
  issue: CivicIssue | null;
  onClose: () => void;
  onUpvote: (id: string, e: React.MouseEvent) => void;
  isUpvoted?: boolean;
  onStatusChange: (issueId: string, newStatus: IssueStatus, note?: string, generateAi?: boolean) => Promise<void>;
  onAddComment: (issueId: string, text: string) => Promise<void>;
  userRole: 'citizen' | 'official';
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issue,
  onClose,
  onUpvote,
  isUpvoted,
  onStatusChange,
  onAddComment,
  userRole,
}) => {
  const [commentText, setCommentText] = useState('');
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [newStatus, setNewStatus] = useState<IssueStatus>(issue?.status || 'Submitted');
  const [officialNote, setOfficialNote] = useState('');
  const [generateAiNotice, setGenerateAiNotice] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!issue) return null;

  const statusSteps: IssueStatus[] = ['Submitted', 'AI Triaged', 'Assigned', 'In Progress', 'Resolved'];

  const currentStepIndex = statusSteps.indexOf(issue.status);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSendingComment(true);
    try {
      await onAddComment(issue.id, commentText);
      setCommentText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingComment(false);
    }
  };

  const handleOfficialStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingStatus(true);
    try {
      await onStatusChange(issue.id, newStatus, officialNote, generateAiNotice);
      setOfficialNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCopyShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
              {issue.trackingNumber}
            </span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              {issue.category}
            </span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
              issue.urgency === 'Emergency' ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse' :
              issue.urgency === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-700'
            }`}>
              {issue.urgency} Urgency
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShare}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
              title="Share tracking link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - 2 Column Layout on Desktop */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (8 cols): Details, Photo, AI Analysis */}
          <div className="lg:col-span-7 space-y-5">
            {/* Title & Description */}
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {issue.title}
              </h2>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {issue.description}
              </p>
            </div>

            {/* Photo if present */}
            {issue.imageUrl && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm max-h-72">
                <img
                  src={issue.imageUrl}
                  alt={issue.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Location & Reported Metadata */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold text-slate-900">{issue.location.address}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600">{issue.location.neighborhood}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 pt-2 border-t border-slate-200/60 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Reported by: <strong className="text-slate-700">{issue.reporter.isAnonymous ? 'Anonymous Resident' : issue.reporter.name}</strong></span>
                </div>
                <div>
                  Logged: {new Date(issue.createdAt).toLocaleDateString()} at {new Date(issue.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* AI Civic Triage Deep Dive */}
            {issue.aiAnalysis && (
              <div className="p-5 bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-white rounded-3xl border border-blue-200/80 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      CiviConnect AI Triage Assessment
                    </span>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                    Confidence {issue.aiAnalysis.triageConfidence}%
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {issue.aiAnalysis.summary}
                </p>

                {/* Hazards */}
                {issue.aiAnalysis.hazards && issue.aiAnalysis.hazards.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      Identified Public Safety Hazards
                    </h5>
                    <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                      {issue.aiAnalysis.hazards.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Steps for Crew */}
                {issue.aiAnalysis.actionSteps && issue.aiAnalysis.actionSteps.length > 0 && (
                  <div className="pt-2 border-t border-blue-100">
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-blue-900 mb-1 flex items-center gap-1">
                      <HardHat className="w-3 h-3 text-blue-600" />
                      Standard Municipal Action Steps
                    </h5>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {issue.aiAnalysis.actionSteps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Citizen Notice */}
                {issue.aiAnalysis.citizenNotice && (
                  <div className="bg-white/80 p-3 rounded-xl border border-blue-100 text-xs text-blue-950 italic">
                    <span className="font-semibold not-italic block text-blue-900 text-[10px] uppercase">Official Citizen Advisory:</span>
                    "{issue.aiAnalysis.citizenNotice}"
                  </div>
                )}
              </div>
            )}

            {/* Community Upvoting & Citizen Priority Endorsement */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Community Impact</h4>
                <p className="text-xs text-slate-500">
                  {issue.upvotes} neighbor{issue.upvotes === 1 ? '' : 's'} have endorsed this repair request.
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => onUpvote(issue.id, e)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  isUpvoted
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white border border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600 shadow-xs'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${isUpvoted ? 'fill-current' : ''}`} />
                <span>{isUpvoted ? 'Endorsed' : 'Upvote Issue'} ({issue.upvotes})</span>
              </button>
            </div>
          </div>

          {/* Right Column (5 cols): Status Stepper, Dispatch Controls, Updates, Comments */}
          <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
            
            {/* Resolution Lifecycle Stepper */}
            <div className="p-4 sm:p-5 bg-slate-50 rounded-3xl border border-slate-200/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Resolution Lifecycle
              </h4>

              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {statusSteps.map((step, idx) => {
                  const isDone = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div key={step} className="relative flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-colors ${
                        isDone 
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' 
                          : 'bg-white text-slate-400 border border-slate-300'
                      }`}>
                        {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </div>

                      <div className="flex-1 flex items-center justify-between text-xs">
                        <span className={`font-semibold ${
                          isCurrent ? 'text-blue-600 font-bold' : isDone ? 'text-slate-800' : 'text-slate-400'
                        }`}>
                          {step}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                            Current Stage
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 text-xs flex items-center justify-between text-slate-500">
                <span>Assigned Agency:</span>
                <span className="font-semibold text-slate-800 text-right truncate max-w-[180px]">
                  {issue.department}
                </span>
              </div>
            </div>

            {/* Municipal Official Dispatch Console (if official mode is on or citizen wants to test dispatch actions) */}
            <div className="p-4 bg-indigo-50/70 border border-indigo-200/90 rounded-3xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <HardHat className="w-4 h-4 text-indigo-700" />
                  Municipal Dispatch Console
                </span>
                <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                  {userRole === 'official' ? 'Inspector Mode' : 'Interactive Demo'}
                </span>
              </div>

              <form onSubmit={handleOfficialStatusSubmit} className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Advance Issue Status:
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as IssueStatus)}
                    className="w-full px-3 py-1.5 rounded-xl border border-indigo-200 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="Submitted">Submitted (Under Review)</option>
                    <option value="AI Triaged">AI Triaged (Department routed)</option>
                    <option value="Assigned">Assigned (Field Inspector)</option>
                    <option value="In Progress">In Progress (Work Crew On-site)</option>
                    <option value="Resolved">Resolved (Repairs Verified)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Crew / Inspector Log Note:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Completed asphalt compaction pass at 14:00"
                    value={officialNote}
                    onChange={(e) => setOfficialNote(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-indigo-200 text-xs bg-white"
                  />
                </div>

                <label className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generateAiNotice}
                    onChange={(e) => setGenerateAiNotice(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>AI auto-generate public municipal announcement</span>
                </label>

                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isUpdatingStatus ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5" />
                  )}
                  <span>Post Status Update</span>
                </button>
              </form>
            </div>

            {/* Activity Updates Timeline */}
            <div className="p-4 bg-slate-50 rounded-3xl border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Official Municipal Log ({issue.updates?.length || 0})
              </h4>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {issue.updates?.map((u) => (
                  <div key={u.id} className="text-xs p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-semibold text-slate-800">{u.author} ({u.role})</span>
                      <span>{new Date(u.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-700 leading-snug">{u.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Citizen Comments Discussion Thread */}
            <div className="p-4 bg-white rounded-3xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Community Discussion ({issue.comments?.length || 0})
              </h4>

              {/* Comments List */}
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {(!issue.comments || issue.comments.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">No community comments yet. Be the first to chime in.</p>
                ) : (
                  issue.comments.map((c) => (
                    <div key={c.id} className="text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-0.5">
                        <span className="font-bold text-slate-800">{c.author}</span>
                        <span className="text-[10px]">{new Date(c.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-700">{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment input */}
              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Leave an eyewitness update or feedback..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="submit"
                  disabled={isSendingComment || !commentText.trim()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {isSendingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
