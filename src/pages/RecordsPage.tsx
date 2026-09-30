import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FarmerRecord } from '../services/farmerDb';
import { FormattedJsonViewer } from '../components/FormattedJsonViewer';
import { 
  BookOpen, 
  Layers, 
  Bug, 
  Wheat, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  MapPin, 
  LogIn, 
  LogOut, 
  Edit3, 
  X,
  CheckCircle2
} from 'lucide-react';

export const RecordsPage: React.FC = () => {
  const { 
    currentUser, 
    farmerProfile, 
    farmerRecords, 
    deleteRecordFromDb, 
    setIsAuthModalOpen, 
    setAuthModalTab, 
    signOutFarmer, 
    updateFarmerProfileData,
    setActiveTab, 
    t 
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'soil_scan' | 'disease_diagnosis' | 'crop_advisory'>('all');
  const [selectedRecord, setSelectedRecord] = useState<FarmerRecord | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: farmerProfile?.name || '',
    phone: farmerProfile?.phone || '',
    village: farmerProfile?.village || '',
    farmSizeAcres: farmerProfile?.farmSizeAcres || '',
    primaryCrops: farmerProfile?.primaryCrops || '',
    soilType: farmerProfile?.soilType || ''
  });

  const filteredRecords = activeFilter === 'all' 
    ? farmerRecords 
    : farmerRecords.filter(r => r.recordType === activeFilter);

  const soilCount = farmerRecords.filter(r => r.recordType === 'soil_scan').length;
  const diseaseCount = farmerRecords.filter(r => r.recordType === 'disease_diagnosis').length;
  const cropCount = farmerRecords.filter(r => r.recordType === 'crop_advisory').length;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateFarmerProfileData(editForm);
    setIsEditingProfile(false);
  };

  const handleDelete = async (record: FarmerRecord) => {
    if (window.confirm(t('deleteRecordConfirm') || 'Are you sure you want to delete this farm record?')) {
      await deleteRecordFromDb(record.id);
      if (selectedRecord?.id === record.id) {
        setSelectedRecord(null);
      }
    }
  };

  // Not logged in view
  if (!currentUser) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="relative z-10 space-y-3 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t('tabRecords')}</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {t('kisanDiary')}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              {t('kisanDiaryDesc')}
            </p>
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={() => { setAuthModalTab('login'); setIsAuthModalOpen(true); }}
                className="px-5 py-3 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-sm shadow-md transition flex items-center gap-2"
              >
                <LogIn className="w-4 h-4 text-emerald-700" />
                <span>{t('farmerLogin')}</span>
              </button>
              <button
                onClick={() => { setAuthModalTab('register'); setIsAuthModalOpen(true); }}
                className="px-5 py-3 rounded-2xl bg-emerald-700/80 hover:bg-emerald-700 text-white font-bold text-sm border border-emerald-500/40 backdrop-blur-xs transition"
              >
                {t('farmerRegister')}
              </button>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none p-6">
            <BookOpen className="w-56 h-56 text-white" />
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5 text-amber-700" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">{t('soilTests')}</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              {t('soilRecordsDesc')}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
              <Bug className="w-5 h-5 text-rose-700" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">{t('diseaseScans')}</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              {t('diseaseRecordsDesc')}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Wheat className="w-5 h-5 text-emerald-700" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">{t('cropAdvisories')}</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              {t('cropRecordsDesc')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Logged in Farmer Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white font-black text-xl flex items-center justify-center shadow-xs">
              {farmerProfile?.name ? farmerProfile.name.charAt(0) : 'K'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                  {farmerProfile?.name || 'Farmer Account'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  {t('registeredFarmer')}
                </span>
              </div>
              <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>
                  {farmerProfile?.village ? `${farmerProfile.village}, ` : ''}
                  {farmerProfile?.district || 'Farm Location'}, {farmerProfile?.state || ''}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                setEditForm({
                  name: farmerProfile?.name || '',
                  phone: farmerProfile?.phone || '',
                  village: farmerProfile?.village || '',
                  farmSizeAcres: farmerProfile?.farmSizeAcres || '',
                  primaryCrops: farmerProfile?.primaryCrops || '',
                  soilType: farmerProfile?.soilType || ''
                });
                setIsEditingProfile(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t('editProfile')}</span>
            </button>
            <button
              onClick={signOutFarmer}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('logout')}</span>
            </button>
          </div>
        </div>

        {/* Farm Metadata Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-stone-50 rounded-2xl">
            <span className="text-stone-400 block text-[11px] font-semibold">{t('farmSize')}</span>
            <span className="font-bold text-stone-800">{farmerProfile?.farmSizeAcres ? `${farmerProfile.farmSizeAcres} Acres` : 'Not recorded'}</span>
          </div>
          <div className="p-3 bg-stone-50 rounded-2xl">
            <span className="text-stone-400 block text-[11px] font-semibold">{t('soilType')}</span>
            <span className="font-bold text-stone-800">{farmerProfile?.soilType || 'Medium Black Soil'}</span>
          </div>
          <div className="p-3 bg-stone-50 rounded-2xl">
            <span className="text-stone-400 block text-[11px] font-semibold">{t('primaryCropsLabel')}</span>
            <span className="font-bold text-stone-800 truncate block">{farmerProfile?.primaryCrops || 'Cotton, Soybean'}</span>
          </div>
          <div className="p-3 bg-stone-50 rounded-2xl">
            <span className="text-stone-400 block text-[11px] font-semibold">{t('allRecords')}</span>
            <span className="font-bold text-emerald-700">{farmerRecords.length} {t('saved')}</span>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-base text-stone-900">{t('farmerProfileTitle')}</h3>
              <button onClick={() => setIsEditingProfile(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">{t('fullName')} *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">{t('phoneNumber')}</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">{t('villageLabel')}</label>
                  <input
                    type="text"
                    value={editForm.village}
                    onChange={(e) => setEditForm({ ...editForm, village: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">{t('farmSize')}</label>
                  <input
                    type="text"
                    value={editForm.farmSizeAcres}
                    onChange={(e) => setEditForm({ ...editForm, farmSizeAcres: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">{t('soilType')}</label>
                  <input
                    type="text"
                    value={editForm.soilType}
                    onChange={(e) => setEditForm({ ...editForm, soilType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">{t('primaryCropsLabel')}</label>
                <input
                  type="text"
                  value={editForm.primaryCrops}
                  onChange={(e) => setEditForm({ ...editForm, primaryCrops: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 font-bold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {t('saveProfile')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
            activeFilter === 'all'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          {t('allRecords')} ({farmerRecords.length})
        </button>
        <button
          onClick={() => setActiveFilter('soil_scan')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeFilter === 'soil_scan'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-600" />
          <span>{t('soilTests')} ({soilCount})</span>
        </button>
        <button
          onClick={() => setActiveFilter('disease_diagnosis')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeFilter === 'disease_diagnosis'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Bug className="w-3.5 h-3.5 text-rose-600" />
          <span>{t('diseaseScans')} ({diseaseCount})</span>
        </button>
        <button
          onClick={() => setActiveFilter('crop_advisory')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeFilter === 'crop_advisory'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Wheat className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t('cropAdvisories')} ({cropCount})</span>
        </button>
      </div>

      {/* Records List / Grid */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-stone-200/90 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-stone-900">
              {t('noRecordsYet')}
            </h3>
            <p className="text-xs text-stone-500">
              Use the buttons below to test your soil or scan plant leaves and save records.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActiveTab('soil')}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Layers className="w-4 h-4" />
              <span>{t('testSoil')}</span>
            </button>
            <button
              onClick={() => setActiveTab('disease')}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Bug className="w-4 h-4" />
              <span>{t('scanDisease')}</span>
            </button>
            <button
              onClick={() => setActiveTab('crops')}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Wheat className="w-4 h-4" />
              <span>{t('findCrops')}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecords.map((record) => {
            const isSoil = record.recordType === 'soil_scan';
            const isDisease = record.recordType === 'disease_diagnosis';
            const isCrop = record.recordType === 'crop_advisory';

            return (
              <div 
                key={record.id}
                className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isSoil ? 'bg-amber-100 text-amber-800' :
                        isDisease ? 'bg-rose-100 text-rose-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isSoil && <Layers className="w-4 h-4" />}
                        {isDisease && <Bug className="w-4 h-4" />}
                        {isCrop && <Wheat className="w-4 h-4" />}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        isSoil ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        isDisease ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                        'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {isSoil ? t('soilTests') : isDisease ? t('diseaseScans') : t('cropAdvisories')}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(record)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Thumbnail if present */}
                  {record.imageUrl && (
                    <div className="w-full h-36 rounded-xl overflow-hidden bg-stone-100 border border-stone-200/80">
                      <img 
                        src={record.imageUrl} 
                        alt={record.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div>
                    <h3 className="font-bold text-sm text-stone-900 leading-snug">
                      {record.title}
                    </h3>
                    {record.crop && (
                      <span className="text-xs text-emerald-700 font-semibold mt-0.5 block">
                        {t('cropLabel')}: {record.crop}
                      </span>
                    )}
                    {record.summary && (
                      <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                        {record.summary}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(record.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </span>

                  <button
                    onClick={() => setSelectedRecord(record)}
                    className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <span>{t('viewDetails')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  {selectedRecord.recordType === 'soil_scan' ? t('soilReportTitle') : 
                   selectedRecord.recordType === 'disease_diagnosis' ? t('diseaseReportTitle') : t('cropReportTitle')}
                </span>
                <span className="text-xs text-stone-400">
                  {new Date(selectedRecord.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
              <button 
                onClick={() => setSelectedRecord(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedRecord.imageUrl && (
              <div className="w-full h-52 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                <img 
                  src={selectedRecord.imageUrl} 
                  alt={selectedRecord.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div>
              <h2 className="text-lg font-black text-stone-900">{selectedRecord.title}</h2>
              {selectedRecord.crop && (
                <p className="text-xs font-bold text-emerald-700 mt-0.5">{t('cropLabel')}: {selectedRecord.crop}</p>
              )}
            </div>

            {selectedRecord.summary && (
              <div className="p-3.5 bg-stone-50 rounded-2xl text-xs text-stone-800 leading-relaxed">
                <strong>{t('summaryLabel')}:</strong> {selectedRecord.summary}
              </div>
            )}

            {selectedRecord.detailsJson && (
              <div className="pt-1">
                <FormattedJsonViewer 
                  data={selectedRecord.detailsJson} 
                  title={t('detailedAdvice')} 
                  defaultView="human" 
                />
              </div>
            )}

            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={() => handleDelete(selectedRecord)}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('deleteRecord')}</span>
              </button>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
