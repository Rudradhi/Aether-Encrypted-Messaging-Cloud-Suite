/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Zap, 
  MessageSquare, 
  Video, 
  Sparkles,
  CheckCircle2, 
  ChevronRight,
  LogIn,
  UserPlus,
  Flame,
  HardDrive,
  Mic,
  X,
  Play,
  Pause,
  Phone,
  PhoneOff,
  CheckCheck,
  Volume2,
  Mail,
  FileText,
  Download,
  Timer,
  Eye,
  RefreshCw
} from 'lucide-react';
import { LightningCanvas } from './LightningCanvas';

interface HomeLandingProps {
  onEnterApp: () => void;
  onLoginSuccess?: (userData: { name: string; email: string; isNewUser: boolean }) => void;
}

export const HomeLanding: React.FC<HomeLandingProps> = ({ onEnterApp, onLoginSuccess }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const aetherTitleRef = useRef<HTMLHeadingElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  
  // Login / Join decorated popup modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhoneCountry, setAuthPhoneCountry] = useState('+1');
  const [authPhone, setAuthPhone] = useState('');
  const [authPhoneCode, setAuthPhoneCode] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'microsoft' | null>(null);

  // Professional Product Showcase Capabilities:
  type ShowcaseTab = 'messaging' | 'calls' | 'vault' | 'ephemeral';
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<ShowcaseTab>('messaging');
  const [tabProgress, setTabProgress] = useState(0); // 0 to 100%
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Feature 1: Messaging animation states
  const [chatStep, setChatStep] = useState<'typing' | 'sent'>('sent');
  const [isVoiceMemoPlaying, setIsVoiceMemoPlaying] = useState(false);
  const [voicePlaybackProgress, setVoicePlaybackProgress] = useState(45);

  // Feature 2: Studio Calls states
  const [isCallMuted, setIsCallMuted] = useState(false);
  const [isCallVideoOn, setIsCallVideoOn] = useState(true);
  const [callSeconds, setCallSeconds] = useState(42);

  // Feature 3: Cloud Vault states
  const [vaultSyncProgress, setVaultSyncProgress] = useState(100);

  // Feature 4: Disappearing Messages states
  const [ephemeralSeconds, setEphemeralSeconds] = useState(4);
  const [isEphemeralVaporized, setIsEphemeralVaporized] = useState(false);

  // Auto-tour progression across capabilities every 6.5 seconds
  useEffect(() => {
    if (!isAutoPlay) return;

    const intervalMs = 50;
    const durationMs = 6500;
    const stepPct = (intervalMs / durationMs) * 100;

    const timer = setInterval(() => {
      setTabProgress((prev) => {
        if (prev >= 100) {
          setActiveShowcaseTab((curr) => {
            if (curr === 'messaging') return 'calls';
            if (curr === 'calls') return 'vault';
            if (curr === 'vault') return 'ephemeral';
            return 'messaging';
          });
          return 0;
        }
        return prev + stepPct;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isAutoPlay]);

  // Micro-animations triggers when tab changes
  useEffect(() => {
    setTabProgress(0);

    if (activeShowcaseTab === 'messaging') {
      setChatStep('typing');
      const timer = setTimeout(() => {
        setChatStep('sent');
      }, 1600);
      return () => clearTimeout(timer);
    } else if (activeShowcaseTab === 'calls') {
      const callTimer = setInterval(() => {
        setCallSeconds((s) => s + 1);
      }, 1000);
      return () => clearInterval(callTimer);
    } else if (activeShowcaseTab === 'vault') {
      setVaultSyncProgress(25);
      const syncTimer = setInterval(() => {
        setVaultSyncProgress((p) => {
          if (p >= 100) {
            clearInterval(syncTimer);
            return 100;
          }
          return p + 25;
        });
      }, 250);
      return () => clearInterval(syncTimer);
    } else if (activeShowcaseTab === 'ephemeral') {
      setIsEphemeralVaporized(false);
      setEphemeralSeconds(4);
      let count = 4;
      const countTimer = setInterval(() => {
        count--;
        setEphemeralSeconds(count);
        if (count <= 0) {
          clearInterval(countTimer);
          setIsEphemeralVaporized(true);
        }
      }, 1100);
      return () => clearInterval(countTimer);
    }
  }, [activeShowcaseTab]);

  // Voice memo waveform animation ticker
  useEffect(() => {
    let playTimer: NodeJS.Timeout;
    if (isVoiceMemoPlaying) {
      playTimer = setInterval(() => {
        setVoicePlaybackProgress((p) => (p >= 100 ? 0 : p + 8));
      }, 200);
    }
    return () => clearInterval(playTimer);
  }, [isVoiceMemoPlaying]);


  const [scrollY, setScrollY] = useState(0);

  // Window-level mouse move listener for seamless continuous cursor tracking
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX,
        y: e.clientY,
      });
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, []);

  // Mouse move handler for interactive dynamic cursor lighting spotlight (viewport relative)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setMousePos({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollY(e.currentTarget.scrollTop);
  };

  const handleSocialAuth = (provider: 'google' | 'microsoft') => {
    setSocialLoading(provider);
    setTimeout(() => {
      setSocialLoading(null);
      setShowAuthModal(false);
      if (onLoginSuccess) {
        if (provider === 'google') {
          onLoginSuccess({
            name: 'Rudradhi Indra',
            email: 'yourudradhi@gmail.com',
            isNewUser: authMode === 'signup',
          });
        } else {
          onLoginSuccess({
            name: 'Rudradhi Indra',
            email: 'rudradhi@outlook.com',
            isNewUser: authMode === 'signup',
          });
        }
      } else {
        onEnterApp();
      }
    }, 600);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowAuthModal(false);
      if (onLoginSuccess) {
        if (authMethod === 'phone') {
          const rawPhone = authPhone.trim() || '555-0192';
          const fullPhone = `${authPhoneCountry} ${rawPhone}`;
          onLoginSuccess({
            name: authName.trim() || 'Rudradhi Indra',
            email: fullPhone,
            isNewUser: authMode === 'signup',
          });
        } else {
          onLoginSuccess({
            name: authName.trim() || (authMode === 'login' ? (authEmail.split('@')[0] || 'Rudradhi Indra') : 'Rudradhi Indra'),
            email: authEmail.trim() || 'rudradhi@aether.network',
            isNewUser: authMode === 'signup',
          });
        }
      } else {
        onEnterApp();
      }
    }, 500);
  };

  // Calculate smooth fade-out factor as user scrolls down
  const lightingIntensity = Math.max(0.1, 1 - scrollY / 650);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onScroll={handleScroll}
      className="flex-1 h-full overflow-y-auto bg-neutral-950 text-neutral-100 select-none relative scroll-smooth"
    >
      {/* 1. Dynamic Interactive Cursor Follower Lighting Glow - Fixed with infinite soft boundary */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(900px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16, 185, 129, ${0.16 * lightingIntensity}) 0%, rgba(16, 185, 129, ${0.07 * lightingIntensity}) 30%, rgba(56, 189, 248, ${0.02 * lightingIntensity}) 55%, transparent 75%)`,
        }}
      />

      {/* Real-time Dynamic Lightning Canvas: Continuous arcs around AETHER & follows cursor */}
      <LightningCanvas
        mousePos={mousePos}
        aetherRef={aetherTitleRef}
        intensity={lightingIntensity}
      />

      {/* 2. Static Ambient Atmospheric Lighting Orbs (smoothly fades with scroll) */}
      <div 
        className="fixed top-10 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none z-0 transition-opacity duration-300"
        style={{ opacity: lightingIntensity }}
      />
      <div 
        className="fixed top-[45%] right-0 w-[600px] h-[450px] bg-teal-500/10 blur-[140px] rounded-full pointer-events-none z-0 transition-opacity duration-300"
        style={{ opacity: lightingIntensity }}
      />
      <div 
        className="fixed bottom-20 left-10 w-[700px] h-[500px] bg-cyan-500/5 blur-[160px] rounded-full pointer-events-none z-0 transition-opacity duration-300"
        style={{ opacity: lightingIntensity }}
      />

      {/* 3. Smooth Scroll Vignette overlay to fade gradually to black */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-transparent via-transparent to-neutral-950/80" 
      />

      {/* 4. Subtle Technical Grid Texture */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none z-0"
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content Canvas */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 lg:py-20 flex flex-col items-center">
        {/* Massive High-Impact Brand Typography Display */}
        <div className="relative flex flex-col items-center text-center mb-6">
          <h1 
            ref={aetherTitleRef}
            className="text-7xl sm:text-9xl md:text-[11.5rem] font-black tracking-[-0.05em] uppercase bg-gradient-to-b from-white via-neutral-100 to-neutral-500 bg-clip-text text-transparent select-none drop-shadow-2xl leading-none transition-all"
          >
            AETHER
          </h1>
          {/* Luminous Glow under the Brand Wordmark */}
          <div className="w-3/4 h-8 -mt-4 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent blur-xl pointer-events-none" />
        </div>

        {/* Elegant Tagline */}
        <div className="text-center max-w-2xl mb-10">
          <p className="text-xl sm:text-2xl font-light text-neutral-200 tracking-tight leading-relaxed mb-3">
            Pure minimalism. Highest-end encryption.
          </p>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed font-normal">
            No clutter. No corporate tracking. An ultra-responsive communication sanctuary designed for real conversations, crystal-clear calls, and effortless file storage.
          </p>
        </div>

        {/* Primary Call-To-Action Button Strip */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20 w-full sm:w-auto">
          {/* Create Account / Sign Up Button */}
          <button
            onClick={() => {
              setAuthMode('signup');
              setShowAuthModal(true);
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-bold text-sm tracking-tight transition-all shadow-xl shadow-emerald-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2 group"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Sign In Button */}
          <button
            onClick={() => {
              setAuthMode('login');
              setShowAuthModal(true);
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 border border-neutral-700/80 hover:border-emerald-500/50 text-white font-semibold text-sm transition-all shadow-lg backdrop-blur-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4 text-emerald-400" />
            <span>Sign In</span>
          </button>
        </div>

        {/* Professional Advertising Showcase Window Surrounded by Circulating Blue & Green Gradient */}
        <div className="w-full max-w-4xl mb-24 relative group">
          {/* Circulating Ambient Glow Backdrop */}
          <div className="circulating-ambient-glow" />

          {/* Circulating Gradient Container (Blue & Green circulating border) */}
          <div className="circulating-gradient-container w-full">
            <div className="bg-[#090c13]/95 backdrop-blur-2xl rounded-[26px] p-6 sm:p-8 border border-white/10 overflow-hidden relative min-h-[520px] flex flex-col justify-between z-10">

              {/* Showcase Top Bar: Capability Headline & Navigation Tabs */}
              <div className="border-b border-white/10 pb-5 mb-6 shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                  {/* Advertising Title & Purpose */}
                  <div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/60 mb-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[11px] font-semibold text-emerald-300 tracking-wide uppercase">
                        Product Capability Tour
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {activeShowcaseTab === 'messaging' && 'Effortless Conversations'}
                      {activeShowcaseTab === 'calls' && 'Studio-Grade Audio & HD Video'}
                      {activeShowcaseTab === 'vault' && 'Encrypted Cloud Vault'}
                      {activeShowcaseTab === 'ephemeral' && 'Disappearing Confidential Messages'}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
                      {activeShowcaseTab === 'messaging' && 'Instant delivery, rich voice notes, and crystal-clear text with zero background tracking.'}
                      {activeShowcaseTab === 'calls' && 'One-click calls with high-definition video, studio noise isolation, and zero downloads.'}
                      {activeShowcaseTab === 'vault' && 'Store and share high-resolution documents, recordings, and media without compression.'}
                      {activeShowcaseTab === 'ephemeral' && 'Self-destructing notes that cleanly vaporize after reading. No digital footprints.'}
                    </p>
                  </div>

                  {/* Auto-Play Toggle & Action Button */}
                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <button
                      onClick={() => setIsAutoPlay(!isAutoPlay)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                      title={isAutoPlay ? 'Pause automatic tour' : 'Resume automatic tour'}
                    >
                      {isAutoPlay ? (
                        <>
                          <Pause className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Pause Tour</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Auto Play</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setAuthMode('signup');
                        setShowAuthModal(true);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-bold text-xs tracking-tight transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Try Aether Free</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Minimalist Rounded Capability Tabs with Live Progress Indicators */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    { id: 'messaging' as const, label: 'Instant Chat', icon: <MessageSquare className="w-3.5 h-3.5" /> },
                    { id: 'calls' as const, label: 'Studio Calls', icon: <Video className="w-3.5 h-3.5" /> },
                    { id: 'vault' as const, label: 'Cloud Vault', icon: <HardDrive className="w-3.5 h-3.5" /> },
                    { id: 'ephemeral' as const, label: 'Disappearing', icon: <Flame className="w-3.5 h-3.5" /> },
                  ].map((tab) => {
                    const isActive = activeShowcaseTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveShowcaseTab(tab.id);
                          setIsAutoPlay(false);
                        }}
                        className={`relative px-3.5 py-2.5 rounded-xl font-medium text-xs text-left transition-all cursor-pointer overflow-hidden border ${
                          isActive
                            ? 'bg-white/10 text-white border-cyan-500/40 shadow-sm'
                            : 'bg-white/[0.02] hover:bg-white/[0.06] text-neutral-400 border-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2 relative z-10">
                          <span className={isActive ? 'text-cyan-400' : 'text-neutral-500'}>
                            {tab.icon}
                          </span>
                          <span className="truncate">{tab.label}</span>
                        </div>

                        {/* Animated progress underline for active tab */}
                        {isActive && isAutoPlay && (
                          <div 
                            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all"
                            style={{ width: `${tabProgress}%` }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Showcase Stage: Animated Display per Capability */}
              <div className="flex-1 flex flex-col justify-center py-2 min-h-[290px]">

                {/* Capability 1: Instant Messaging & Voice Notes */}
                {activeShowcaseTab === 'messaging' && (
                  <div className="w-full max-w-2xl mx-auto space-y-4 animate-in fade-in zoom-in-98 duration-300">
                    {/* Active Contact Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-800 ring-2 ring-emerald-500/50 overflow-hidden relative">
                          <img
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&h=128&q=80"
                            alt="Rudradhi Indra"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-neutral-900" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">Rudradhi Indra</span>
                            <span className="text-[10px] text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded-full font-semibold">
                              Founder
                            </span>
                          </div>
                          <span className="text-xs text-emerald-400 font-medium">Online · Ultra-fast connection</span>
                        </div>
                      </div>
                      <span className="text-xs text-neutral-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                        Private Direct Chat
                      </span>
                    </div>

                    {/* Incoming Message Bubble */}
                    <div className="flex flex-col items-start">
                      <div className="bg-neutral-900/90 border border-white/10 rounded-2xl rounded-tl-sm p-4 max-w-lg text-xs sm:text-sm text-neutral-200 leading-relaxed shadow-lg">
                        <p>Welcome to Aether. Every conversation is protected, clean, and blazingly fast.</p>
                        <div className="text-[10px] text-neutral-500 mt-2 flex items-center justify-end gap-1">
                          <span>10:42 AM</span>
                          <CheckCheck className="w-3.5 h-3.5 text-cyan-400 inline" />
                        </div>
                      </div>
                    </div>

                    {/* Outgoing Message with Typing and Delivery Simulation */}
                    <div className="flex flex-col items-end">
                      {chatStep === 'typing' ? (
                        <div className="flex items-center gap-2 text-xs text-neutral-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          <span>Typing response...</span>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-500/30 rounded-2xl rounded-tr-sm p-4 max-w-md text-xs sm:text-sm text-emerald-100 leading-relaxed shadow-lg">
                          <p>The interface feels remarkably responsive. Crystal clear and distraction-free.</p>
                          <div className="text-[10px] text-emerald-400/80 mt-2 flex items-center justify-end gap-1">
                            <span>10:43 AM</span>
                            <CheckCheck className="w-3.5 h-3.5 text-cyan-400 inline" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Interactive Voice Note Audio Bubble */}
                    <div className="flex flex-col items-end">
                      <div className="bg-neutral-850 border border-white/10 rounded-2xl p-3.5 max-w-md w-full text-xs text-white shadow-lg">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setIsVoiceMemoPlaying(!isVoiceMemoPlaying)}
                            className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 flex items-center justify-center transition-transform active:scale-95 cursor-pointer shrink-0 shadow-md"
                            title={isVoiceMemoPlaying ? 'Pause memo' : 'Play memo'}
                          >
                            {isVoiceMemoPlaying ? (
                              <Pause className="w-4 h-4 fill-current" />
                            ) : (
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            )}
                          </button>

                          {/* Sound Equalizer Waveform */}
                          <div className="flex items-center gap-1 h-7 flex-1">
                            {[30, 65, 45, 95, 80, 50, 90, 100, 75, 60, 85, 70, 50, 40].map((h, i) => {
                              const barPct = (i / 14) * 100;
                              const isPassed = voicePlaybackProgress >= barPct;
                              return (
                                <div
                                  key={i}
                                  className={`w-1 rounded-full transition-all duration-150 ${
                                    isPassed ? 'bg-cyan-400 scale-y-110' : 'bg-neutral-600'
                                  } ${isVoiceMemoPlaying ? 'animate-pulse' : ''}`}
                                  style={{ height: `${h}%` }}
                                />
                              );
                            })}
                          </div>
                          <span className="text-[11px] text-neutral-400 font-mono tabular-nums shrink-0">
                            {isVoiceMemoPlaying ? '0:08' : '0:14'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Capability 2: Studio Audio & HD Video Calls */}
                {activeShowcaseTab === 'calls' && (
                  <div className="w-full max-w-2xl mx-auto animate-in fade-in zoom-in-98 duration-300">
                    <div className="p-6 rounded-2xl bg-neutral-900/80 border border-white/10 shadow-2xl relative overflow-hidden">
                      {/* Active Call Ambient Glow */}
                      <div className="w-72 h-36 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2" />

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-14 h-14 rounded-full ring-2 ring-cyan-400/80 overflow-hidden shadow-xl">
                              <img
                                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80"
                                alt="Rudradhi Indra"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full text-neutral-950">
                              <Volume2 className="w-2.5 h-2.5" />
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-bold text-white">Rudradhi Indra</h4>
                              <span className="text-[10px] text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded-full font-medium">
                                Speaking
                              </span>
                            </div>
                            <span className="text-xs text-neutral-400 font-mono">
                              Studio Quality · Call Duration 00:{callSeconds < 10 ? `0${callSeconds}` : callSeconds}
                            </span>
                          </div>
                        </div>

                        {/* Live Quality Badge */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-cyan-300 font-medium">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                          <span>1080p HD Audio & Video</span>
                        </div>
                      </div>

                      {/* Oscillating Live Sound Visualizer */}
                      <div className="flex items-center justify-center gap-1.5 h-12 mb-6 px-4 bg-black/40 rounded-xl border border-white/5">
                        {[40, 75, 95, 60, 85, 50, 90, 70, 55, 80, 65, 45, 85, 100, 60, 45].map((h, i) => (
                          <div
                            key={i}
                            className="w-1.5 bg-gradient-to-t from-cyan-500 to-emerald-400 rounded-full animate-pulse"
                            style={{ 
                              height: `${h}%`,
                              animationDuration: `${300 + (i % 4) * 120}ms`
                            }}
                          />
                        ))}
                      </div>

                      {/* Interactive Call Controls */}
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => setIsCallMuted(!isCallMuted)}
                          className={`p-3 rounded-full transition-all cursor-pointer shadow-md ${
                            isCallMuted
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                              : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                          }`}
                          title={isCallMuted ? 'Unmute microphone' : 'Mute microphone'}
                        >
                          <Mic className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setIsCallVideoOn(!isCallVideoOn)}
                          className={`p-3 rounded-full transition-all cursor-pointer shadow-md ${
                            !isCallVideoOn
                              ? 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                              : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                          }`}
                          title={isCallVideoOn ? 'Turn off video' : 'Turn on video'}
                        >
                          <Video className="w-4 h-4" />
                        </button>

                        <div className="px-3.5 py-2 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-medium flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Direct Connection</span>
                        </div>

                        <button
                          onClick={() => setActiveShowcaseTab('messaging')}
                          className="p-3 rounded-full bg-red-600 hover:bg-red-500 text-white transition-all cursor-pointer shadow-lg shadow-red-600/30"
                          title="End preview"
                        >
                          <PhoneOff className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Capability 3: Encrypted Cloud Vault & Instant File Sharing */}
                {activeShowcaseTab === 'vault' && (
                  <div className="w-full max-w-2xl mx-auto animate-in fade-in zoom-in-98 duration-300 space-y-4">
                    {/* Storage Bar Overview */}
                    <div className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 shadow-lg">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-semibold text-white flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-cyan-400" />
                          <span>Aether Personal Vault</span>
                        </span>
                        <span className="text-neutral-400 font-mono">3.8 GB of 25 GB Used</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${vaultSyncProgress}%` }}
                        />
                      </div>
                    </div>

                    {/* Stored Files Showcase */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          name: 'Executive_Plan_2026.pdf',
                          size: '14.2 MB',
                          icon: <FileText className="w-5 h-5 text-cyan-400" />,
                          status: 'Ready in Vault',
                        },
                        {
                          name: 'Studio_Soundtrack.wav',
                          size: '48.0 MB',
                          icon: <Volume2 className="w-5 h-5 text-emerald-400" />,
                          status: 'Lossless Audio',
                        },
                        {
                          name: 'Brand_Assets_Pack.zip',
                          size: '112 MB',
                          icon: <HardDrive className="w-5 h-5 text-teal-400" />,
                          status: 'Instant Transfer',
                        },
                      ].map((file, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-neutral-900/90 border border-white/10 hover:border-cyan-500/40 transition-all shadow-md group"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="p-2 rounded-xl bg-white/5">{file.icon}</div>
                            <span className="text-[10px] text-emerald-400 font-mono font-medium">
                              {file.status}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-white truncate mb-1">
                            {file.name}
                          </p>
                          <div className="flex items-center justify-between text-[11px] text-neutral-400">
                            <span>{file.size}</span>
                            <Download className="w-3.5 h-3.5 text-neutral-500 group-hover:text-cyan-400 transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Zero-compression notice */}
                    <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-center text-xs text-cyan-300">
                      Files are transferred with original quality without compression or alterations.
                    </div>
                  </div>
                )}

                {/* Capability 4: Disappearing Messages (Self-Destruct Privacy) */}
                {activeShowcaseTab === 'ephemeral' && (
                  <div className="w-full max-w-xl mx-auto animate-in fade-in zoom-in-98 duration-300">
                    <div className="p-6 rounded-2xl bg-neutral-900/90 border border-white/10 shadow-2xl relative text-center">
                      {!isEphemeralVaporized ? (
                        <div>
                          {/* Active Burning Timer Pill */}
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/80 border border-red-800/70 text-red-300 text-xs font-semibold mb-4 animate-pulse">
                            <Flame className="w-3.5 h-3.5 text-red-400 animate-bounce" />
                            <span>Vaporizing in 0:0{ephemeralSeconds}s</span>
                          </div>

                          <div className="p-5 rounded-2xl bg-neutral-950 border border-red-500/30 mb-5 text-left relative overflow-hidden">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-neutral-400 font-mono">Confidential Note</span>
                              <span className="text-[10px] text-red-400 font-semibold uppercase">Auto-Erase</span>
                            </div>
                            <p className="text-sm font-semibold text-neutral-100">
                              Access Token: &ldquo;Alpha-Secure-9482&rdquo;
                            </p>
                            <p className="text-xs text-neutral-400 mt-1">
                              This message will vanish completely and leave zero memory traces.
                            </p>
                            
                            {/* Depleting progress line */}
                            <div className="w-full h-1 bg-neutral-800 rounded-full mt-4 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-red-500 to-amber-400 transition-all duration-1000"
                                style={{ width: `${(ephemeralSeconds / 4) * 100}%` }}
                              />
                            </div>
                          </div>

                          <p className="text-xs text-neutral-400">
                            Sent with timed self-destruction enabled. Once opened, it disappears forever.
                          </p>
                        </div>
                      ) : (
                        <div className="py-6 animate-in fade-in zoom-in-95 duration-400">
                          <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/10">
                            <ShieldCheck className="w-7 h-7" />
                          </div>
                          <h4 className="text-base font-bold text-white mb-1">
                            Message Permanently Vaporized
                          </h4>
                          <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-5">
                            Completely erased from devices and cache. Zero logs, zero trace.
                          </p>
                          <button
                            onClick={() => {
                              setIsEphemeralVaporized(false);
                              setEphemeralSeconds(4);
                              let count = 4;
                              const timer = setInterval(() => {
                                count--;
                                setEphemeralSeconds(count);
                                if (count <= 0) {
                                  clearInterval(timer);
                                  setIsEphemeralVaporized(true);
                                }
                              }, 1100);
                            }}
                            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all border border-white/10 cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Test Self-Destruct Again</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Showcase Bottom Bar: High-Value Advertising Highlights */}
              <div className="pt-5 border-t border-white/10 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
                <div className="flex items-center flex-wrap gap-4 sm:gap-6">
                  <div className="flex items-center gap-1.5 text-neutral-300">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Instant Speed</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-300">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Private by Design</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-300">
                    <Video className="w-3.5 h-3.5 text-teal-400" />
                    <span>Studio Quality</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Zero Data Tracking</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-neutral-500">Ready to explore?</span>
                  <button
                    onClick={onEnterApp}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Launch Web Experience</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>


        {/* 5 Master Advantages Grid (Minimal, High-End Aesthetic) */}
        <div className="w-full mb-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
              Crafted with uncompromising precision
            </h2>
            <p className="text-sm text-neutral-400 max-w-lg mx-auto">
              Everything essential for modern communication, stripped of distractions and clutter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Advantage 1 */}
            <div className="p-7 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 hover:border-emerald-500/40 transition-all duration-300 group hover:shadow-xl hover:shadow-emerald-500/5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/90 border border-emerald-800/70 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Highest-End Encryption
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Protected with verified zero-knowledge authenticated encryption. Keys live exclusively on your device, guaranteeing total immunity against eavesdropping and surveillance.
              </p>
            </div>

            {/* Advantage 2 */}
            <div className="p-7 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 hover:border-cyan-500/40 transition-all duration-300 group hover:shadow-xl hover:shadow-cyan-500/5">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/90 border border-cyan-800/70 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Instantaneous Delivery
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Lightning-fast message transmission with seamless edge delivery. Experience real-time typing indicators and immediate read receipts without lag.
              </p>
            </div>

            {/* Advantage 3 */}
            <div className="p-7 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 hover:border-teal-500/40 transition-all duration-300 group hover:shadow-xl hover:shadow-teal-500/5">
              <div className="w-12 h-12 rounded-2xl bg-teal-950/90 border border-teal-800/70 text-teal-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Studio-Quality Calls
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Crystal-clear hardware-accelerated video and voice calls. Test live camera preview, audio waveforms, and screen sharing in a distraction-free overlay.
              </p>
            </div>

            {/* Advantage 4 */}
            <div className="p-7 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 hover:border-amber-500/40 transition-all duration-300 group hover:shadow-xl hover:shadow-amber-500/5">
              <div className="w-12 h-12 rounded-2xl bg-amber-950/90 border border-amber-800/70 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Ephemeral Self-Destruct
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Send confidential messages that disappear automatically on an exact countdown timer. Nothing lingers in storage or memory.
              </p>
            </div>

            {/* Advantage 5 */}
            <div className="p-7 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 hover:border-blue-500/40 transition-all duration-300 group hover:shadow-xl hover:shadow-blue-500/5">
              <div className="w-12 h-12 rounded-2xl bg-blue-950/90 border border-blue-800/70 text-blue-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <HardDrive className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Integrated Cloud Drive
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Organize your documents, voice notes, and media in an encrypted cloud drive that synchronizes effortlessly across desktop and mobile.
              </p>
            </div>

            {/* Advantage 6 */}
            <div className="p-7 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 hover:border-purple-500/40 transition-all duration-300 group hover:shadow-xl hover:shadow-purple-500/5">
              <div className="w-12 h-12 rounded-2xl bg-purple-950/90 border border-purple-800/70 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Customizable Atmospheres
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Five tailored themes from Midnight Onyx to Cyber Azure and Crisp Minimal, pairing seamless dark mode with refined typography.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Final CTA */}
        <div className="text-center py-8">
          <button
            onClick={() => {
              setAuthMode('signup');
              setShowAuthModal(true);
            }}
            className="px-9 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-bold text-sm tracking-tight transition-all shadow-xl shadow-emerald-500/20 active:scale-95 cursor-pointer inline-flex items-center gap-2"
          >
            <span>Start Communicating Securely</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. Minimal, Round-Cornered Login / Registration Modal */}
      {showAuthModal && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAuthModal(false);
          }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-[410px] bg-neutral-900/95 border border-white/10 rounded-[2.5rem] p-7 sm:p-8 shadow-2xl backdrop-blur-2xl text-neutral-100 transition-all">
            {/* Minimal Close Button */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Subtle Brand Mark & Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-white text-neutral-950 font-bold text-base flex items-center justify-center tracking-tight shadow-sm shrink-0">
                Æ
              </div>
              <div>
                <h3 className="text-base font-semibold text-white tracking-tight">
                  {authMode === 'signup' ? 'Create Account' : 'Welcome Back'}
                </h3>
                <p className="text-xs text-neutral-400">
                  {authMode === 'signup' ? 'Sign up with your preferred method' : 'Sign in to continue to Aether'}
                </p>
              </div>
            </div>

            {/* Minimalist Segmented Pill Toggle (Sign Up / Sign In) */}
            <div className="flex p-1 bg-neutral-800/80 rounded-2xl mb-5">
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-neutral-700/90 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-neutral-700/90 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Sign In
              </button>
            </div>

            {/* 1. Fast 1-Click Providers: Google & Microsoft */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              {/* Google Button */}
              <button
                type="button"
                onClick={() => handleSocialAuth('google')}
                disabled={socialLoading !== null || isSubmitting}
                className="py-3 px-3 rounded-2xl bg-neutral-800/70 hover:bg-neutral-800 border border-neutral-700/40 hover:border-neutral-600 text-white text-xs font-medium flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {socialLoading === 'google' ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                )}
                <span>Google</span>
              </button>

              {/* Microsoft Button */}
              <button
                type="button"
                onClick={() => handleSocialAuth('microsoft')}
                disabled={socialLoading !== null || isSubmitting}
                className="py-3 px-3 rounded-2xl bg-neutral-800/70 hover:bg-neutral-800 border border-neutral-700/40 hover:border-neutral-600 text-white text-xs font-medium flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {socialLoading === 'microsoft' ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23">
                    <path fill="#f25022" d="M1 1h10v10H1z"/>
                    <path fill="#00a4ef" d="M1 12h10v10H1z"/>
                    <path fill="#7fba00" d="M12 1h10v10H12z"/>
                    <path fill="#ffb900" d="M12 12h10v10H12z"/>
                  </svg>
                )}
                <span>Microsoft</span>
              </button>
            </div>

            {/* Minimal Divider */}
            <div className="relative flex items-center justify-center mb-5">
              <div className="w-full border-t border-neutral-800" />
              <span className="absolute bg-neutral-900/95 px-3 text-[11px] text-neutral-400 font-medium tracking-wide">
                or continue with
              </span>
            </div>

            {/* 2. Method Switcher: Email vs Phone */}
            <div className="flex p-1 bg-neutral-800/60 rounded-2xl mb-4 border border-white/5">
              <button
                type="button"
                onClick={() => setAuthMethod('email')}
                className={`flex-1 py-2 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMethod === 'email'
                    ? 'bg-neutral-700/90 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('phone')}
                className={`flex-1 py-2 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMethod === 'phone'
                    ? 'bg-neutral-700/90 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Phone no</span>
              </button>
            </div>

            {/* Clean Minimalist Input Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authMode === 'signup' && (
                <div>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-4 py-3 text-xs sm:text-sm rounded-2xl bg-neutral-800/60 border border-neutral-700/40 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 focus:bg-neutral-800 transition-all"
                  />
                </div>
              )}

              {/* Conditional Email or Phone Inputs */}
              {authMethod === 'email' ? (
                <>
                  <div>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full px-4 py-3 text-xs sm:text-sm rounded-2xl bg-neutral-800/60 border border-neutral-700/40 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 focus:bg-neutral-800 transition-all"
                    />
                  </div>

                  <div>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full px-4 py-3 text-xs sm:text-sm rounded-2xl bg-neutral-800/60 border border-neutral-700/40 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 focus:bg-neutral-800 transition-all"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Phone Input with Country Code Selector */}
                  <div className="flex gap-2">
                    <select
                      value={authPhoneCountry}
                      onChange={(e) => setAuthPhoneCountry(e.target.value)}
                      className="px-3 py-3 text-xs sm:text-sm rounded-2xl bg-neutral-800/60 border border-neutral-700/40 text-neutral-200 focus:outline-none focus:border-neutral-400 focus:bg-neutral-800 transition-all cursor-pointer shrink-0"
                    >
                      <option value="+1" className="bg-neutral-900 text-white">+1 (US)</option>
                      <option value="+91" className="bg-neutral-900 text-white">+91 (IN)</option>
                      <option value="+44" className="bg-neutral-900 text-white">+44 (UK)</option>
                      <option value="+49" className="bg-neutral-900 text-white">+49 (DE)</option>
                      <option value="+61" className="bg-neutral-900 text-white">+61 (AU)</option>
                      <option value="+81" className="bg-neutral-900 text-white">+81 (JP)</option>
                      <option value="+33" className="bg-neutral-900 text-white">+33 (FR)</option>
                      <option value="+971" className="bg-neutral-900 text-white">+971 (UAE)</option>
                    </select>
                    <input
                      type="tel"
                      required
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      placeholder="Mobile number"
                      className="flex-1 min-w-0 px-4 py-3 text-xs sm:text-sm rounded-2xl bg-neutral-800/60 border border-neutral-700/40 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 focus:bg-neutral-800 transition-all"
                    />
                  </div>

                  <div>
                    <input
                      type="password"
                      required
                      value={authPhoneCode}
                      onChange={(e) => setAuthPhoneCode(e.target.value)}
                      placeholder={authMode === 'signup' ? "Set PIN / Password" : "SMS Code or PIN"}
                      className="w-full px-4 py-3 text-xs sm:text-sm rounded-2xl bg-neutral-800/60 border border-neutral-700/40 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 focus:bg-neutral-800 transition-all"
                    />
                  </div>
                </>
              )}

              {/* Minimalist Action Button */}
              <button
                type="submit"
                disabled={isSubmitting || socialLoading !== null}
                className="w-full mt-2 py-3.5 rounded-2xl bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-xs sm:text-sm tracking-tight transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                <span>
                  {isSubmitting
                    ? 'Entering...'
                    : authMethod === 'email'
                    ? (authMode === 'signup' ? 'Create Account with Email' : 'Sign In with Email')
                    : (authMode === 'signup' ? 'Create Account with Phone' : 'Sign In with Phone')}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Subtle Minimal Footer Switcher */}
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
                className="text-xs text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
              >
                {authMode === 'signup' ? (
                  <span>Already have an account? <span className="text-white font-medium underline underline-offset-4">Sign In</span></span>
                ) : (
                  <span>Don't have an account? <span className="text-white font-medium underline underline-offset-4">Sign Up</span></span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
