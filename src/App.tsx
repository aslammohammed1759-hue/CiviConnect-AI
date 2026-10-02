import React, { useState, useEffect } from 'react';
import { 
  CivicIssue, 
  IssueCategory, 
  IssueStatus, 
  IssueUrgency, 
  AnalyticsData 
} from './types';
import { Navbar } from './components/Navbar';
import { IssueCard } from './components/IssueCard';
import { CivicMap } from './components/CivicMap';
import { ReportModal } from './components/ReportModal';
import { IssueDetailModal } from './components/IssueDetailModal';
import { CityDashboard } from './components/CityDashboard';
import { CommunityInsights } from './components/CommunityInsights';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  PlusCircle, 
  AlertTriangle, 
  Layers, 
  CheckCircle2, 
  TrendingUp, 
  MapPin, 
  Sparkles,
  Building2,
  HardHat,
  ChevronDown
} from 'lucide-react';

export function App() {
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'feed' | 'map' | 'dispatch' | 'analytics'>('feed');

  // Role toggle: citizen vs municipal official
  const [userRole, setUserRole] = useState<'citizen' | 'official'>('citizen');

  // Modals
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Upvoted IDs set
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('civic_upvoted_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set(['iss-101', 'iss-103']);
    } catch {
      return new Set(['iss-101', 'iss-103']);
    }
  });

  // Feed Filter & Search Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'upvotes' | 'severity'>('newest');

  // Load issues and analytics from backend
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [issuesRes, analyticsRes] = await Promise.all([
        fetch('/api/issues'),
        fetch('/api/analytics')
      ]);

      if (!issuesRes.ok) throw new Error('Failed to load civic issues');
      const issuesData = await issuesRes.json();
      setIssues(issuesData.issues || []);

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to municipal dispatch server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save upvotes in localStorage
  const handleUpvote = async (issueId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/issues/${issueId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'current-user-device' })
      });

      if (!res.ok) throw new Error('Upvote failed');
      const data = await res.json();

      setUpvotedIds(prev => {
        const next = new Set(prev);
        if (data.upvoted) {
          next.add(issueId);
        } else {
          next.delete(issueId);
        }
        localStorage.setItem('civic_upvoted_ids', JSON.stringify(Array.from(next)));
        return next;
      });

      // Update in state
      setIssues(prev => prev.map(item => item.id === issueId ? data.issue : item));
      if (selectedIssue?.id === issueId) {
        setSelectedIssue(data.issue);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Status Change by Municipal Official
  const handleStatusChange = async (
    issueId: string,
    newStatus: IssueStatus,
    note?: string,
    generateAi?: boolean
  ) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          note,
          generateAiStatement: generateAi,
          author: userRole === 'official' ? 'Inspector Henderson' : 'Municipal Dispatch'
        })
      });

      if (!res.ok) throw new Error('Failed to update status');
      const data = await res.json();

      setIssues(prev => prev.map(item => item.id === issueId ? data.issue : item));
      if (selectedIssue?.id === issueId) {
        setSelectedIssue(data.issue);
      }
      // Refresh analytics
      fetch('/api/analytics').then(r => r.json()).then(d => setAnalytics(d));
    } catch (err) {
      console.error(err);
    }
  };

  // Add Comment to an issue
  const handleAddComment = async (issueId: string, text: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: userRole === 'official' ? 'City Field Dispatch' : 'Local Resident',
          role: userRole === 'official' ? 'Department Inspector' : 'Citizen',
          text
        })
      });

      if (!res.ok) throw new Error('Failed to add comment');
      const data = await res.json();

      setIssues(prev => prev.map(item => item.id === issueId ? data.issue : item));
      if (selectedIssue?.id === issueId) {
        setSelectedIssue(data.issue);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Quick Status change directly from Dashboard table
  const handleQuickStatusChange = (issueId: string, status: IssueStatus) => {
    handleStatusChange(issueId, status, `Quick status set to ${status}`, false);
  };

  // Filter and Sort issues for Feed
  const filteredIssues = issues.filter(issue => {
    if (selectedCategory !== 'All' && issue.category !== selectedCategory) return false;
    if (selectedStatus !== 'All' && issue.status !== selectedStatus) return false;
    if (selectedUrgency !== 'All' && issue.urgency !== selectedUrgency) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        issue.title.toLowerCase().includes(q) ||
        issue.description.toLowerCase().includes(q) ||
        issue.trackingNumber.toLowerCase().includes(q) ||
        issue.location.address.toLowerCase().includes(q) ||
        issue.location.neighborhood.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  filteredIssues.sort((a, b) => {
    if (sortBy === 'upvotes') return b.upvotes - a.upvotes;
    if (sortBy === 'severity') return b.severityScore - a.severityScore;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const emergencyCount = issues.filter(i => i.urgency === 'Emergency' && i.status !== 'Resolved').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        emergencyCount={emergencyCount}
        userRole={userRole}
        setUserRole={setUserRole}
      />

      {/* Main Body Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* TAB 1: ISSUES FEED */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            
            {/* Hero Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="max-w-2xl relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold mb-3 border border-white/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Powered by CiviConnect Smart City AI</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                  Report, Track, and Resolve Neighborhood Issues Together
                </h1>
                <p className="mt-2.5 text-sm sm:text-base text-blue-100 leading-relaxed">
                  Join neighbors in flagging potholes, hazardous traffic signals, street lighting, and utility outages. Every report is automatically triaged by AI and routed directly to city public works crews.
                </p>

                <div className="mt-5 flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-black/10 active:scale-98 transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Report a Community Issue</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('map')}
                    className="inline-flex items-center gap-2 bg-blue-800/60 hover:bg-blue-800/80 text-white border border-white/30 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Explore Civic Map</span>
                  </button>
                </div>
              </div>

              {/* Decorative background circle */}
              <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-96 h-96 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* Filter, Search & Controls Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search Field */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by neighborhood, street name, tracking #, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium transition-all"
                  />
                </div>

                {/* Dropdown Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="All">All Categories</option>
                    <option value="Pothole & Roads">Pothole & Roads</option>
                    <option value="Street Lighting">Street Lighting</option>
                    <option value="Waste & Sanitation">Waste & Sanitation</option>
                    <option value="Water & Drainage">Water & Drainage</option>
                    <option value="Parks & Greenery">Parks & Greenery</option>
                    <option value="Traffic & Signals">Traffic & Signals</option>
                    <option value="Graffiti & Vandalism">Graffiti & Vandalism</option>
                    <option value="Public Safety">Public Safety</option>
                  </select>

                  <select
                    value={selectedUrgency}
                    onChange={(e) => setSelectedUrgency(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="All">All Urgency</option>
                    <option value="Emergency">🚨 Emergency Only</option>
                    <option value="High">High Urgency</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="newest">Sort: Newest First</option>
                    <option value="upvotes">Sort: Most Upvoted</option>
                    <option value="severity">Sort: Highest Severity</option>
                  </select>
                </div>
              </div>

              {/* Status Chips */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs flex-wrap gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                  <span className="text-slate-400 font-semibold mr-1">Status:</span>
                  {['All', 'Submitted', 'AI Triaged', 'Assigned', 'In Progress', 'Resolved'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setSelectedStatus(st)}
                      className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
                        selectedStatus === st
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="text-slate-500 font-medium">
                  Showing <strong>{filteredIssues.length}</strong> of {issues.length} incidents
                </div>
              </div>
            </div>

            {/* Issues Grid */}
            {loading ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-600">Loading civic incident feed...</p>
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <Filter className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">No issues match current filters</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try clearing your search query or switching categories to view other reports.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedStatus('All');
                    setSelectedUrgency('All');
                    setSearchQuery('');
                  }}
                  className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredIssues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onSelect={(iss) => setSelectedIssue(iss)}
                    onUpvote={(id, e) => handleUpvote(id, e)}
                    isUpvoted={upvotedIds.has(issue.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INTERACTIVE CIVIC MAP */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <CivicMap
              issues={issues}
              onSelectIssue={(iss) => setSelectedIssue(iss)}
              onUpvote={(id, e) => handleUpvote(id, e)}
              upvotedIds={upvotedIds}
            />
          </div>
        )}

        {/* TAB 3: CITY OPS & DISPATCH */}
        {activeTab === 'dispatch' && (
          <CityDashboard
            issues={issues}
            analytics={analytics}
            onSelectIssue={(iss) => setSelectedIssue(iss)}
            onQuickStatusChange={handleQuickStatusChange}
          />
        )}

        {/* TAB 4: CIVIC ANALYTICS & COMMUNITY INSIGHTS */}
        {activeTab === 'analytics' && (
          <CommunityInsights
            issues={issues}
            analytics={analytics}
            onSelectIssue={(iss) => setSelectedIssue(iss)}
          />
        )}
      </main>

      {/* Floating Action Button for Mobile or Quick Reporting */}
      <button
        onClick={() => setIsReportModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 rounded-2xl shadow-xl shadow-blue-500/30 active:scale-95 transition-all flex items-center gap-2 group sm:hidden"
        title="Report New Civic Issue"
      >
        <PlusCircle className="w-6 h-6" />
        <span className="text-xs font-bold">Report</span>
      </button>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitSuccess={() => {
          loadData();
        }}
      />

      {/* Issue Detail & Inspection Modal */}
      <IssueDetailModal
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
        onUpvote={(id, e) => handleUpvote(id, e)}
        isUpvoted={selectedIssue ? upvotedIds.has(selectedIssue.id) : false}
        onStatusChange={handleStatusChange}
        onAddComment={handleAddComment}
        userRole={userRole}
      />

      {/* Platform Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-800">CiviConnect-AI</span>
            <span>— Smart Municipal Governance & Community Engagement Platform</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 text-[11px]">
            <span>Municipal Dispatch SLA: 24h</span>
            <span>•</span>
            <span>Real-time AI Department Routing</span>
            <span>•</span>
            <span className="font-semibold text-emerald-600">All Systems Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
