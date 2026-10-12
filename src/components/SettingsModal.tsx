/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Settings, 
  Moon, 
  Sun, 
  Smartphone, 
  Laptop, 
  Tablet, 
  RefreshCw, 
  ShieldCheck, 
  Volume2, 
  Eye, 
  Clock, 
  X,
  Palette,
  Check
} from 'lucide-react';
import { AppSettings, ChatTheme } from '../types';
import { CHAT_THEMES } from '../data/initialData';

interface SettingsModalProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  setSettings,
  onClose,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 2500);
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100">
                Aether Settings & Preferences
              </h2>
              <p className="text-xs text-neutral-500">
                Customization, Themes & Cross-Platform Sync
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

        {/* Scroll Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Customizable Chat Atmosphere Themes */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                Chat Theme Atmosphere
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mb-3">
              Personalize bubble styles and wallpaper accents for all conversations.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CHAT_THEMES.map(theme => {
                const isSelected = settings.activeThemeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setSettings(prev => ({ ...prev, activeThemeId: theme.id }))}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-neutral-50 dark:bg-neutral-850 ring-1 ring-emerald-500/50'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: theme.previewColor }}
                      />
                      <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                        {theme.name}
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cross-Platform Synchronization */}
          <div className="p-4.5 rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                  Cross-Platform Synchronization
                </h4>
                <p className="text-xs text-neutral-500">
                  Continuous real-time state sync across your registered devices.
                </p>
              </div>

              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="px-3 py-1.5 rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : syncSuccess ? 'Synced!' : 'Sync Now'}</span>
              </button>
            </div>

            <div className="space-y-2 mt-3">
              {settings.syncDevices.map((dev, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {dev.type === 'desktop' ? (
                        <Laptop className="w-4 h-4" />
                      ) : dev.type === 'mobile' ? (
                        <Smartphone className="w-4 h-4" />
                      ) : (
                        <Tablet className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {dev.name}
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        Last ping: {dev.lastSync}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy & Feature Toggles */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              Privacy & Messaging Controls
            </h3>

            {/* Read Receipts */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <Eye className="w-4 h-4 text-neutral-500" />
                <div>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    Read Receipts
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Show double cyan checkmarks when messages are viewed.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.readReceipts}
                onChange={(e) => setSettings(prev => ({ ...prev, readReceipts: e.target.checked }))}
                className="w-4 h-4 accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Sound Effects */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-neutral-500" />
                <div>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    Audio Feedback
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Subtle sounds on sending messages and incoming calls.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEffects}
                onChange={(e) => setSettings(prev => ({ ...prev, soundEffects: e.target.checked }))}
                className="w-4 h-4 accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                {settings.darkMode ? <Moon className="w-4 h-4 text-neutral-500" /> : <Sun className="w-4 h-4 text-neutral-500" />}
                <div>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    Dark Mode Appearance
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    High-contrast neutral dark slate palette.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => setSettings(prev => ({ ...prev, darkMode: e.target.checked }))}
                className="w-4 h-4 accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
