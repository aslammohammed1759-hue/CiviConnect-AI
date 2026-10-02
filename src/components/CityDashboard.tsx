import React, { useState } from 'react';
import { CivicIssue, IssueStatus, AnalyticsData } from '../types';
import { 
  Building2, 
  HardHat, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Filter, 
  ArrowUpDown, 
  Search,
  ExternalLink,
  Zap,
  TrendingUp,
  Download
} from 'lucide-react';

interface CityDashboardProps {
  issues: CivicIssue[];
  analytics: AnalyticsData | null;
  onSelectIssue: (issue: CivicIssue) => void;
  onQuickStatusChange: (issueId: string, status: IssueStatus) => void;
}

export const CityDashboard: React.FC<CityDashboardProps> = ({
  issues,
  analytics,
  onSelectIssue,
  onQuickStatusChange,
}) => {
  const [filterDepartment, setFilterDepartment] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const departments = [
    'All',
    'Department of Public Works - Asphalt Division',
    'Bureau of Street Lighting & Electrical',
    'Sanitation & Environmental Code Enforcement',
    'Municipal Water & Sewer Authority',
    'Parks & Recreation Facilities Maintenance',
    'Department of Transportation - Traffic Operations'
  ];

  const filteredIssues = issues.filter(issue => {
    if (filterDepartment !== 'All' && !issue.department.includes(filterDepartment.split(' - ')[0])) {
      return false;
    }
    if (filterStatus !== 'All' && issue.status !== filterStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        issue.title.toLowerCase().includes(q) ||
        issue.trackingNumber.toLowerCase().includes(q) ||
        issue.location.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportCsv = () => {
    const headers = ['Tracking Number', 'Title', 'Category', 'Urgency', 'Severity', 'Department', 'Status', 'Upvotes', 'Address'];
    const rows = filteredIssues.map(i => [
      i.trackingNumber,
      `"${i.title.replace(/"/g, '""')}"`,
      i.category,
      i.urgency,
      i.severityScore,
      `"${i.department}"`,
      i.status,
      i.upvotes,
      `"${i.location.address}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CiviConnect_Dispatch_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-3">
            <HardHat className="w-3.5 h-3.5" />
            <span>Municipal Dispatch & Operations Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            City Agency Work Orders & Real-time Triage
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Monitor incoming civic reports, oversee AI triage routing, prioritize emergency repairs, and dispatch public works crews across municipal departments.
          </p>
        </div>

        {/* Decorative Grid Lines */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-600/10 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Reports</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {analytics?.metrics.total || issues.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across 7 municipal sectors
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            {issues.filter(i => i.status === 'In Progress').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Active crews on site
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Emergency SLA</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-600">
            {issues.filter(i => i.urgency === 'Emergency' && i.status !== 'Resolved').length}
          </div>
          <div className="text-[11px] text-red-600 font-medium mt-1">
            Immediate dispatch required
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            {issues.filter(i => i.status === 'Resolved').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Avg SLA: {analytics?.metrics.avgResolutionDays || 2.4} days
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Accuracy</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-600">
            {analytics?.metrics.aiTriageAccuracy || '95.8%'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Auto-routing precision
          </div>
        </div>
      </div>

      {/* Department Workload Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          Municipal Agency Workload Allocation
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(analytics?.departmentCounts || {}).map(([dept, count]) => {
            const percentage = Math.round((count / (analytics?.metrics.total || 1)) * 100);
            return (
              <div key={dept} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-800 line-clamp-1">{dept}</span>
                  <span className="text-xs font-black text-blue-600 shrink-0">{count} tickets</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full"
                    style={{ width: `${Math.max(percentage, 10)}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1.5 flex justify-between">
                  <span>{percentage}% of active city tickets</span>
                  <span className="text-blue-700 font-semibold">Priority Queue</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Work Orders Table Header & Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Active Municipal Work Orders</h3>
            <p className="text-xs text-slate-500">Filter, reassign, and advance ticket statuses in real time</p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ticket # or street..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white w-48 sm:w-60 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Department Filter */}
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white font-medium focus:outline-none"
            >
              <option value="All">All Departments</option>
              {departments.filter(d => d !== 'All').map(d => (
                <option key={d} value={d}>{d.split(' - ')[0]}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white font-medium focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="AI Triaged">AI Triaged</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            {/* Export CSV button */}
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Issue & Location</th>
                <th className="py-3 px-4">Urgency / Severity</th>
                <th className="py-3 px-4">Target Department</th>
                <th className="py-3 px-4">Status & Quick Action</th>
                <th className="py-3 px-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredIssues.map((issue) => (
                <tr key={issue.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                    {issue.trackingNumber}
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-bold text-slate-900 truncate">{issue.title}</div>
                    <div className="text-[11px] text-slate-500 truncate">{issue.location.address}</div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      issue.urgency === 'Emergency' ? 'bg-red-100 text-red-700' :
                      issue.urgency === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {issue.urgency} ({issue.severityScore}/10)
                    </span>
                  </td>

                  <td className="py-3.5 px-4 max-w-[200px] truncate text-[11px] text-slate-700">
                    {issue.department}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <select
                      value={issue.status}
                      onChange={(e) => onQuickStatusChange(issue.id, e.target.value as IssueStatus)}
                      className={`text-xs font-bold px-2 py-1 rounded-lg border focus:outline-none ${
                        issue.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                        issue.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                        issue.status === 'Assigned' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                        'bg-purple-50 text-purple-700 border-purple-300'
                      }`}
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="AI Triaged">AI Triaged</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => onSelectIssue(issue)}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold text-xs"
                    >
                      <span>Inspect</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
