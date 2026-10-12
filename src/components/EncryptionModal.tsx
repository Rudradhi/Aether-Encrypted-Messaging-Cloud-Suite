/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  CheckCircle2, 
  X, 
  Copy, 
  Check, 
  Sparkles, 
  AlertTriangle,
  Play
} from 'lucide-react';
import { Contact } from '../types';
import { 
  encryptChaCha20, 
  decryptChaCha20, 
  generateChaChaKey, 
  bytesToHex 
} from '../services/cryptoService';

interface EncryptionModalProps {
  contact: Contact;
  onClose: () => void;
  onToggleVerified: (contactId: string) => void;
}

export const EncryptionModal: React.FC<EncryptionModalProps> = ({
  contact,
  onClose,
  onToggleVerified,
}) => {
  const [copied, setCopied] = useState(false);
  
  // Interactive Live Cryptographic Lab
  const [testPlaintext, setTestPlaintext] = useState('Top Secret Mission Specs 2026');
  const [labKey] = useState<Uint8Array>(() => generateChaChaKey());
  const [labResult, setLabResult] = useState<{
    ciphertextHex: string;
    nonceHex: string;
    macTagHex: string;
  } | null>(null);
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [tamperedCipher, setTamperedCipher] = useState(false);
  const [decryptStatus, setDecryptStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const copySafetyNumber = () => {
    navigator.clipboard.writeText(contact.safetyNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunEncryption = () => {
    const res = encryptChaCha20(testPlaintext, labKey);
    setLabResult(res);
    setDecryptedText(null);
    setDecryptStatus('idle');
    setTamperedCipher(false);
  };

  const handleRunDecryption = (tamper: boolean) => {
    if (!labResult) return;
    try {
      let cipherToUse = labResult.ciphertextHex;
      if (tamper) {
        // Corrupt first byte to test Poly1305 MAC failure
        const firstByte = cipherToUse.slice(0, 2);
        const corruptedByte = firstByte === 'aa' ? 'bb' : 'aa';
        cipherToUse = corruptedByte + cipherToUse.slice(2);
      }

      const dec = decryptChaCha20(cipherToUse, labResult.nonceHex, labResult.macTagHex, labKey);
      setDecryptedText(dec);
      setDecryptStatus('success');
    } catch {
      setDecryptedText(null);
      setDecryptStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100">
                End-to-End Encryption Security Inspector
              </h2>
              <p className="text-xs text-neutral-500">
                ChaCha20-Poly1305 (RFC 8439 AEAD Standard)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Contact Verification Card */}
          <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/30"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {contact.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-neutral-500">{contact.username}</span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      {contact.isE2EEVerified ? 'Fingerprint Verified' : 'Unverified Peer'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onToggleVerified(contact.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  contact.isE2EEVerified
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{contact.isE2EEVerified ? 'Verified' : 'Verify Safety Number'}</span>
              </button>
            </div>

            {/* 60-digit Signal-style Safety Number */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Cryptographic Safety Numbers
                </span>
                <button
                  onClick={copySafetyNumber}
                  className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 font-mono text-xs sm:text-sm text-center tracking-widest text-neutral-800 dark:text-neutral-200 leading-relaxed font-bold">
                {contact.safetyNumber}
              </div>
              <p className="text-[11px] text-neutral-400 mt-2">
                Compare these 60 numbers with {contact.name}'s device. If they match identically, your communication is mathematically immune to interception.
              </p>
            </div>
          </div>

          {/* Cryptographic Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Algorithm', value: 'ChaCha20' },
              { label: 'Authenticator', value: 'Poly1305 MAC' },
              { label: 'Key Size', value: '256 bits' },
              { label: 'Nonce Size', value: '96 bits' },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-neutral-100/70 dark:bg-neutral-850/60 border border-neutral-200 dark:border-neutral-800 text-center"
              >
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                  {stat.label}
                </div>
                <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 font-mono mt-1">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Live Interactive Cryptographic Playground */}
          <div className="p-5 rounded-2xl bg-neutral-950 text-neutral-100 border border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold tracking-tight text-white uppercase">
                  Live ChaCha20-Poly1305 Cipher Sandbox
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">@noble/ciphers</span>
            </div>

            <p className="text-xs text-neutral-400 mb-3">
              Test encryption and authentication in real time. Poly1305 automatically detects tampering down to a single flipped bit.
            </p>

            {/* Input text */}
            <div className="space-y-2 mb-3">
              <label className="text-[11px] text-neutral-400 font-medium">Plaintext Message</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testPlaintext}
                  onChange={(e) => setTestPlaintext(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono focus:outline-none focus:border-emerald-500"
                  placeholder="Enter text to encrypt..."
                />
                <button
                  onClick={handleRunEncryption}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Encrypt</span>
                </button>
              </div>
            </div>

            {/* Cipher Output */}
            {labResult && (
              <div className="space-y-3 pt-3 border-t border-neutral-850 font-mono text-[11px]">
                <div>
                  <span className="text-neutral-500">96-bit Nonce:</span>
                  <div className="text-amber-400 break-all select-all">{labResult.nonceHex}</div>
                </div>

                <div>
                  <span className="text-neutral-500">Ciphertext (ChaCha20 Stream):</span>
                  <div className="text-emerald-400 break-all select-all">{labResult.ciphertextHex}</div>
                </div>

                <div>
                  <span className="text-neutral-500">128-bit Poly1305 MAC Tag:</span>
                  <div className="text-blue-400 break-all select-all">{labResult.macTagHex}</div>
                </div>

                {/* Decrypt & Tamper Testing */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleRunDecryption(false)}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    Verify & Decrypt
                  </button>

                  <button
                    onClick={() => handleRunDecryption(true)}
                    className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 border border-red-800 text-xs font-semibold text-red-300 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span>Test Tamper Attack</span>
                  </button>
                </div>

                {decryptStatus === 'success' && (
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>
                      Decryption Verified! Poly1305 MAC confirmed genuine: <strong className="text-white">"{decryptedText}"</strong>
                    </span>
                  </div>
                )}

                {decryptStatus === 'error' && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>
                      Tampering Detected! Poly1305 MAC authentication failed. Payload was rejected.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
