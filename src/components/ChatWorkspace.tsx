/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Phone, 
  Video, 
  ShieldCheck, 
  Clock, 
  HardDrive, 
  Paperclip, 
  Mic, 
  Send, 
  Check, 
  CheckCheck, 
  Play, 
  Pause, 
  Download, 
  Smile, 
  X, 
  FileText, 
  Lock, 
  Info,
  Flame,
  CornerDownRight,
  ChevronDown,
  Trash2
} from 'lucide-react';
import { Contact, Message, ChatTheme, DriveFile } from '../types';
import { sounds } from '../services/soundEffects';
import { encryptChaCha20, getOrCreateConversationKey } from '../services/cryptoService';

interface ChatWorkspaceProps {
  contact: Contact;
  messages: Message[];
  onSendMessage: (msg: Partial<Message>) => void;
  onStartCall: (type: 'voice' | 'video') => void;
  onOpenEncryptionModal: () => void;
  onOpenDriveModal: () => void;
  activeTheme: ChatTheme;
  driveFiles: DriveFile[];
  onDeleteMessage?: (msgId: string) => void;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  contact,
  messages,
  onSendMessage,
  onStartCall,
  onOpenEncryptionModal,
  onOpenDriveModal,
  activeTheme,
  driveFiles,
  onDeleteMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const [ephemeralTime, setEphemeralTime] = useState<number>(0); // 0 = off
  const [showEphemeralMenu, setShowEphemeralMenu] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showDrivePicker, setShowDrivePicker] = useState(false);

  // Audio voice note recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingLevel, setRecordingLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);

  // Voice playback state
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const playbackIntervalRef = useRef<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice note recording simulation / media recorder
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      setRecordingSeconds(0);
      setIsRecording(true);

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
        if (stream) {
          const recorder = new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunksRef.current.push(e.data);
          };
          recorder.start();
        }
      }

      recordTimerRef.current = window.setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
        setRecordingLevel(Math.floor(Math.random() * 80) + 20);
      }, 1000);
    } catch {
      setIsRecording(true);
    }
  };

  const cancelRecording = () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const finishRecording = () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    const duration = Math.max(1, recordingSeconds);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }

    // Generate simulated waveform
    const waveform = Array.from({ length: 20 }, () => Math.floor(Math.random() * 75) + 25);

    // Send voice message
    onSendMessage({
      type: 'voice',
      text: 'Voice note',
      voiceData: {
        durationSec: duration,
        waveform,
      },
      ephemeralSeconds: ephemeralTime > 0 ? ephemeralTime : undefined,
    });

    setIsRecording(false);
    setRecordingSeconds(0);
    sounds.playSent();
  };

  // Handle Play voice note
  const togglePlayVoice = (msgId: string, durationSec: number) => {
    if (playingVoiceId === msgId) {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
      setPlayingVoiceId(null);
      setPlaybackProgress(0);
    } else {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
      setPlayingVoiceId(msgId);
      setPlaybackProgress(0);

      const stepMs = 100;
      const totalSteps = (durationSec * 1000) / stepMs;
      let currentStep = 0;

      playbackIntervalRef.current = window.setInterval(() => {
        currentStep++;
        const pct = Math.min(100, (currentStep / totalSteps) * 100);
        setPlaybackProgress(pct);

        if (pct >= 100) {
          if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
          setPlayingVoiceId(null);
          setPlaybackProgress(0);
        }
      }, stepMs);
    }
  };

  // Text message send
  const handleSend = () => {
    if (!inputText.trim()) return;

    // Encrypt with ChaCha20-Poly1305
    const key = getOrCreateConversationKey(contact.id);
    const cipherResult = encryptChaCha20(inputText.trim(), key);

    onSendMessage({
      type: 'text',
      text: inputText.trim(),
      replyToId: replyingTo?.id,
      ephemeralSeconds: ephemeralTime > 0 ? ephemeralTime : undefined,
      isEncrypted: true,
      cipherMeta: {
        algorithm: 'ChaCha20-Poly1305 (RFC 8439)',
        nonceHex: cipherResult.nonceHex,
        macTagHex: cipherResult.macTagHex,
        ciphertextHex: cipherResult.ciphertextHex,
        keyFingerprint: 'SHA256: ' + cipherResult.macTagHex.slice(0, 8),
      },
    });

    setInputText('');
    setReplyingTo(null);
    sounds.playSent();
  };

  // File upload from disk
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImg = file.type.startsWith('image/');
    const previewUrl = isImg ? URL.createObjectURL(file) : undefined;

    onSendMessage({
      type: 'file',
      text: file.name,
      fileData: {
        name: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        url: '#',
        previewUrl,
        category: isImg ? 'image' : 'document',
      },
      ephemeralSeconds: ephemeralTime > 0 ? ephemeralTime : undefined,
    });

    setShowAttachMenu(false);
    sounds.playSent();
  };

  // Share file from Cloud Drive
  const handleShareDriveFile = (file: DriveFile) => {
    onSendMessage({
      type: 'file',
      text: file.name,
      fileData: {
        id: file.id,
        name: file.name,
        size: file.size,
        mimeType: file.type === 'image' ? 'image/png' : 'application/pdf',
        url: file.url,
        previewUrl: file.type === 'image' ? file.url : undefined,
        category: file.type,
      },
      ephemeralSeconds: ephemeralTime > 0 ? ephemeralTime : undefined,
    });

    setShowDrivePicker(false);
    setShowAttachMenu(false);
    sounds.playSent();
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-neutral-50 dark:bg-neutral-950 overflow-hidden relative">
      {/* Top Bar / Header */}
      <header className="h-16 px-5 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={contact.avatar}
              alt={contact.name}
              className="w-10 h-10 rounded-full object-cover bg-neutral-200 dark:bg-neutral-800"
              referrerPolicy="no-referrer"
            />
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-neutral-900 ${
                contact.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {contact.name}
              </h2>
            </div>

            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {contact.status === 'online' ? 'Active now' : contact.lastSeen || 'Offline'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Ephemeral Timer Selector */}
          <div className="relative">
            <button
              onClick={() => setShowEphemeralMenu(!showEphemeralMenu)}
              className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs ${
                ephemeralTime > 0
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-medium'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              title="Disappearing Ephemeral Messages"
            >
              <Clock className="w-4 h-4" />
              {ephemeralTime > 0 && (
                <span className="font-mono text-[10px]">
                  {ephemeralTime >= 3600 ? `${ephemeralTime / 3600}h` : `${ephemeralTime}s`}
                </span>
              )}
            </button>

            {showEphemeralMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 py-1.5 z-50 text-xs">
                <div className="px-3 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Disappearing Messages
                </div>
                {[
                  { label: 'Off', sec: 0 },
                  { label: '5 seconds', sec: 5 },
                  { label: '30 seconds', sec: 30 },
                  { label: '1 minute', sec: 60 },
                  { label: '1 hour', sec: 3600 },
                  { label: '24 hours', sec: 86400 },
                ].map(opt => (
                  <button
                    key={opt.sec}
                    onClick={() => {
                      setEphemeralTime(opt.sec);
                      setShowEphemeralMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer ${
                      ephemeralTime === opt.sec
                        ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                        : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {ephemeralTime === opt.sec && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Voice Call */}
          <button
            onClick={() => onStartCall('voice')}
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            title="Encrypted Voice Call"
          >
            <Phone className="w-4 h-4" />
          </button>

          {/* Video Call */}
          <button
            onClick={() => onStartCall('video')}
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            title="Encrypted Video Call"
          >
            <Video className="w-4 h-4" />
          </button>

          {/* Cloud Drive Attach Shortcut */}
          <button
            onClick={onOpenDriveModal}
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Open Integrated Cloud Drive"
          >
            <HardDrive className="w-4 h-4" />
          </button>

        </div>
      </header>

      {/* Ephemeral Notice Banner */}
      {ephemeralTime > 0 && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-between text-[11px] text-amber-700 dark:text-amber-300 shrink-0">
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>
              Disappearing messages active: {ephemeralTime >= 3600 ? `${ephemeralTime / 3600} hours` : `${ephemeralTime} seconds`}
            </span>
          </div>
          <button
            onClick={() => setEphemeralTime(0)}
            className="text-[10px] underline hover:no-underline cursor-pointer"
          >
            Disable
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4 flex flex-col">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto select-none">
            <div className="w-16 h-16 rounded-full overflow-hidden mb-4 ring-4 ring-emerald-500/20 bg-neutral-100 dark:bg-neutral-800">
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight mb-1">
              {contact.name}
            </h3>
            <p className="text-xs text-neutral-400 mb-6 max-w-xs leading-relaxed">
              {contact.role ? `${contact.role} · ` : ''}{contact.username}
            </p>
            <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-850/80 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400 max-w-sm">
              <p className="mb-2 text-neutral-700 dark:text-neutral-200 font-medium">Say hello to get started</p>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Send a message, voice memo, or file below.
              </p>
            </div>
          </div>
        )}

        {/* Message Items */}
        {messages.map((msg) => {
          const isMe = msg.senderId === 'me';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative`}
            >
              {/* Replying snippet */}
              {msg.replyToId && (
                <div className="text-[10px] text-neutral-400 mb-1 flex items-center gap-1 px-2">
                  <CornerDownRight className="w-3 h-3" />
                  <span>Replying to previous message</span>
                </div>
              )}

              {/* Bubble Body */}
              <div
                className={`max-w-[85%] sm:max-w-md md:max-w-lg rounded-2xl p-3.5 transition-all relative ${
                  isMe ? activeTheme.bubbleSelf : activeTheme.bubbleOther
                }`}
              >
                {/* Ephemeral Burn Badge */}
                {msg.ephemeralSeconds && (
                  <div className="flex items-center gap-1 text-[10px] text-amber-400 font-mono mb-1.5 pb-1 border-b border-white/10">
                    <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
                    <span>Disappearing message · {msg.ephemeralSeconds}s</span>
                  </div>
                )}

                {/* Content: Text */}
                {msg.type === 'text' && (
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {msg.text}
                  </p>
                )}

                {/* Content: Voice note */}
                {msg.type === 'voice' && msg.voiceData && (
                  <div className="flex items-center gap-3 py-1 min-w-[200px]">
                    <button
                      onClick={() => togglePlayVoice(msg.id, msg.voiceData!.durationSec)}
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-transform active:scale-95 cursor-pointer shrink-0"
                    >
                      {playingVoiceId === msg.id ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>

                    {/* Waveform Visualization */}
                    <div className="flex-1 flex items-center gap-0.5 h-6">
                      {msg.voiceData.waveform.map((barHeight, idx) => {
                        const barPct = (idx / msg.voiceData!.waveform.length) * 100;
                        const isPassed = playingVoiceId === msg.id && playbackProgress >= barPct;

                        return (
                          <div
                            key={idx}
                            className={`flex-1 rounded-full transition-all duration-150 ${
                              isPassed ? 'bg-white opacity-100 scale-y-110' : 'bg-white/40'
                            }`}
                            style={{ height: `${barHeight}%` }}
                          />
                        );
                      })}
                    </div>

                    <span className="text-[11px] font-mono tabular-nums opacity-80 shrink-0">
                      {Math.floor(msg.voiceData.durationSec / 60)}:
                      {(msg.voiceData.durationSec % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}

                {/* Content: File attachment */}
                {msg.type === 'file' && msg.fileData && (
                  <div className="flex flex-col gap-2">
                    {msg.fileData.previewUrl && (
                      <div className="rounded-lg overflow-hidden max-h-48 bg-neutral-900/50">
                        <img
                          src={msg.fileData.previewUrl}
                          alt={msg.fileData.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-2 rounded-xl bg-black/10 dark:bg-white/5 border border-white/10">
                      <div className="p-2 rounded-lg bg-white/10 text-current shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium truncate">
                          {msg.fileData.name}
                        </div>
                        <div className="text-[10px] opacity-75 font-mono tabular-nums">
                          {(msg.fileData.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                      <a
                        href={msg.fileData.url}
                        download={msg.fileData.name}
                        className="p-1.5 rounded-lg hover:bg-white/20 transition-colors shrink-0"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Metadata Footer: Timestamp + Status */}
                <div className="flex items-center justify-end gap-1.5 mt-1.5 text-[10px] opacity-70 font-mono tabular-nums">
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  {isMe && (
                    <span>
                      {msg.status === 'read' ? (
                        <span title="Read"><CheckCheck className="w-3 h-3 text-cyan-300 inline" /></span>
                      ) : msg.status === 'delivered' ? (
                        <span title="Delivered"><CheckCheck className="w-3 h-3 inline" /></span>
                      ) : (
                        <span title="Sent"><Check className="w-3 h-3 inline" /></span>
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* Hover Actions: Reply & Delete */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 text-[11px] text-neutral-400">
                <button
                  onClick={() => setReplyingTo(msg)}
                  className="px-2 py-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Reply
                </button>
                {onDeleteMessage && (
                  <button
                    onClick={() => onDeleteMessage(msg.id)}
                    className="p-1 rounded hover:text-red-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    title="Delete message"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quoted Reply Banner */}
      {replyingTo && (
        <div className="px-5 py-2 bg-neutral-100 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <CornerDownRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span className="text-neutral-500 truncate">
              Replying to: <span className="text-neutral-800 dark:text-neutral-200 font-medium">{replyingTo.text}</span>
            </span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Recording State Overlay */}
      {isRecording && (
        <div className="px-5 py-3.5 bg-neutral-900 text-white flex items-center justify-between border-t border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-mono tabular-nums">
              Recording Voice Note: {Math.floor(recordingSeconds / 60)}:
              {(recordingSeconds % 60).toString().padStart(2, '0')}
            </span>

            {/* Live recording wave pulse */}
            <div className="flex items-center gap-1 h-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-red-400/80 rounded-full transition-all duration-100"
                  style={{
                    height: `${Math.max(4, (recordingLevel * ((i % 3) + 1)) / 4)}px`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={cancelRecording}
              className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={finishRecording}
              className="px-3.5 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Voice</span>
            </button>
          </div>
        </div>
      )}

      {/* Input Composer */}
      {!isRecording && (
        <div className="p-3 md:p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 shrink-0">
          <div className="flex items-end gap-2 relative">
            {/* Attachment Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="p-2.5 rounded-xl text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Attach Document, Photo, or Cloud Drive File"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {showAttachMenu && (
                <div className="absolute bottom-12 left-0 w-52 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 py-1.5 z-50 text-xs">
                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowAttachMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span>Upload from device</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowDrivePicker(true);
                      setShowAttachMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 cursor-pointer"
                  >
                    <HardDrive className="w-4 h-4 text-emerald-500" />
                    <span>Attach from Cloud Drive</span>
                  </button>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Text Input */}
            <div className="flex-1 bg-neutral-100 dark:bg-neutral-850 rounded-xl flex items-center px-3 py-1.5 focus-within:ring-1 focus-within:ring-neutral-400 dark:focus-within:ring-neutral-600">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type a message..."
                rows={1}
                className="w-full text-xs sm:text-sm bg-transparent text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 resize-none focus:outline-none max-h-32 py-1 leading-relaxed"
              />
            </div>

            {/* Voice Record Button */}
            <button
              onClick={startRecording}
              className="p-2.5 rounded-xl text-neutral-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Record Voice Note"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                inputText.trim()
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 shadow-sm'
                  : 'bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600 cursor-not-allowed'
              }`}
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Cloud Drive Attach Picker Modal */}
      {showDrivePicker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
            <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Select Cloud Drive File
                </h3>
                <p className="text-xs text-neutral-500">
                  Select a file to send
                </p>
              </div>
              <button
                onClick={() => setShowDrivePicker(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {driveFiles.map(file => (
                <div
                  key={file.id}
                  onClick={() => handleShareDriveFile(file)}
                  className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500/50 hover:bg-neutral-50 dark:hover:bg-neutral-850 flex items-center justify-between cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                        {file.name}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono tabular-nums">
                        {(file.size / 1024 / 1024).toFixed(2)} MB · {file.extension}
                      </div>
                    </div>
                  </div>
                  <button className="px-2.5 py-1 text-xs rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-medium">
                    Attach
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
