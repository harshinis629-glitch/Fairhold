import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { RentalDetail } from './pages/RentalDetail';
import { NewRental } from './pages/NewRental';
import { AiInspector } from './pages/AiInspector';
import { fetchRentals, fetchSystemStatus } from './services/api';
import { ShieldCheck, Heart, Sparkles, CreditCard } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard'); // 'dashboard', 'detail', 'new-rental', 'inspector'
  const [selectedRentalId, setSelectedRentalId] = useState(null);
  const [userRole, setUserRole] = useState('owner'); // 'owner' or 'renter'
  
  const [rentals, setRentals] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [rData, sData] = await Promise.all([
        fetchRentals().catch(() => []),
        fetchSystemStatus().catch(() => null)
      ]);
      setRentals(rData);
      setSystemStatus(sData);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRental = (id) => {
    setSelectedRentalId(id);
    setCurrentTab('detail');
  };

  const handleRentalCreated = (id) => {
    loadInitialData();
    setSelectedRentalId(id);
    setCurrentTab('detail');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userRole={userRole}
        setUserRole={setUserRole}
        systemStatus={systemStatus}
      />

      {/* Main Body */}
      <main className="flex-1">
        {currentTab === 'dashboard' && (
          <Dashboard
            rentals={rentals}
            isLoading={loading}
            onRefresh={loadInitialData}
            onSelectRental={handleSelectRental}
            onNewRental={() => setCurrentTab('new-rental')}
            userRole={userRole}
            setUserRole={setUserRole}
            systemStatus={systemStatus}
          />
        )}

        {currentTab === 'detail' && selectedRentalId && (
          <RentalDetail
            rentalId={selectedRentalId}
            onBack={() => {
              loadInitialData();
              setCurrentTab('dashboard');
            }}
            userRole={userRole}
            systemStatus={systemStatus}
          />
        )}

        {currentTab === 'new-rental' && (
          <NewRental
            onBack={() => setCurrentTab('dashboard')}
            onRentalCreated={handleRentalCreated}
          />
        )}

        {currentTab === 'inspector' && (
          <AiInspector
            systemStatus={systemStatus}
            onCreateContractWithFindings={(item, cat) => {
              setCurrentTab('new-rental');
            }}
          />
        )}
      </main>

      {/* Modern Fintech Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
              F
            </div>
            <span className="font-bold text-slate-300">Fairhold</span>
            <span>— AI-Powered Rental Deposit Protection Engine</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Gemini Vision
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-brand-400" />
              PayPal Sandbox REST
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              SQLite Escrow
            </span>
          </div>

          <p className="text-slate-600 text-[11px]">
            Demo-ready MVP &copy; {new Date().getFullYear()} Fairhold Technologies.
          </p>
        </div>
      </footer>

    </div>
  );
}
