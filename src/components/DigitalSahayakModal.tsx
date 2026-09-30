import React, { useState } from 'react';
import { useApp, AssistedFarmer } from '../context/AppContext';
import { INDIA_STATES } from '../data/india-geo';
import { 
  X, 
  Users, 
  Search, 
  UserPlus, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  Home, 
  Sprout, 
  Trash2, 
  Sparkles,
  Printer,
  ShieldCheck
} from 'lucide-react';

export const DigitalSahayakModal: React.FC = () => {
  const { 
    isDigitalSahayakModalOpen, 
    setIsDigitalSahayakModalOpen, 
    assistedFarmer, 
    assistedFarmerList, 
    isAssistMode, 
    setAssistedFarmerContext, 
    saveAssistedFarmerToList, 
    deleteAssistedFarmerFromList, 
    clearAssistMode,
    selectedState,
    selectedDistrict,
    setIsPrintReportOpen,
    t
  } = useApp();

  const [activeTab, setActiveTab] = useState<'register' | 'lookup' | 'directory'>('register');

  // Registration Form State
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [phone, setPhone] = useState('');
  const [crop, setCrop] = useState('');
  const [landAcres, setLandAcres] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [formState, setFormState] = useState(selectedState.name);
  const [formDistrict, setFormDistrict] = useState(selectedDistrict.name);
  const [formSuccess, setFormSuccess] = useState(false);

  // Quick Lookup State
  const [lookupState, setLookupState] = useState(selectedState.name);
  const [lookupDistrict, setLookupDistrict] = useState(selectedDistrict.name);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isDigitalSahayakModalOpen) return null;

  const targetStateObj = INDIA_STATES.find(s => s.name === formState) || INDIA_STATES[0];
  const lookupStateObj = INDIA_STATES.find(s => s.name === lookupState) || INDIA_STATES[0];

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const created = saveAssistedFarmerToList({
      name: name.trim(),
      village: village.trim() || undefined,
      phone: phone.trim() || undefined,
      stateName: formState,
      districtName: formDistrict,
      crop: crop.trim() || undefined,
      landAcres: typeof landAcres === 'number' ? landAcres : undefined,
      notes: notes.trim() || undefined
    });

    setAssistedFarmerContext(created);
    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setIsDigitalSahayakModalOpen(false);
    }, 1200);
  };

  const handleApplyLookup = () => {
    const tempFarmer: AssistedFarmer = {
      id: `temp-${Date.now()}`,
      name: `Farmer in ${lookupDistrict}`,
      village: `${lookupDistrict} Locality`,
      stateName: lookupState,
      districtName: lookupDistrict,
      createdAt: new Date().toISOString()
    };
    setAssistedFarmerContext(tempFarmer);
    setIsDigitalSahayakModalOpen(false);
  };

  const handleSelectSavedFarmer = (farmer: AssistedFarmer) => {
    setAssistedFarmerContext(farmer);
    setIsDigitalSahayakModalOpen(false);
  };

  // Filtered districts for lookup search
  const filteredDistricts = lookupStateObj.districts.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-5 relative">
          <button 
            onClick={() => setIsDigitalSahayakModalOpen(false)}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-700/60 rounded-xl ring-2 ring-emerald-400/30">
              <Users className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Digital Sahayak</h2>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wide bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full">
                  Community Assist Mode
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Help fellow non-digital farmers & lookup agro-advisories for any locality in India
              </p>
            </div>
          </div>

          {/* Active Assist Status Bar if active */}
          {isAssistMode && assistedFarmer && (
            <div className="mt-4 p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
                </span>
                <span className="text-xs font-semibold">
                  Currently Assisting: <strong className="text-amber-300">{assistedFarmer.name}</strong> ({assistedFarmer.village || assistedFarmer.districtName})
                </span>
              </div>
              <button
                onClick={() => {
                  clearAssistMode();
                  setIsDigitalSahayakModalOpen(false);
                }}
                className="text-[11px] bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg font-medium transition"
              >
                End Assist Mode
              </button>
            </div>
          )}
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50/80 px-4 pt-2">
          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'register'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg border-t border-x border-stone-200 shadow-sm'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>Register Fellow Farmer</span>
          </button>

          <button
            onClick={() => setActiveTab('lookup')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'lookup'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg border-t border-x border-stone-200 shadow-sm'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Search className="w-4 h-4 text-emerald-600" />
            <span>Lookup Any Locality</span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition relative ${
              activeTab === 'directory'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg border-t border-x border-stone-200 shadow-sm'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Saved Directory ({assistedFarmerList.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {formSuccess ? (
            <div className="py-10 text-center space-y-3 animate-fadeIn">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">Farmer Context Active!</h3>
              <p className="text-sm text-stone-600">
                Now showing localized advisories, weather & mandi rates for <strong className="text-emerald-700">{name}</strong> ({formDistrict}, {formState}).
              </p>
            </div>
          ) : activeTab === 'register' ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  Register a non-tech farmer in your village. All soil tests, crop advisories, and weather reports generated will be tailored for them and can be printed in a 1-page paper report.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Farmer's Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar Patel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Village / Panchayat Name
                  </label>
                  <div className="relative">
                    <Home className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. Haveli, Shivajinagar"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    State
                  </label>
                  <select
                    value={formState}
                    onChange={(e) => {
                      setFormState(e.target.value);
                      const st = INDIA_STATES.find(s => s.name === e.target.value);
                      if (st) setFormDistrict(st.districts[0].name);
                    }}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  >
                    {INDIA_STATES.map((st) => (
                      <option key={st.name} value={st.name}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    District
                  </label>
                  <select
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  >
                    {targetStateObj.districts.map((dst) => (
                      <option key={dst.name} value={dst.name}>
                        {dst.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Mobile Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      placeholder="10-digit mobile"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Primary Crop
                  </label>
                  <div className="relative">
                    <Sprout className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. Wheat, Cotton"
                      value={crop}
                      onChange={(e) => setCrop(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Land Holding (Acres)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 3.5"
                    value={landAcres}
                    onChange={(e) => setLandAcres(e.target.value ? parseFloat(e.target.value) : '')}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Additional Field Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Soil is saline near stream, lacks irrigation pump..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDigitalSahayakModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <span>Set Active & Assist Farmer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          ) : activeTab === 'lookup' ? (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  Instantly switch the app's advisory context to any state & district across India to view weather forecast, climate trends, soil zones, and mandi rates.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Select State
                  </label>
                  <select
                    value={lookupState}
                    onChange={(e) => {
                      setLookupState(e.target.value);
                      const st = INDIA_STATES.find(s => s.name === e.target.value);
                      if (st) setLookupDistrict(st.districts[0].name);
                    }}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {INDIA_STATES.map((st) => (
                      <option key={st.name} value={st.name}>
                        {st.name} ({st.districts.length} districts)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Filter District
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search district name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="border border-stone-200 rounded-xl p-3 bg-stone-50 max-h-48 overflow-y-auto space-y-1">
                <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2">
                  Districts in {lookupStateObj.name}
                </div>
                {filteredDistricts.length === 0 ? (
                  <p className="text-xs text-stone-400 py-2 text-center">No matching district found</p>
                ) : (
                  filteredDistricts.map((dst) => (
                    <button
                      key={dst.name}
                      type="button"
                      onClick={() => setLookupDistrict(dst.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                        lookupDistrict === dst.name
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 opacity-80" />
                        <span>{dst.name}</span>
                      </div>
                      <span className={`text-[10px] ${lookupDistrict === dst.name ? 'text-emerald-100' : 'text-stone-400'}`}>
                        {dst.soilZone || 'Soil Zone'}
                      </span>
                    </button>
                  ))
                )}
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-950">Target Locality Selected:</div>
                  <div className="text-sm font-extrabold text-emerald-800">
                    {lookupDistrict}, {lookupState}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleApplyLookup}
                  className="px-4 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <span>Set Active Locality</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {assistedFarmerList.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Users className="w-10 h-10 text-stone-300 mx-auto" />
                  <h4 className="text-sm font-bold text-stone-700">No Saved Fellow Farmers Yet</h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Use the 'Register Fellow Farmer' tab to add non-tech farmers in your area so you can generate advisories for them anytime!
                  </p>
                  <button
                    onClick={() => setActiveTab('register')}
                    className="px-4 py-2 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-xl hover:bg-emerald-200 transition"
                  >
                    + Register First Farmer
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {assistedFarmerList.map((f) => (
                    <div
                      key={f.id}
                      className={`p-4 rounded-xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        assistedFarmer?.id === f.id
                          ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-stone-900">{f.name}</h4>
                          {f.village && (
                            <span className="text-[11px] px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full">
                              {f.village}
                            </span>
                          )}
                          {assistedFarmer?.id === f.id && (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-600 text-white rounded-full">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-stone-500 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            {f.districtName}, {f.stateName}
                          </span>
                          {f.crop && (
                            <span className="flex items-center gap-1 text-emerald-700 font-medium">
                              <Sprout className="w-3 h-3" />
                              {f.crop}
                            </span>
                          )}
                          {f.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {f.phone}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => handleSelectSavedFarmer(f)}
                          className="px-3 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition"
                        >
                          Select & Assist
                        </button>
                        <button
                          onClick={() => {
                            setAssistedFarmerContext(f);
                            setIsPrintReportOpen(true);
                            setIsDigitalSahayakModalOpen(false);
                          }}
                          className="p-1.5 text-stone-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg transition"
                          title="Print Farmer Advisory Sheet"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteAssistedFarmerFromList(f.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Farmer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Empowering Interoperable Digital Agriculture for Every Farmer</span>
          </div>
          <button
            onClick={() => setIsDigitalSahayakModalOpen(false)}
            className="px-4 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 border border-stone-300 rounded-lg bg-white"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
