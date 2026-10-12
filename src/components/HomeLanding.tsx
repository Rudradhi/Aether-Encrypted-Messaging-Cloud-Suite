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
  Volume2
} from 'lucide-react';

interface HomeLandingProps {
  onEnterApp: () => void;
  onLoginSuccess?: (userData: { name: string; email: string; isNewUser: boolean }) => void;
}

export const HomeLanding: React.FC<HomeLandingProps> = ({ onEnterApp, onLoginSuccess }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  
  // Login / Join decorated popup modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cinematic Storyboard Animation States:
  // 'typing' -> 'message_ready' -> 'recording' -> 'voice_playing' -> 'call_active' -> 'quote_reveal'
  const [storyStep, setStoryStep] = useState<
    'typing' | 'message_ready' | 'recording' | 'voice_playing' | 'call_active' | 'quote_reveal'
  >('typing');

  const [typedMessage, setTypedMessage] = useState('');
  const [goldenQuoteText, setGoldenQuoteText] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(1);
  const [voicePlaybackProgress, setVoicePlaybackProgress] = useState(0);

  const fullMessage = "Welcome to Aether. Every conversation is protected with verified zero-knowledge privacy.";
  const fullGoldenQuote = "ZERO LOG TRACES. COMPLETE PRIVACY. PEACE OF MIND!!";

  useEffect(() => {
    let isMounted = true;
    let sequenceTimeout: NodeJS.Timeout;

    const runLoop = () => {
      if (!isMounted) return;

      // 1. Typing stage
      setStoryStep('typing');
      setTypedMessage('');
      setGoldenQuoteText('');
      setVoicePlaybackProgress(0);

      let msgCharIdx = 0;
      const typeInterval = setInterval(() => {
        if (!isMounted) {
          clearInterval(typeInterval);
          return;
        }
        msgCharIdx++;
        setTypedMessage(fullMessage.slice(0, msgCharIdx));
        if (msgCharIdx >= fullMessage.length) {
          clearInterval(typeInterval);
          setStoryStep('message_ready');

          // 2. Start recording voice note after 1.2s
          sequenceTimeout = setTimeout(() => {
            if (!isMounted) return;
            setStoryStep('recording');
            setRecordingSeconds(1);

            const recTimer = setInterval(() => {
              setRecordingSeconds(s => (s < 4 ? s + 1 : s));
            }, 1000);

            // 3. Finish recording and play voice note after 3.2s
            sequenceTimeout = setTimeout(() => {
              if (!isMounted) return;
              clearInterval(recTimer);
              setStoryStep('voice_playing');

              // Playback progress ticker with up/down waveforms
              let progress = 0;
              const playTimer = setInterval(() => {
                progress += 5;
                setVoicePlaybackProgress(Math.min(100, progress));
                if (progress >= 100) clearInterval(playTimer);
              }, 150);

              // 4. Pop up Call Screenshot & functions after 4.2s
              sequenceTimeout = setTimeout(() => {
                if (!isMounted) return;
                clearInterval(playTimer);
                setStoryStep('call_active');

                // 5. Automatically close call and reveal Golden Quote after 4.5s
                sequenceTimeout = setTimeout(() => {
                  if (!isMounted) return;
                  setStoryStep('quote_reveal');

                  // Type out golden quote
                  let quoteIdx = 0;
                  const quoteInterval = setInterval(() => {
                    if (!isMounted) {
                      clearInterval(quoteInterval);
                      return;
                    }
                    quoteIdx++;
                    setGoldenQuoteText(fullGoldenQuote.slice(0, quoteIdx));
                    if (quoteIdx >= fullGoldenQuote.length) {
                      clearInterval(quoteInterval);

                      // 6. Pause to admire, then restart loop
                      sequenceTimeout = setTimeout(() => {
                        if (isMounted) runLoop();
                      }, 5000);
                    }
                  }, 40);

                }, 4500);
              }, 4200);
            }, 3200);
          }, 1200);
        }
      }, 30);
    };

    runLoop();

    return () => {
      isMounted = false;
      clearTimeout(sequenceTimeout);
    };
  }, []);

  const [scrollY, setScrollY] = useState(0);

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

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowAuthModal(false);
      if (onLoginSuccess) {
        onLoginSuccess({
          name: authName.trim() || (authMode === 'login' ? (authEmail.split('@')[0] || 'Rudradhi Indra') : 'Rudradhi Indra'),
          email: authEmail.trim() || 'rudradhi@aether.network',
          isNewUser: authMode === 'signup',
        });
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
          <h1 className="text-7xl sm:text-9xl md:text-[11.5rem] font-black tracking-[-0.05em] uppercase bg-gradient-to-b from-white via-neutral-100 to-neutral-500 bg-clip-text text-transparent select-none drop-shadow-2xl leading-none">
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

        {/* Interactive Live Glass Preview Widget with Full Animation Storyboard */}
        <div className="w-full max-w-4xl p-1 rounded-3xl bg-gradient-to-b from-neutral-700/40 via-neutral-850/50 to-neutral-900/80 backdrop-blur-xl shadow-2xl mb-24 relative">
          <div className="bg-neutral-950/90 rounded-[22px] p-6 sm:p-8 border border-neutral-800/80 overflow-hidden relative min-h-[460px] flex flex-col justify-between">
            
            {/* Top Bar inside Preview */}
            <div className="flex items-center justify-between border-b border-neutral-800/70 pb-4 mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-800 ring-2 ring-emerald-500/40 overflow-hidden shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&h=128&q=80"
                    alt="Rudradhi"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white tracking-tight">Rudradhi Indra</span>
                    <span className="text-[10px] font-['Roboto',sans-serif] font-bold tracking-wider text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2.5 py-0.5 rounded-full shadow-xs">
                      Founder
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-['Roboto',sans-serif] font-medium text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-800/60">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Highest-End Encryption</span>
                    </span>
                  </div>
                  <span className="text-xs text-neutral-400 font-mono mt-0.5 block">Active now</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setAuthMode('signup');
                    setShowAuthModal(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-bold text-xs tracking-tight transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            </div>

            {/* Mock Message Feed & Animated Storyboard */}
            <div className="space-y-4 max-w-2xl mx-auto py-2 w-full flex-1">
              {/* Message 1: Typing & Sent Animation */}
              <div className="flex flex-col items-start transition-all duration-300">
                {storyStep === 'typing' && (
                  <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono mb-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Rudradhi Indra is typing message...</span>
                  </div>
                )}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 max-w-lg text-xs sm:text-sm text-neutral-200 leading-relaxed shadow-sm transition-all">
                  <span>{storyStep === 'typing' ? typedMessage : fullMessage}</span>
                  {storyStep === 'typing' && (
                    <span className="inline-block w-1.5 h-3.5 ml-1 bg-emerald-400 animate-pulse align-middle" />
                  )}
                  <div className="text-[10px] text-neutral-500 mt-2 font-mono flex items-center justify-end gap-1">
                    <span>10:42 AM</span>
                    {storyStep !== 'typing' && (
                      <CheckCheck className="w-3 h-3 text-cyan-400 inline" />
                    )}
                  </div>
                </div>
              </div>

              {/* Message 2: Voice Note Recording & Dynamic Up/Down Playback Animation */}
              {storyStep === 'recording' && (
                <div className="flex flex-col items-end animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-red-950/40 border border-red-800/60 rounded-2xl p-4 max-w-md w-full text-xs text-red-200 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                      <span className="font-mono text-xs font-semibold">Recording Voice Memo... 0:0{recordingSeconds}</span>
                    </div>
                    {/* Live oscillating recording levels */}
                    <div className="flex items-center gap-1 h-5">
                      {[30, 80, 45, 95, 60, 90, 40].map((h, i) => (
                        <div
                          key={i}
                          className="w-1 bg-red-400 rounded-full animate-pulse"
                          style={{ height: `${h}%`, animationDuration: `${300 + i * 80}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {storyStep !== 'typing' && storyStep !== 'recording' && (
                <div className="flex flex-col items-end animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-neutral-800 border border-neutral-700/60 rounded-2xl p-4 max-w-md text-xs sm:text-sm text-white leading-relaxed shadow-sm">
                    <div className="flex items-center gap-3">
                      <button
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-transform active:scale-95 cursor-pointer shrink-0"
                      >
                        {storyStep === 'voice_playing' ? (
                          <Pause className="w-4 h-4 fill-current text-emerald-400" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5 text-emerald-400" />
                        )}
                      </button>

                      {/* Equalizer Waveform with Up/Down fluid jump animation */}
                      <div className="flex items-center gap-1 h-6 flex-1">
                        {[25, 65, 45, 95, 80, 50, 90, 100, 75, 60, 85, 70, 50, 35].map((h, i) => {
                          const barPct = (i / 14) * 100;
                          const isPassed = voicePlaybackProgress >= barPct;
                          return (
                            <div
                              key={i}
                              className={`w-1 rounded-full transition-all duration-150 ${
                                isPassed
                                  ? 'bg-emerald-400 scale-y-125'
                                  : 'bg-neutral-400'
                              } ${storyStep === 'voice_playing' ? 'animate-bounce' : ''}`}
                              style={{ 
                                height: `${h}%`,
                                animationDuration: `${400 + (i % 4) * 120}ms`
                              }}
                            />
                          );
                        })}
                      </div>
                      <span className="text-[11px] font-mono opacity-80 tabular-nums">
                        {storyStep === 'voice_playing' ? '0:08' : '0:14'}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-2 font-mono flex items-center justify-end gap-1">
                      <span>10:43 AM</span>
                      <CheckCheck className="w-3 h-3 text-cyan-400 inline" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 4: Video / Audio Call Overlay Showcase (Auto appears, introduces features, then auto closes) */}
            {storyStep === 'call_active' && (
              <div className="absolute inset-0 bg-neutral-950/95 backdrop-blur-xl z-30 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-400 select-none">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full bg-emerald-500/20 animate-ping absolute inset-0" />
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80"
                    alt="Rudradhi Indra"
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-emerald-500/60 relative z-10 shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-lg font-bold text-white tracking-tight">Rudradhi Indra</h4>
                  <span className="text-[10px] font-['Roboto',sans-serif] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800">
                    Founder
                  </span>
                </div>

                <p className="text-xs text-neutral-400 font-mono mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Audio & Video Call Connected</span>
                </p>

                {/* Animated Voice Equalizer Pulse */}
                <div className="flex items-center gap-1.5 h-10 mb-6">
                  {[35, 75, 100, 60, 90, 45, 85, 70, 50, 80, 65, 40].map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-emerald-400 rounded-full animate-pulse"
                      style={{ height: `${h}%`, animationDuration: `${350 + (i % 3) * 150}ms` }}
                    />
                  ))}
                </div>

                {/* Function Introductions */}
                <div className="grid grid-cols-3 gap-3 w-full max-w-sm mb-6 text-center">
                  <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                    <Mic className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                    <span className="text-[10px] text-neutral-300 font-['Roboto',sans-serif] font-medium block">Studio Audio</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                    <Video className="w-4 h-4 mx-auto mb-1 text-teal-400" />
                    <span className="text-[10px] text-neutral-300 font-['Roboto',sans-serif] font-medium block">Hardware HD</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                    <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
                    <span className="text-[10px] text-neutral-300 font-['Roboto',sans-serif] font-medium block">Secure Stream</span>
                  </div>
                </div>

                {/* Control buttons */}
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 rounded-full bg-neutral-800 text-white shadow-md">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div className="p-3 rounded-full bg-neutral-800 text-white shadow-md">
                    <Video className="w-4 h-4" />
                  </div>
                  <div className="p-3 rounded-full bg-red-600 text-white shadow-md shadow-red-600/30">
                    <PhoneOff className="w-4 h-4" />
                  </div>
                </div>

                <span className="text-[11px] text-neutral-500 font-mono mt-2">
                  Auto-closing showcase...
                </span>
              </div>
            )}

            {/* Step 5: Golden Outro on a Pure Black Screen within the Chatbox */}
            {storyStep === 'quote_reveal' && (
              <div className="absolute inset-0 bg-black z-30 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 select-none">
                {/* Glowing golden ambient aura */}
                <div className="w-[420px] h-48 bg-amber-500/15 blur-[100px] rounded-full pointer-events-none absolute" />

                <div className="inline-flex items-center gap-2 mb-4 text-amber-400 text-xs font-['Roboto',sans-serif] tracking-widest uppercase relative z-10">
                  <Sparkles className="w-4 h-4 animate-spin text-amber-400" style={{ animationDuration: '6s' }} />
                  <span>The Aether Guarantee · By Rudradhi Indra</span>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-400" style={{ animationDuration: '6s' }} />
                </div>

                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-wider uppercase bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(251,191,36,0.7)] leading-tight max-w-2xl relative z-10 font-['Roboto',sans-serif]">
                  {goldenQuoteText}
                  <span className="inline-block w-2.5 h-7 ml-2 bg-amber-400 animate-pulse align-middle" />
                </h3>
              </div>
            )}

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

      {/* 4. Decorated Glass Login / Join Popup Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-[1px] rounded-3xl bg-gradient-to-b from-emerald-500/40 via-teal-500/20 to-neutral-800 shadow-2xl">
            <div className="bg-neutral-950/95 rounded-[23px] p-6 sm:p-8 backdrop-blur-2xl border border-neutral-800/80 relative">
              {/* Close Button */}
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-5 right-5 p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-850 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Decorative Brand Emblem */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-neutral-950 font-bold text-xl tracking-tighter mb-5 shadow-lg shadow-emerald-500/30">
                Æ
              </div>

              <h3 className="text-xl font-bold text-white tracking-tight mb-1">
                {authMode === 'signup' ? 'Create your Aether identity' : 'Welcome back to Aether'}
              </h3>
              <p className="text-xs text-neutral-400 mb-6">
                {authMode === 'signup' 
                  ? 'Zero-knowledge registration. Your keypair is generated directly on this device.'
                  : 'Enter your credentials to decrypt your synchronized workspace.'}
              </p>

              {/* Switcher Tab */}
              <div className="flex p-1 bg-neutral-900 rounded-xl mb-6 border border-neutral-800">
                <button
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-neutral-800 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
                <button
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-neutral-800 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'signup' && (
                  <div>
                    <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                      Name or Pseudonym
                    </label>
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                    Email or Unique Identifier
                  </label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                    Password / Master Key
                  </label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-neutral-950 font-bold text-xs tracking-tight transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 mt-4"
                >
                  <span>{isSubmitting ? 'Securing Identity...' : authMode === 'signup' ? 'Complete Join & Enter' : 'Unlock & Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-neutral-850 flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 font-mono">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Protected by Highest-End Encryption</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
