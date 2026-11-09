import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  CreditCard, 
  Upload, 
  Sparkles, 
  Check, 
  RefreshCw,
  Layers,
  DollarSign
} from 'lucide-react';
import { createRental, uploadRentalPhotos } from '../services/api';

const PRESET_GEAR = [
  {
    name: 'Sony FX3 Cinema Camera & 24-70mm GM',
    category: 'Camera & Cinema Optics',
    fee: 180,
    deposit: 500,
    before_url: '/uploads/sony_fx3_before.jpg',
    after_url: '/uploads/sony_fx3_after.jpg',
    desc: 'Cinema line full-frame camera kit with 24-70mm f/2.8 lens'
  },
  {
    name: 'DJI Mavic 3 Pro Cine Combo Drone',
    category: 'Drones & Aerial',
    fee: 220,
    deposit: 600,
    before_url: '/uploads/drone_before.jpg',
    after_url: '/uploads/drone_after.jpg',
    desc: 'Tri-camera Apple ProRes aerial drone with controller'
  },
  {
    name: 'Apple MacBook Pro 16" M3 Max 64GB',
    category: 'Computing & Workstations',
    fee: 140,
    deposit: 800,
    before_url: '/uploads/sony_fx3_before.jpg',
    after_url: '/uploads/sony_fx3_after.jpg',
    desc: 'High-end production mobile workstation'
  }
];

export function NewRental({ onBack, onRentalCreated }) {
  const [itemName, setItemName] = useState('Sony FX3 Cinema Camera & 24-70mm GM');
  const [category, setCategory] = useState('Camera & Cinema Optics');
  const [renterName, setRenterName] = useState('Alex Mercer');
  const [renterEmail, setRenterEmail] = useState('alex.mercer@filmmakers.io');
  const [ownerName, setOwnerName] = useState('Apex Cine Rentals LLC');
  const [ownerEmail, setOwnerEmail] = useState('rentals@apexcine.com');
  const [rentalFee, setRentalFee] = useState(180);
  const [depositAmount, setDepositAmount] = useState(500);
  const [beforeUrl, setBeforeUrl] = useState('/uploads/sony_fx3_before.jpg');
  const [afterUrl, setAfterUrl] = useState('/uploads/sony_fx3_after.jpg');
  const [customFile, setCustomFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAuthorized = (parseFloat(rentalFee) || 0) + (parseFloat(depositAmount) || 0);

  const handleSelectPreset = (p) => {
    setItemName(p.name);
    setCategory(p.category);
    setRentalFee(p.fee);
    setDepositAmount(p.deposit);
    setBeforeUrl(p.before_url);
    setAfterUrl(p.after_url);
    setCustomFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemName || !renterName || !ownerName || rentalFee <= 0 || depositAmount <= 0) {
      alert('Please fill out all required fields with positive monetary values.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newRental = await createRental({
        item_name: itemName,
        category: category,
        renter_name: renterName,
        renter_email: renterEmail,
        owner_name: ownerName,
        owner_email: ownerEmail,
        rental_fee: parseFloat(rentalFee),
        deposit_amount: parseFloat(depositAmount),
        currency: 'USD',
        before_image_url: beforeUrl,
        after_image_url: afterUrl
      });

      // If user uploaded a custom file, update it
      if (customFile) {
        await uploadRentalPhotos(newRental.id, customFile, null);
      }

      onRentalCreated(newRental.id);
    } catch (err) {
      alert(`Failed to create rental: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Authorize New Protected Rental
          </h1>
          <p className="text-xs text-slate-400">
            Escrow security deposit & rental fee authorization via PayPal Sandbox
          </p>
        </div>
      </div>

      {/* Preset Gear Quick Select */}
      <div className="mb-8 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <span className="text-xs font-bold text-slate-300 block mb-3 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-brand-400" />
          Quick-Fill Demo Preset:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRESET_GEAR.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className={`p-3 rounded-xl border text-left transition-all ${
                itemName === p.name
                  ? 'bg-brand-950/60 border-brand-500 text-white shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <span className="text-xs font-bold block text-white truncate">{p.name}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">{p.category}</span>
              <div className="flex justify-between items-center mt-2 text-[11px] font-mono">
                <span className="text-slate-400">Fee: ${p.fee}</span>
                <span className="text-emerald-400 font-bold">Dep: ${p.deposit}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        
        {/* Item Details */}
        <div>
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            1. Equipment & Handover Description
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Item / Asset Name *
              </label>
              <input
                type="text"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Sony FX3 Camera Kit"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="Camera & Cinema Optics">Camera & Cinema Optics</option>
                <option value="Drones & Aerial">Drones & Aerial</option>
                <option value="Computing & Workstations">Computing & Workstations</option>
                <option value="Electronics & Audio">Electronics & Audio</option>
                <option value="Luxury Watches & Accessories">Luxury Watches & Accessories</option>
                <option value="E-Bikes & Mobility">E-Bikes & Mobility</option>
              </select>
            </div>
          </div>
        </div>

        {/* Parties */}
        <div className="pt-4 border-t border-slate-800">
          <h3 className="text-sm font-bold text-white mb-3">
            2. Agreement Parties
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Owner / Rental Studio *
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Apex Cine Rentals LLC"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Owner Email *
              </label>
              <input
                type="email"
                required
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="rentals@apexcine.com"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Renter Full Name *
              </label>
              <input
                type="text"
                required
                value={renterName}
                onChange={(e) => setRenterName(e.target.value)}
                placeholder="Alex Mercer"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Renter Email *
              </label>
              <input
                type="email"
                required
                value={renterEmail}
                onChange={(e) => setRenterEmail(e.target.value)}
                placeholder="alex.mercer@filmmakers.io"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Financials & PayPal Authorization */}
        <div className="pt-4 border-t border-slate-800">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            3. Financial Escrow & Authorization
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Rental Fee (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-500 text-xs">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={rentalFee}
                  onChange={(e) => setRentalFee(e.target.value)}
                  className="w-full pl-7 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Refundable Security Deposit (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-500 text-xs">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full pl-7 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Authorization Callout */}
          <div className="mt-4 p-4 rounded-2xl bg-brand-950/40 border border-brand-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-brand-500/20 text-brand-300">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white block">
                  Total Pre-Authorized via PayPal Sandbox
                </span>
                <span className="text-slate-400">
                  Rental Fee (${(parseFloat(rentalFee) || 0).toFixed(2)}) + Deposit (${(parseFloat(depositAmount) || 0).toFixed(2)})
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold text-white font-mono block">
                ${totalAuthorized.toFixed(2)} USD
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase">
                Held in PayPal Escrow
              </span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02]"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Initiating PayPal Authorization...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Create Contract & Authorize (${totalAuthorized.toFixed(2)})
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
