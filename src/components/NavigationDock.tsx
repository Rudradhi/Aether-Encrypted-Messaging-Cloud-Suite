/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  MessageSquare, 
  Settings
} from 'lucide-react';
import { AppSettings, UserProfile } from '../types';

interface NavigationDockProps {
  activeTab: 'home' | 'chats' | 'drive' | 'vault' | 'settings';
  setActiveTab: (tab: 'home' | 'chats' | 'drive' | 'vault' | 'settings') => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  unreadTotal: number;
  activeContactName?: string;
  userProfile?: UserProfile;
}

export const NavigationDock: React.FC<NavigationDockProps> = ({
  activeTab,
  setActiveTab,
  unreadTotal,
  activeContactName,
  userProfile,
}) => {
  return (
    <aside className="w-18 md:w-20 bg-neutral-950 text-neutral-300 border-r border-neutral-800/80 flex flex-col items-center justify-between py-5 shrink-0 z-20 select-none">
      {/* Brand Icon (Home Interface Hyperlink) */}
      <div className="flex flex-col items-center gap-6">
        <button 
          onClick={() => setActiveTab('home')}
          className={`relative group p-2.5 rounded-xl border transition-all text-white flex items-center justify-center cursor-pointer ${
            activeTab === 'home'
              ? 'bg-neutral-800 border-emerald-500 shadow-md shadow-emerald-500/20'
              : 'bg-neutral-900 border-neutral-800 hover:border-emerald-500/50 hover:bg-neutral-850'
          }`}
          title="Go to Aether Home"
        >
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-neutral-950 font-bold text-sm tracking-tighter shadow-sm shadow-emerald-500/30">
            Æ
          </div>
          <span className="sr-only">Aether Home</span>
        </button>

        {/* Primary Navigation Tabs */}
        <nav className="flex flex-col items-center gap-3">
          {/* Chats */}
          <button
            onClick={() => setActiveTab('chats')}
            className={`relative p-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'chats'
                ? 'bg-neutral-800 text-white shadow-inner'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
            title="Messages"
          >
            <MessageSquare className="w-5 h-5" />
            {unreadTotal > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>
        </nav>
      </div>

      {/* Middle: Active Contact Name (Vertical, Bold, Caps) */}
      <div className="flex-1 flex items-center justify-center my-4 overflow-hidden py-2">
        <span 
          className="[writing-mode:vertical-rl] rotate-180 font-bold uppercase tracking-widest text-xs text-neutral-200 dark:text-neutral-200 select-none truncate max-h-56 py-2 px-1 border-y border-neutral-800/60"
          title={activeContactName}
        >
          {activeContactName || 'MESSAGES'}
        </span>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col items-center gap-4">
        {/* Settings */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-neutral-800 text-white'
              : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900'
          }`}
          title="App Settings & Devices"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Avatar */}
        <div className="relative pt-1" title={userProfile ? `${userProfile.name} (${userProfile.handle})` : 'My Profile'}>
          <div className="w-9 h-9 rounded-full ring-2 ring-emerald-500/40 overflow-hidden bg-neutral-800 flex items-center justify-center font-bold text-xs text-white">
            {userProfile?.avatar ? (
              <img 
                src={userProfile.avatar} 
                alt={userProfile.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span>{userProfile?.name?.charAt(0) || 'U'}</span>
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-neutral-950" />
        </div>
      </div>
    </aside>
  );
};
