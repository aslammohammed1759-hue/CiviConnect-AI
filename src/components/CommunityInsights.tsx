import React from 'react';
import { CivicIssue, AnalyticsData } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  Zap, 
  ThumbsUp,
  Building,
  Users
} from 'lucide-react';

interface CommunityInsightsProps {
  issues: CivicIssue[];
  analytics: AnalyticsData | null;
  onSelectIssue: (issue: CivicIssue) => void;
}

export const CommunityInsights: React.FC<CommunityInsightsProps> = ({
  issues,
  analytics,
  onSelectIssue,
}) => {
  // Neighborhood resolution scorecards
  const neighborhoodData: Record<string, { total: number; resolved: number; inProgress: number }> = {};

  issues.forEach(issue => {
    const nh = issue.location.neighborhood || 'Metro Core';
    if (!neighborhoodData[nh]) {
      neighborhoodData[nh] = { total: 0, resolved: 0, inProgress: 0 };
    }
    neighborhoodData[nh].total += 1;
    if (issue.status === 'Resolved') neighborhoodData[nh].resolved += 1;
    if (issue.status === 'In Progress') neighborhoodData[nh].inProgress += 1;
  });

  // Top endorsed civic issues
  const topEndorsedIssues = [...issues].sort((a, b) => b.upvotes - a.upvotes).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-3">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Civic Transparency & Public Accountability</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Community Performance & Resolution Benchmarks
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Real-time municipal response metrics, neighborhood health scores, and citizen-endorsed civic priorities.
          </p>
        </div>
      </div>

      {/* Grid: Neighborhood Scorecards & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Neighborhood Scorecard */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Neighborhood Resolution Index
            </h3>
            <span className="text-xs text-slate-500 font-medium">SLA Tracking</span>
          </div>

          <div className="space-y-4">
            {Object.entries(neighborhoodData).map(([nh, stats]) => {
              const resolveRate = Math.round((stats.resolved / stats.total) * 100);
              return (
                <div key={nh} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-slate-800 text-sm">{nh}</span>
                    <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {resolveRate}% Resolved
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${(stats.resolved / stats.total) * 100}%` }}
                      title="Resolved"
                    />
                    <div
                      className="bg-amber-500 h-full"
                      style={{ width: `${(stats.inProgress / stats.total) * 100}%` }}
                      title="In Progress"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span>{stats.total} total reports</span>
                    <span className="text-amber-700 font-medium">{stats.inProgress} active repairs</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              Incident Frequency by Category
            </h3>
            <span className="text-xs text-slate-500 font-medium">Last 30 Days</span>
          </div>

          <div className="space-y-3.5">
            {Object.entries(analytics?.categoryCounts || {}).map(([cat, count]) => {
              const percent = Math.round((count / (analytics?.metrics.total || 1)) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>{cat}</span>
                    <span className="text-slate-900 font-bold">{count} incident{count > 1 ? 's' : ''} ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Automated Triage Throughput note */}
          <div className="mt-6 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Intelligent Triage SLA Impact:</strong>
              Average municipal triage turnaround reduced from 48 hours to under 30 seconds via automated department routing and severity scoring.
            </div>
          </div>
        </div>
      </div>

      {/* Top Citizen-Endorsed Issues Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          Top Citizen-Endorsed Civic Priorities
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topEndorsedIssues.map(issue => (
            <div
              key={issue.id}
              onClick={() => onSelectIssue(issue)}
              className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono text-[10px] text-slate-500 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                    {issue.trackingNumber}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                    <ThumbsUp className="w-3 h-3 fill-current" />
                    {issue.upvotes}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug">
                  {issue.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {issue.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-700">{issue.category}</span>
                <span className="font-bold text-blue-600">{issue.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
