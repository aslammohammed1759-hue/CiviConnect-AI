import React from 'react';
import { 
  Building2, 
  MapPin, 
  BarChart3, 
  PlusCircle, 
  Layers, 
  ShieldAlert, 
  Sparkles,
  UserCheck,
  HardHat
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'feed' | 'map' | 'dispatch' | 'analytics';
  setActiveTab: (tab: 'feed' | 'map' | 'dispatch' | 'analytics') => void;
  onOpenReportModal: () => void;
  emergencyCount: number;
  userRole: 'citizen' | 'official';
  setUserRole: (role: 'citizen' | 'official') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenReportModal,
  emergencyCount,
  userRole,
  setUserRole,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Emergency ticker banner if there are unresolved emergency issues */}
      {emergencyCount > 0 && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4 animate-bounce" />
          <span>
            Notice: {emergencyCount} high-urgency civic alert{emergencyCount > 1 ? 's' : ''} actively under municipal dispatch.
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('feed')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  CiviConnect<span className="text-blue-600">-AI</span>
                </span>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                  <Sparkles className="w-2.5 h-2.5" />
                  Smart Triage
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-none">
                Community Issue Resolution Platform
              </p>
            </div>
          </div>

          {/* Navigation items */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/70">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'feed'
                  ? 'bg-white text-blue-600 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Issues Feed</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'map'
                  ? 'bg-white text-blue-600 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Civic Map</span>
            </button>

            <button
              onClick={() => setActiveTab('dispatch')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dispatch'
                  ? 'bg-white text-blue-600 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <HardHat className="w-4 h-4" />
              <span>City Ops Center</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white text-blue-600 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            {/* Citizen vs City Official Switcher */}
            <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setUserRole('citizen')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                  userRole === 'citizen'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Citizen perspective: submit reports, track neighborhood, upvote"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                Citizen
              </button>
              <button
                onClick={() => setUserRole('official')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                  userRole === 'official'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Municipal Official perspective: manage work orders, assign depts, inspect"
              >
                <HardHat className="w-3.5 h-3.5" />
                Official
              </button>
            </div>

            {/* Report Issue Button */}
            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 active:scale-98 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Issue</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex flex-col items-center gap-0.5 text-xs font-medium py-1 px-3 rounded-lg ${
              activeTab === 'feed' ? 'text-blue-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Feed</span>
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex flex-col items-center gap-0.5 text-xs font-medium py-1 px-3 rounded-lg ${
              activeTab === 'map' ? 'text-blue-600 font-bold' : 'text-slate-500'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Map</span>
          </button>
          <button
            onClick={() => setActiveTab('dispatch')}
            className={`flex flex-col items-center gap-0.5 text-xs font-medium py-1 px-3 rounded-lg ${
              activeTab === 'dispatch' ? 'text-blue-600 font-bold' : 'text-slate-500'
            }`}
          >
            <HardHat className="w-4 h-4" />
            <span>Ops</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center gap-0.5 text-xs font-medium py-1 px-3 rounded-lg ${
              activeTab === 'analytics' ? 'text-blue-600 font-bold' : 'text-slate-500'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Insights</span>
          </button>
        </div>
      </div>
    </header>
  );
};
