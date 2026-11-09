import React, { useState } from 'react';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw,
  UserCheck,
  User,
  AlertCircle
} from 'lucide-react';
import { QuickStats } from '../components/QuickStats';
import { RentalCard } from '../components/RentalCard';

export function Dashboard({
  rentals = [],
  isLoading = false,
  onRefresh = () => {},
  onSelectRental = () => {},
  onNewRental = () => {},
  userRole = 'owner',
  setUserRole = () => {},
  systemStatus
}) {
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL', 'REVIEW', 'ACTIVE', 'SETTLED'
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRentals = rentals.filter((r) => {
    // Tab filter
    if (filterTab === 'REVIEW' && !['INSPECTED', 'OWNER_REVIEW'].includes(r.status)) {
      return false;
    }
    if (filterTab === 'ACTIVE' && !['AUTHORIZED', 'ACTIVE', 'RETURNED'].includes(r.status)) {
      return false;
    }
    if (filterTab === 'SETTLED' && r.status !== 'SETTLED') {
      return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.item_name?.toLowerCase().includes(q);
      const matchRenter = r.renter_name?.toLowerCase().includes(q);
      const matchOwner = r.owner_name?.toLowerCase().includes(q);
      const matchCat = r.category?.toLowerCase().includes(q);
      return matchName || matchRenter || matchOwner || matchCat;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      
      {/* Top Banner: Current Role & Mode */}
      <div className="mb-8 p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-500 p-0.5 shadow-lg shadow-brand-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              {userRole === 'owner' ? (
                <UserCheck className="w-6 h-6 text-brand-400" />
              ) : (
                <User className="w-6 h-6 text-emerald-400" />
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                {userRole === 'owner' ? 'Owner Management Portal' : 'Renter Protection Dashboard'}
              </h2>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                userRole === 'owner'
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {userRole === 'owner' ? 'Owner View' : 'Renter View'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {userRole === 'owner' 
                ? 'Review AI-detected damage, adjust deductions, and execute authorized PayPal settlements.'
                : 'Inspect transparent condition receipts, review security deposit returns, or register dispute.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setUserRole(userRole === 'owner' ? 'renter' : 'owner')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            Switch to {userRole === 'owner' ? 'Renter View' : 'Owner View'}
          </button>
          <button
            onClick={onNewRental}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4 text-emerald-300" />
            + Authorize New Rental
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <QuickStats rentals={rentals} />

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        
        {/* Filter Tabs */}
        <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterTab === 'ALL'
                ? 'bg-brand-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Agreements ({rentals.length})
          </button>
          <button
            onClick={() => setFilterTab('REVIEW')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterTab === 'REVIEW'
                ? 'bg-brand-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Needs Review ({rentals.filter(r => ['INSPECTED', 'OWNER_REVIEW'].includes(r.status)).length})
          </button>
          <button
            onClick={() => setFilterTab('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterTab === 'ACTIVE'
                ? 'bg-brand-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Escrow ({rentals.filter(r => ['AUTHORIZED', 'ACTIVE', 'RETURNED'].includes(r.status)).length})
          </button>
          <button
            onClick={() => setFilterTab('SETTLED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterTab === 'SETTLED'
                ? 'bg-brand-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Settled ({rentals.filter(r => r.status === 'SETTLED').length})
          </button>
        </div>

        {/* Search Input & Refresh */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gear or names..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Refresh contracts"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-400' : ''}`} />
          </button>
        </div>

      </div>

      {/* Rentals Grid */}
      {filteredRentals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRentals.map((rental) => (
            <RentalCard
              key={rental.id}
              rental={rental}
              onSelect={onSelectRental}
              userRole={userRole}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl">
          <ShieldCheck className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-300 mb-1">No agreements found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {searchQuery 
              ? 'No rental agreements matched your search query.' 
              : 'Create a new rental to authorize a deposit and test the AI inspection flow.'}
          </p>
          <button
            onClick={onNewRental}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-lg transition-colors"
          >
            + Authorize New Rental
          </button>
        </div>
      )}

    </div>
  );
}
