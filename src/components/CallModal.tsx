/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Monitor, 
  Wifi, 
  Maximize2,
  Minimize2,
  RefreshCw
} from 'lucide-react';
import { Contact, CallSession } from '../types';
import { sounds } from '../services/soundEffects';

interface CallModalProps {
  callSession: CallSession;
  contact: Contact;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  callSession,
  contact,
  onEndCall,
  onToggleMute,
  onToggleVideo,
}) => {
  const [durationSec, setDurationSec] = useState(0);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioMeter, setAudioMeter] = useState(45);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Initialize live MediaStream from user camera & microphone
  useEffect(() => {
    let active = true;

    const initMedia = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: callSession.type === 'video',
            audio: true,
          });

          if (!active) {
            stream.getTracks().forEach(t => t.stop());
            return;
          }

          localStreamRef.current = stream;
          setHasCameraPermission(true);

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        // Fallback gracefully if camera/mic is blocked or already in use
        setHasCameraPermission(false);
      }
    };

    initMedia();

    return () => {
      active = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [callSession.type]);

  // Duration timer & audio level simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setDurationSec(prev => prev + 1);
      // Realistic speech pulse fluctuation
      setAudioMeter(Math.floor(Math.random() * 55) + 30);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Screen share toggle
  const handleToggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = screenStream;
          }
          setIsScreenSharing(true);
          screenStream.getVideoTracks()[0].onended = () => {
            setIsScreenSharing(false);
            if (localStreamRef.current && localVideoRef.current) {
              localVideoRef.current.srcObject = localStreamRef.current;
            }
          };
        } else {
          setIsScreenSharing(true);
        }
      } catch {
        setIsScreenSharing(false);
      }
    } else {
      setIsScreenSharing(false);
      if (localStreamRef.current && localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    }
  };

  const formattedTime = `${Math.floor(durationSec / 60)
    .toString()
    .padStart(2, '0')}:${(durationSec % 60).toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 bg-neutral-950/95 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200">
      <div
        className={`w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl relative transition-all ${
          isFullscreen ? 'h-full max-w-none rounded-none' : 'h-[85vh] max-h-[720px]'
        }`}
      >
        {/* Top Floating Overlay Info */}
        <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-20 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/30 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 bg-neutral-800 shrink-0">
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                  {contact.name}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono tabular-nums mt-0.5">
                <span>{formattedTime}</span>
                <span>·</span>
                <span className="text-emerald-400 font-medium">Connected</span>
              </div>
            </div>
          </div>

          {/* Controls: Fullscreen */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Video / Call Centerstage */}
        <div className="flex-1 relative bg-neutral-950 flex items-center justify-center overflow-hidden">
          {callSession.type === 'video' ? (
            <div className="w-full h-full relative">
              {/* Remote Participant Feed */}
              <div className="w-full h-full flex flex-col items-center justify-center relative bg-gradient-to-b from-neutral-900 to-neutral-950">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover ring-4 ring-emerald-500/20 shadow-2xl"
                  referrerPolicy="no-referrer"
                />

                {/* Animated Speech Ring Waveform */}
                <div className="flex items-center gap-1 mt-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-emerald-500/80 rounded-full transition-all duration-150"
                      style={{
                        height: `${Math.max(6, (audioMeter * ((i % 4) + 1)) / 3.5)}px`,
                      }}
                    />
                  ))}
                </div>

                <p className="text-xs text-neutral-400 mt-3 font-medium">
                  {contact.name} is speaking...
                </p>
              </div>

              {/* Local PiP Video Stream (Real WebRTC getUserMedia) */}
              <div className="absolute bottom-24 right-4 sm:right-6 w-36 sm:w-52 aspect-video bg-neutral-900 rounded-xl overflow-hidden border border-neutral-700 shadow-2xl z-20">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${
                    !callSession.isVideoEnabled ? 'hidden' : ''
                  }`}
                />
                {!callSession.isVideoEnabled && (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 text-xs">
                    <VideoOff className="w-5 h-5 mb-1" />
                    <span>Camera off</span>
                  </div>
                )}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white font-mono">
                  You
                </div>
              </div>
            </div>
          ) : (
            /* Voice Call Screen */
            <div className="flex flex-col items-center justify-center text-center p-6">
              <div className="relative mb-6">
                <div
                  className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"
                  style={{ animationDuration: '3s' }}
                />
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-32 h-32 rounded-full object-cover ring-4 ring-emerald-500/40 relative z-10"
                  referrerPolicy="no-referrer"
                />
              </div>

              <h2 className="text-xl font-bold text-white mb-1">{contact.name}</h2>
              <p className="text-xs text-neutral-400 mb-4">{contact.role || 'Voice Call Connected'}</p>

              {/* Voice pulse waveform */}
              <div className="flex items-center gap-1.5 h-10 mb-4">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-emerald-400 rounded-full transition-all duration-150"
                    style={{
                      height: `${Math.max(8, (audioMeter * ((i % 5) + 1)) / 4)}px`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="h-20 bg-neutral-900 border-t border-neutral-800 px-6 flex items-center justify-center gap-3 sm:gap-4 shrink-0 z-20">
          {/* Mute Mic */}
          <button
            onClick={onToggleMute}
            className={`p-3.5 rounded-full transition-all cursor-pointer ${
              callSession.isMuted
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                : 'bg-neutral-800 text-white hover:bg-neutral-700'
            }`}
            title={callSession.isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {callSession.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Toggle Video */}
          <button
            onClick={onToggleVideo}
            className={`p-3.5 rounded-full transition-all cursor-pointer ${
              !callSession.isVideoEnabled
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                : 'bg-neutral-800 text-white hover:bg-neutral-700'
            }`}
            title={callSession.isVideoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {!callSession.isVideoEnabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          {/* Screen Share */}
          <button
            onClick={handleToggleScreenShare}
            className={`p-3.5 rounded-full transition-all cursor-pointer ${
              isScreenSharing
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-neutral-800 text-white hover:bg-neutral-700'
            }`}
            title="Share Screen"
          >
            <Monitor className="w-5 h-5" />
          </button>

          {/* Speaker Audio */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`p-3.5 rounded-full transition-all cursor-pointer ${
              !isSpeakerOn
                ? 'bg-neutral-800 text-neutral-500'
                : 'bg-neutral-800 text-white hover:bg-neutral-700'
            }`}
            title={isSpeakerOn ? 'Mute Speaker' : 'Enable Speaker'}
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* End Call (Red Pill Button) */}
          <button
            onClick={() => {
              sounds.playCallEnd();
              onEndCall();
            }}
            className="px-6 py-3.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-medium transition-all flex items-center gap-2 shadow-lg shadow-red-600/30 active:scale-95 cursor-pointer ml-2"
            title="End Call"
          >
            <PhoneOff className="w-5 h-5" />
            <span className="text-xs sm:text-sm font-semibold">End Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};
