import React, { useState } from 'react';
import { CivicIssue, IssueCategory } from '../types';
import { 
  MapPin, 
  Layers, 
  Filter, 
  ShieldAlert, 
  Compass, 
  Plus, 
  Minus, 
  Eye, 
  Navigation,
  ThumbsUp,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

interface CivicMapProps {
  issues: CivicIssue[];
  onSelectIssue: (issue: CivicIssue) => void;
  onUpvote: (id: string, e: React.MouseEvent) => void;
  selectedIssueId?: string;
  upvotedIds: Set<string>;
}

export const CivicMap: React.FC<CivicMapProps> = ({
  issues,
  onSelectIssue,
  onUpvote,
  selectedIssueId,
  upvotedIds,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeIssue, setActiveIssue] = useState<CivicIssue | null>(
    issues.find(i => i.id === selectedIssueId) || issues[0] || null
  );

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

  const filteredIssues = issues.filter(issue => {
    if (selectedCategory !== 'All' && issue.category !== selectedCategory) return false;
    return true;
  });

  // Calculate relative map coordinates (normalized between 10% and 90% in bounding box)
  // Base bbox around SF center lat 37.75 - 37.81, lng -122.48 - -122.39
  const getCoordinatesPercent = (lat: number, lng: number) => {
    const minLat = 37.74;
    const maxLat = 37.82;
    const minLng = -122.49;
    const maxLng = -122.38;

    // x is lng (left to right), y is lat (top to bottom reversed)
    const x = Math.max(8, Math.min(92, ((lng - minLng) / (maxLng - minLng)) * 100));
    const y = Math.max(12, Math.min(88, (1 - (lat - minLat) / (maxLat - minLat)) * 100));
    return { x, y };
  };

  const getMarkerColor = (category: IssueCategory, urgency: string) => {
    if (urgency === 'Emergency') return 'bg-red-600 text-white ring-red-300';
    switch (category) {
      case 'Pothole & Roads': return 'bg-amber-600 text-white ring-amber-200';
      case 'Street Lighting': return 'bg-yellow-500 text-slate-900 ring-yellow-200';
      case 'Waste & Sanitation': return 'bg-orange-600 text-white ring-orange-200';
      case 'Water & Drainage': return 'bg-cyan-600 text-white ring-cyan-200';
      case 'Parks & Greenery': return 'bg-emerald-600 text-white ring-emerald-200';
      case 'Traffic & Signals': return 'bg-indigo-600 text-white ring-indigo-200';
      case 'Graffiti & Vandalism': return 'bg-purple-600 text-white ring-purple-200';
      case 'Public Safety': return 'bg-rose-600 text-white ring-rose-200';
      default: return 'bg-blue-600 text-white ring-blue-200';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[750px] relative">
      {/* Map Control Top Bar */}
      <div className="p-4 bg-white/95 backdrop-blur-md border-b border-slate-200 z-10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Metro Civic GIS Grid</h2>
            <p className="text-xs text-slate-500">Live spatial incidents & active municipal work orders</p>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-2xl scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'All'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories ({issues.length})
          </button>
          {categories.map(cat => {
            const count = issues.filter(i => i.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map View Area */}
      <div className="relative flex-1 bg-slate-900 overflow-hidden select-none">
        {/* Stylized Vector Map Canvas Background */}
        <svg className="absolute inset-0 w-full h-full object-cover opacity-90" preserveAspectRatio="none" viewBox="0 0 1000 600">
          <defs>
            <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.4" />
            </pattern>
          </defs>

          {/* Base Terrain Background */}
          <rect width="1000" height="600" fill="url(#waterGrad)" />
          <rect width="1000" height="600" fill="url(#grid)" />

          {/* Harbor Water Body on Top Right */}
          <path d="M 680 0 Q 750 140 820 220 T 1000 320 L 1000 0 Z" fill="#0284c7" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.4" />
          <text x="880" y="80" fill="#7dd3fc" fontSize="12" fontWeight="600" fillOpacity="0.5" letterSpacing="2">EAST BAY HARBOR</text>

          {/* Park / Greenery Zone */}
          <path d="M 120 380 Q 200 320 280 390 T 360 480 Q 250 540 140 500 Z" fill="#059669" fillOpacity="0.18" stroke="#10b981" strokeWidth="1" strokeOpacity="0.4" />
          <text x="170" y="440" fill="#6ee7b7" fontSize="11" fontWeight="600" fillOpacity="0.6">SUNSET COMMUNITY RESERVE</text>

          {/* Major Thoroughfares / Arterials */}
          <path d="M 0 280 Q 400 290 1000 240" fill="none" stroke="#64748b" strokeWidth="4" strokeOpacity="0.6" />
          <text x="50" y="270" fill="#94a3b8" fontSize="10" fontWeight="500">Boulevard Central</text>

          <path d="M 480 0 L 520 600" fill="none" stroke="#64748b" strokeWidth="4" strokeOpacity="0.6" />
          <text x="490" y="580" fill="#94a3b8" fontSize="10" fontWeight="500">4th Ave Corridor</text>

          {/* Secondary streets */}
          <path d="M 220 0 L 220 600" fill="none" stroke="#475569" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="6 3" />
          <path d="M 720 0 L 720 600" fill="none" stroke="#475569" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="6 3" />
          <path d="M 0 140 L 1000 140" fill="none" stroke="#475569" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="6 3" />
          <path d="M 0 440 L 1000 440" fill="none" stroke="#475569" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="6 3" />

          {/* Neighborhood Labels */}
          <text x="520" y="180" fill="#cbd5e1" fontSize="13" fontWeight="700" fillOpacity="0.4" letterSpacing="1">DOWNTOWN CIVIC CORE</text>
          <text x="180" y="160" fill="#cbd5e1" fontSize="12" fontWeight="600" fillOpacity="0.4">MAPLE HEIGHTS</text>
          <text x="760" y="460" fill="#cbd5e1" fontSize="12" fontWeight="600" fillOpacity="0.4">INDUSTRIAL HARBOR</text>
        </svg>

        {/* Map Interactive Zoom Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
          <div className="bg-slate-800/90 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-lg p-1 flex flex-col gap-1 text-slate-300">
            <button 
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 1.8))}
              className="p-1.5 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
              title="Zoom In"
            >
              <Plus className="w-4 h-4" />
            </button>
            <div className="h-px bg-slate-700 my-0.5" />
            <button 
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.8))}
              className="p-1.5 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Issue Markers on Map */}
        <div 
          className="absolute inset-0 transition-transform duration-300 origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {filteredIssues.map((issue) => {
            const { x, y } = getCoordinatesPercent(issue.location.lat, issue.location.lng);
            const isSelected = activeIssue?.id === issue.id;
            const isEmergency = issue.urgency === 'Emergency';

            return (
              <div
                key={issue.id}
                onClick={() => setActiveIssue(issue)}
                style={{ left: `${x}%`, top: `${y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
              >
                {/* Emergency pulsing aura */}
                {isEmergency && (
                  <div className="absolute inset-0 -m-3 rounded-full bg-red-500/40 animate-ping pointer-events-none" />
                )}

                {/* Pin element */}
                <div 
                  className={`relative flex items-center justify-center rounded-full p-2 ring-4 transition-all transform hover:scale-125 shadow-lg ${
                    getMarkerColor(issue.category, issue.urgency)
                  } ${isSelected ? 'scale-125 ring-white ring-offset-2 ring-offset-slate-900' : 'ring-opacity-40'}`}
                >
                  <MapPin className="w-4 h-4" />
                  
                  {/* Severity badge tag */}
                  <span className="absolute -top-2 -right-2 bg-slate-950 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-slate-700">
                    {issue.severityScore}
                  </span>
                </div>

                {/* Tooltip on Hover */}
                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-950/95 backdrop-blur-md text-white text-xs p-2.5 rounded-xl shadow-xl border border-slate-800 pointer-events-none z-30">
                  <div className="font-bold truncate text-slate-100">{issue.title}</div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>{issue.category}</span>
                    <span className="font-semibold text-blue-400">{issue.status}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Issue Preview Card overlay on bottom */}
        {activeIssue && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:w-[420px] z-30 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xl p-4 transition-all">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {activeIssue.trackingNumber}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  activeIssue.urgency === 'Emergency' 
                    ? 'bg-red-100 text-red-700 border border-red-200' 
                    : activeIssue.urgency === 'High' 
                    ? 'bg-orange-100 text-orange-700' 
                    : 'bg-blue-50 text-blue-700'
                }`}>
                  {activeIssue.urgency}
                </span>
              </div>

              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {activeIssue.status}
              </span>
            </div>

            <h4 className="mt-2 text-sm font-bold text-slate-900 line-clamp-1">
              {activeIssue.title}
            </h4>

            <p className="mt-1 text-xs text-slate-600 line-clamp-2">
              {activeIssue.description}
            </p>

            <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-500">
              <Navigation className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{activeIssue.location.address}</span>
            </div>

            {/* AI Action Steps summary */}
            {activeIssue.aiAnalysis && (
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span className="flex items-center gap-1 text-blue-700 font-semibold">
                  <Sparkles className="w-3 h-3" />
                  AI Triage: {activeIssue.department.split('-')[0]}
                </span>
                <span className="font-bold text-slate-700">
                  ETA: ~{activeIssue.estimatedResolutionDays} day(s)
                </span>
              </div>
            )}

            {/* Buttons */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={(e) => onUpvote(activeIssue.id, e)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  upvotedIds.has(activeIssue.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${upvotedIds.has(activeIssue.id) ? 'fill-current' : ''}`} />
                <span>Upvote ({activeIssue.upvotes})</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectIssue(activeIssue)}
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors shadow-sm"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect Full Ticket</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend Bar */}
      <div className="bg-slate-900 text-slate-400 px-4 py-2.5 border-t border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-slate-300">Marker Legend:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 ring-2 ring-red-400" />
            <span>Emergency Hazard</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
            <span>Pothole / Road</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
            <span>Water Main</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span>Street Lighting</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>Parks & Greenery</span>
          </span>
        </div>

        <div className="text-[11px] text-slate-400">
          Showing {filteredIssues.length} geo-tagged incidents
        </div>
      </div>
    </div>
  );
};
