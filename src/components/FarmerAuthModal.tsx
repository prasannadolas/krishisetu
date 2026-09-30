import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  User, 
  LogIn, 
  UserPlus, 
  Sprout, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  MapPin, 
  Phone, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile as updateAuthProfile 
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { saveFarmerProfile, FarmerProfile } from '../services/farmerDb';

export const FarmerAuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    authModalTab, 
    setAuthModalTab, 
    loginWithGoogle, 
    selectedState, 
    selectedDistrict,
    t 
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState(selectedState.name);
  const [district, setDistrict] = useState(selectedDistrict.name);
  const [village, setVillage] = useState('');
  const [farmSizeAcres, setFarmSizeAcres] = useState('');
  const [primaryCrops, setPrimaryCrops] = useState('');
  const [soilType, setSoilType] = useState('Medium Black Soil');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error("Google Auth error:", err);
      let msg = err.message || 'Google sign-in could not be completed.';
      if (err.code === 'auth/popup-blocked') {
        msg = 'Pop-up window was blocked by your browser. Redirecting or use Email / Demo sign in below.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        msg = 'Sign-in window closed before completing. Click again to retry or use Instant Demo Sign In.';
      } else if (err.code === 'auth/unauthorized-domain' || err.code === 'auth/invalid-api-key') {
        msg = 'Google Auth origin is not allowed in this environment domain. Please use Email Sign In or Instant Demo Sign In below.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authModalTab === 'register') {
        if (!name.trim()) {
          throw new Error('Please enter farmer name');
        }
        if (!email.trim() || !password.trim()) {
          throw new Error('Please enter email and password');
        }

        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateAuthProfile(cred.user, { displayName: name.trim() });

        const profile: FarmerProfile = {
          uid: cred.user.uid,
          name: name.trim(),
          phone: phone.trim() || undefined,
          state: state || selectedState.name,
          district: district || selectedDistrict.name,
          village: village.trim() || undefined,
          farmSizeAcres: farmSizeAcres.trim() || undefined,
          primaryCrops: primaryCrops.trim() || undefined,
          soilType: soilType || undefined,
          createdAt: new Date().toISOString()
        };

        await saveFarmerProfile(profile);
        setSuccessMsg('Registration successful! Welcome to KrishiSetu.');
        setTimeout(() => {
          setIsAuthModalOpen(false);
        }, 1200);
      } else {
        if (!email.trim() || !password.trim()) {
          throw new Error('Please enter email and password');
        }
        await signInWithEmailAndPassword(auth, email.trim(), password);
        setSuccessMsg('Logged in successfully!');
        setTimeout(() => {
          setIsAuthModalOpen(false);
        }, 1000);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let userFriendly = err.message || 'Authentication failed.';
      if (err.code === 'auth/email-already-in-use') {
        userFriendly = 'This email is already registered. Please sign in.';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        userFriendly = 'Incorrect email or password. Please verify and try again.';
      } else if (err.code === 'auth/weak-password') {
        userFriendly = 'Password should be at least 6 characters.';
      }
      setError(userFriendly);
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Farmer Login for easy testing
  const handleQuickDemoFarmer = async () => {
    setError(null);
    setLoading(true);
    try {
      const demoEmail = 'kisan.ramesh@krishisetu.in';
      const demoPass = 'KisanSetu@2026';
      try {
        await signInWithEmailAndPassword(auth, demoEmail, demoPass);
      } catch {
        const cred = await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
        await updateAuthProfile(cred.user, { displayName: 'Rameshwar Jadhav' });
        await saveFarmerProfile({
          uid: cred.user.uid,
          name: 'Rameshwar Jadhav',
          phone: '9822012345',
          state: 'Maharashtra',
          district: 'Pune',
          village: 'Baramati',
          farmSizeAcres: '4.5',
          primaryCrops: 'Soybean, Wheat, Sugarcane, Cotton',
          soilType: 'Medium Black Soil',
          createdAt: new Date().toISOString()
        });
      }
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Demo farmer login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200/90 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/70 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900 leading-tight">
                {authModalTab === 'login' ? t('farmerLogin') : t('farmerRegister')}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {t('kisanDiaryDesc')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="w-9 h-9 rounded-full bg-stone-200/70 hover:bg-stone-300/80 text-stone-600 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Tab Selector: Login vs Register */}
          <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl text-xs font-bold text-stone-600">
            <button
              onClick={() => { setAuthModalTab('login'); setError(null); }}
              className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                authModalTab === 'login' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t('farmerLogin')}</span>
            </button>
            <button
              onClick={() => { setAuthModalTab('register'); setError(null); }}
              className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                authModalTab === 'register' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('farmerRegister')}</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google Sign-In (Recommended) */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold text-sm shadow-xs transition flex items-center justify-center gap-3 active:scale-98"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.67-5.17 3.67-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.25v3.15C3.25 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.25C.45 8.22 0 10.05 0 12s.45 3.78 1.25 5.39l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.25 6.61l4.02 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <hr className="w-full border-stone-200" />
            <span className="absolute bg-white px-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              Or with Farmer ID
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {authModalTab === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('fullName')} *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rameshwar Jadhav"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('phoneNumber')}
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="98XXXXXXXX"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('villageLabel')}
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={village}
                        onChange={(e) => setVillage(e.target.value)}
                        placeholder="e.g. Baramati"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('farmSize')}
                    </label>
                    <input
                      type="text"
                      value={farmSizeAcres}
                      onChange={(e) => setFarmSizeAcres(e.target.value)}
                      placeholder="e.g. 3.5 Acres"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('soilType')}
                    </label>
                    <select
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm bg-white"
                    >
                      <option value="Medium Black Soil">Medium Black Soil</option>
                      <option value="Deep Black Cotton Soil">Deep Black Cotton Soil</option>
                      <option value="Red Sandy Loam">Red Sandy Loam</option>
                      <option value="Alluvial Soil">Alluvial Soil</option>
                      <option value="Laterite Soil">Laterite Soil</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('primaryCropsLabel')}
                  </label>
                  <input
                    type="text"
                    value={primaryCrops}
                    onChange={(e) => setPrimaryCrops(e.target.value)}
                    placeholder="e.g. Cotton, Soybean, Wheat"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@krishisetu.in"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {authModalTab === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>{authModalTab === 'login' ? t('farmerLogin') : t('farmerRegister')}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleQuickDemoFarmer}
              disabled={loading}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-300/80 text-amber-900 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Instant Test: Sign in as Demo Farmer (Rameshwar Jadhav)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 justify-center text-[11px] text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure Firebase Cloud • Your data stays private to your farm</span>
          </div>
        </div>
      </div>
    </div>
  );
};
