/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserPlus, Users, X, ShieldCheck, Search } from 'lucide-react';
import { Contact } from '../types';
import { computeSafetyNumber } from '../services/cryptoService';

interface NewChatModalProps {
  contacts: Contact[];
  onSelectContact: (id: string) => void;
  onAddContact: (contact: Contact) => void;
  onClose: () => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  contacts,
  onSelectContact,
  onAddContact,
  onClose,
}) => {
  const [tab, setTab] = useState<'direct' | 'team'>('direct');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const id = `user_${Date.now()}`;
    const cleanUsername = username.trim() ? (username.startsWith('@') ? username : `@${username}`) : `@${name.toLowerCase().replace(/\s+/g, '.')}`;

    const newContact: Contact = {
      id,
      name: name.trim(),
      username: cleanUsername,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + (Math.floor(Math.random() * 500))}?auto=format&fit=crop&w=256&h=256&q=80`,
      status: 'online',
      statusText: 'New contact joined',
      category: tab,
      role: role.trim() || (tab === 'team' ? 'Team Channel' : 'Direct Peer'),
      isE2EEVerified: true,
      safetyNumber: computeSafetyNumber('me_identity', id),
      publicKeyHex: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      unreadCount: 0,
    };

    onAddContact(newContact);
    onSelectContact(newContact.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              New Encrypted Conversation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-850 flex gap-2">
          <button
            onClick={() => setTab('direct')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
              tab === 'direct'
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            Personal Direct Chat
          </button>
          <button
            onClick={() => setTab('team')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
              tab === 'team'
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            Team Workspace Channel
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCreate} className="p-5 space-y-3.5">
          <div>
            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
              {tab === 'direct' ? 'Contact Name' : 'Team / Channel Name'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={tab === 'direct' ? 'e.g. Alex Morgan' : 'e.g. Core Architecture'}
              className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
              Username or Handle
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@handle or unique ID"
              className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
              {tab === 'direct' ? 'Role / Title (Optional)' : 'Channel Focus'}
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder={tab === 'direct' ? 'e.g. Security Researcher' : 'e.g. Production Infrastructure'}
              className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm cursor-pointer"
            >
              Start Conversation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
