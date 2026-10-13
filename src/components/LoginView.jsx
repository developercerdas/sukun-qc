import React, { useState } from 'react';
import {
  Factory,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { DEFAULT_USERS, loginUser } from '../services/authService';
import { soundFx } from '../utils/soundHelper';
import { useLiveWIB } from '../utils/dateHelper';

export default function LoginView({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('sukun123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const liveWIB = useLiveWIB();

  const handleLoginSubmit = (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      soundFx.playAlert();
      setErrorMsg('Username dan kata sandi wajib diisi!');
      return;
    }

    setIsLoading(true);
    soundFx.playClick();

    setTimeout(() => {
      try {
        const user = loginUser(username, password);
        soundFx.playSuccess();
        onLoginSuccess(user);
      } catch (err) {
        soundFx.playAlert();
        setErrorMsg(err.message || 'Login gagal.');
      } finally {
        setIsLoading(false);
      }
    }, 400);
  };

  const selectPresetUser = (preset) => {
    soundFx.playClick();
    setUsername(preset.username);
    setPassword(preset.password);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden select-none">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-slate-800/60 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 flex items-center justify-center font-black shadow-lg shadow-emerald-500/30">
            <Factory className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="font-black text-xs sm:text-sm tracking-wide text-white leading-tight">
              PT. SUKUN WARTONO INDONESIA
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              QUALITY CONTROL ENTERPRISE
            </p>
          </div>
        </div>

        {/* Live WIB Clock */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-mono font-bold text-[11px] text-emerald-300">
            {liveWIB}
          </span>
        </div>
      </header>

      {/* Center Login Box */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-950/80 relative">
          {/* Subtle Corner Badge */}
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Autentikasi Akses Sistem</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Masuk ke Sistem QC
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gunakan akun resmi Administrator, Mandor QC, atau Operator untuk melanjutkan.
          </p>

          {/* Error Message */}
          {errorMsg && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Login */}
          <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Username Akun
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username (contoh: admin, mandor)"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                  title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs tracking-wide shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.99] disabled:opacity-50 cursor-pointer mt-2"
            >
              {isLoading ? (
                <span>Memverifikasi akun...</span>
              ) : (
                <>
                  <span>MASUK KE SISTEM QC</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Preset Selector */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Pilih Cepat Role Akun (Uji Coba):</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {DEFAULT_USERS.map((usr) => {
                const isSelected = username === usr.username;
                return (
                  <button
                    key={usr.id}
                    type="button"
                    onClick={() => selectPresetUser(usr)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-emerald-500 shadow-sm shadow-emerald-500/20'
                        : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-white">{usr.roleLabel}</span>
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    </div>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-mono">{usr.username}</p>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2.5">
              Password default semua role: <span className="font-mono text-emerald-400 font-bold">sukun123</span>
            </p>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 py-3 text-center text-[10px] text-slate-400 border-t border-slate-800/60 backdrop-blur-md">
        <span>PT. SUKUN WARTONO INDONESIA</span> &bull; <span>Sistem Kontrol Kualitas Produksi Rokok Enterprise</span>
      </footer>
    </div>
  );
}
