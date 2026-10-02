import React, { useState } from 'react';
import { IssueCategory, IssueUrgency } from '../types';
import { 
  X, 
  Sparkles, 
  MapPin, 
  Camera, 
  AlertTriangle, 
  Check, 
  Loader2, 
  ShieldCheck, 
  Building2,
  HelpCircle,
  Upload
} from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

const SAMPLE_TEMPLATES = [
  {
    label: 'Deep Pothole',
    category: 'Pothole & Roads' as IssueCategory,
    title: 'Severe crater pothole on 9th Ave causing tire ruptures',
    description: 'A 12-inch wide and 8-inch deep pothole has eroded through the top asphalt layer. Multiple cars have swerved onto the sidewalk curb to avoid it.',
    urgency: 'High' as IssueUrgency,
    neighborhood: 'Maple Heights',
    address: '540 9th Avenue, near Elm Intersection',
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
  },
  {
    label: 'Fallen Tree Branch',
    category: 'Parks & Greenery' as IssueCategory,
    title: 'Heavy oak limb snapped and blocking eastbound bike lane',
    description: 'A large tree branch broke during high winds and is lying diagonally across the bike lane and sidewalk, forcing cyclists into vehicular lanes.',
    urgency: 'High' as IssueUrgency,
    neighborhood: 'Sunset Hills',
    address: '1420 Sunset Boulevard',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80'
  },
  {
    label: 'Water Main Leak',
    category: 'Water & Drainage' as IssueCategory,
    title: 'Pressurized water gusher from severed underground pipe',
    description: 'High pressure water is shooting 2 feet in the air and eroding the soil beneath the sidewalk. Local water pressure has dropped significantly.',
    urgency: 'Emergency' as IssueUrgency,
    neighborhood: 'Marina Heights',
    address: '710 Marina Promenade',
    image: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'
  },
  {
    label: 'Street Lamp Outage',
    category: 'Street Lighting' as IssueCategory,
    title: 'Dark zone caused by 3 unlit sodium vapor fixtures',
    description: 'The streetlamps along the pedestrian walkway connecting the transit station to the residential plaza have been completely dark for two consecutive nights.',
    urgency: 'Medium' as IssueUrgency,
    neighborhood: 'Downtown Arts Corridor',
    address: '320 Station Way',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80'
  }
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('Pothole & Roads');
  const [urgency, setUrgency] = useState<IssueUrgency>('Medium');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('Downtown Civic Core');
  const [imageUrl, setImageUrl] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');

  // AI Triage preview state
  const [isTriaging, setIsTriaging] = useState(false);
  const [aiPreview, setAiPreview] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const categories: IssueCategory[] = [
    'Pothole & Roads',
    'Street Lighting',
    'Waste & Sanitation',
    'Water & Drainage',
    'Parks & Greenery',
    'Traffic & Signals',
    'Graffiti & Vandalism',
    'Public Safety'
  ];

  const neighborhoods = [
    'Downtown Civic Core',
    'Maple Heights',
    'Downtown Arts Corridor',
    'Marina Heights',
    'Sunset Hills',
    'Industrial Harbor District',
    'Mission Bay West'
  ];

  const handleApplyTemplate = (tpl: typeof SAMPLE_TEMPLATES[0]) => {
    setTitle(tpl.title);
    setDescription(tpl.description);
    setCategory(tpl.category);
    setUrgency(tpl.urgency);
    setNeighborhood(tpl.neighborhood);
    setAddress(tpl.address);
    setImageUrl(tpl.image);
    setAiPreview(null);
  };

  const handleRunAiTriage = async () => {
    if (!title || !description) {
      setErrorMsg('Please enter both a title and description to run AI triage.');
      return;
    }
    setErrorMsg('');
    setIsTriaging(true);
    try {
      const res = await fetch('/api/triage-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          urgency,
          location: `${address}, ${neighborhood}`
        })
      });
      const data = await res.json();
      if (data.triage) {
        setAiPreview(data.triage);
        if (data.triage.category) setCategory(data.triage.category);
        if (data.triage.urgency) setUrgency(data.triage.urgency);
      }
    } catch (err) {
      console.error('Triage failed:', err);
    } finally {
      setIsTriaging(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please provide a title and detailed description.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          urgency,
          location: {
            address: address || 'Main Thoroughfare',
            neighborhood,
            lat: 37.7749 + (Math.random() - 0.5) * 0.04,
            lng: -122.4194 + (Math.random() - 0.5) * 0.04
          },
          reporter: {
            name: isAnonymous ? 'Anonymous Citizen' : (reporterName || 'Concerned Resident'),
            email: isAnonymous ? 'anonymous@civiconnect.local' : (reporterEmail || 'resident@city.org'),
            isAnonymous
          },
          imageUrl: imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
        })
      });

      if (!res.ok) {
        throw new Error('Failed to submit report');
      }

      onSubmitSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during report submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Report a Community Issue
              </h2>
              <p className="text-xs text-slate-500">
                AI-powered classification & instant department dispatch
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Fill Sample Templates */}
        <div className="px-5 sm:px-6 py-2.5 bg-blue-50/50 border-b border-blue-100/70 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-semibold text-blue-900 shrink-0">Sample Reports:</span>
          {SAMPLE_TEMPLATES.map((tpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleApplyTemplate(tpl)}
              className="text-xs px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 font-medium whitespace-nowrap transition-all shadow-xs"
            >
              {tpl.label}
            </button>
          ))}
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Issue Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Issue Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Hazardous pothole at Oak & 4th Avenue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Detailed Description *
              </label>
              <button
                type="button"
                onClick={handleRunAiTriage}
                disabled={isTriaging || !title || !description}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors"
              >
                {isTriaging ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Run AI Triage Check</span>
              </button>
            </div>
            <textarea
              required
              rows={3}
              placeholder="Describe the issue size, hazard level, how long it has been present, and any immediate traffic or safety consequences..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm leading-relaxed"
            />
          </div>

          {/* AI Triage Preview Card if generated */}
          {aiPreview && (
            <div className="bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-sky-50/70 border border-blue-200/90 rounded-2xl p-4 space-y-2.5 shadow-sm animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  AI Triage Diagnostic Result
                </span>
                <span className="text-xs font-bold text-slate-700">
                  Confidence: {aiPreview.triageConfidence}%
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                <div className="bg-white/80 p-2 rounded-xl border border-blue-100">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Routing Dept</span>
                  <span className="font-bold text-slate-900 line-clamp-1">{aiPreview.department}</span>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-blue-100">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Severity Score</span>
                  <span className="font-bold text-red-600">{aiPreview.severityScore}/10 Priority</span>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-blue-100 col-span-2 sm:col-span-1">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Target SLA</span>
                  <span className="font-bold text-blue-700">{aiPreview.estimatedResolutionDays} Business Day(s)</span>
                </div>
              </div>

              {aiPreview.hazards && aiPreview.hazards.length > 0 && (
                <div className="text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Safety Hazards: </span>
                  {aiPreview.hazards.join(' • ')}
                </div>
              )}

              {aiPreview.citizenNotice && (
                <div className="text-xs text-blue-800 bg-blue-100/60 p-2.5 rounded-xl italic">
                  "{aiPreview.citizenNotice}"
                </div>
              )}
            </div>
          )}

          {/* Category & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IssueCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm font-medium bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Urgency Level
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as IssueUrgency)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm font-medium bg-white"
              >
                <option value="Low">Low - Cosmetic or non-urgent</option>
                <option value="Medium">Medium - Normal neighborhood maintenance</option>
                <option value="High">High - Active traffic or pedestrian hazard</option>
                <option value="Emergency">Emergency - Immediate physical danger or utility failure</option>
              </select>
            </div>
          </div>

          {/* Location Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Neighborhood Zone
              </label>
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm font-medium bg-white"
              >
                {neighborhoods.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Exact Street / Cross Street
              </label>
              <input
                type="text"
                placeholder="e.g. 412 Oak Street, at 4th Ave"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm font-medium"
              />
            </div>
          </div>

          {/* Photo URL or preset preview */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Incident Photo (URL or presets)
            </label>
            <input
              type="url"
              placeholder="https://... or choose from sample preset"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono mb-2"
            />
            {imageUrl && (
              <div className="relative h-28 w-44 rounded-xl overflow-hidden border border-slate-200">
                <img src={imageUrl} alt="Incident preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Anonymous toggle and citizen credentials */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-700">
                Submit anonymously (hide your personal identity from public board)
              </span>
            </label>

            {!isAnonymous && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <input
                  type="text"
                  placeholder="Your Name (e.g. Jane Doe)"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
                <input
                  type="email"
                  placeholder="Notification Email (for status alerts)"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 active:scale-98 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting & Triaging...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
