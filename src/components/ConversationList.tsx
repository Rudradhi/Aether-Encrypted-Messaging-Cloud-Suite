/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  ShieldCheck, 
  Pin, 
  Check, 
  CheckCheck, 
  Mic, 
  FileText,
  X
} from 'lucide-react';
import { Contact, Message } from '../types';

interface ConversationListProps {
  contacts: Contact[];
  activeContactId: string;
  onSelectContact: (id: string) => void;
  messages: Record<string, Message[]>;
  onOpenNewChat: () => void;
  isMobileListVisible?: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  contacts,
  activeContactId,
  onSelectContact,
  messages,
  onOpenNewChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'direct' | 'team' | 'unread'>('all');

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = 
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (contact.role && contact.role.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterTab === 'direct') return contact.category === 'direct';
      if (filterTab === 'team') return contact.category === 'team';
      if (filterTab === 'unread') return contact.unreadCount > 0;
      return true;
    }).sort((a, b) => {
      // Pinned contacts first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [contacts, searchQuery, filterTab]);

  return (
    <div className="w-full md:w-80 lg:w-96 h-full flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0">
      {/* Top Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-850">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Messages
          </h1>
        </div>

        <button
          onClick={onOpenNewChat}
          className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
          title="New Direct Chat or Team Workspace"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="px-4 py-2.5">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations or contacts..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-850 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 p-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="px-4 pb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {(['all', 'direct', 'team', 'unread'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors capitalize cursor-pointer whitespace-nowrap shrink-0 ${
              filterTab === tab
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-850'
            }`}
          >
            {tab === 'all' ? 'All Chats' : tab === 'direct' ? 'Direct' : tab === 'team' ? 'Team' : 'Unread'}
          </button>
        ))}
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-850/60">
        {filteredContacts.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center h-48 select-none">
            <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mb-3">
              <Plus className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              {searchQuery ? 'No matching conversations' : 'No chats yet'}
            </p>
            <p className="text-[11px] text-neutral-400 mb-4 max-w-[200px]">
              {searchQuery ? 'Try another search term' : 'Start your first direct or group conversation'}
            </p>
            {!searchQuery && (
              <button
                onClick={onOpenNewChat}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-semibold tracking-tight transition-all shadow-sm cursor-pointer"
              >
                Start New Chat
              </button>
            )}
          </div>
        ) : (
          filteredContacts.map(contact => {
            const chatMessages = messages[contact.id] || [];
            const lastMessage = chatMessages[chatMessages.length - 1];
            const isActive = contact.id === activeContactId;

            return (
              <div
                key={contact.id}
                onClick={() => onSelectContact(contact.id)}
                className={`group px-4 py-3.5 flex items-center gap-3 cursor-pointer transition-colors relative ${
                  isActive
                    ? 'bg-neutral-100 dark:bg-neutral-800/80'
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-850/50'
                }`}
              >
                {/* Avatar with Status Indicator */}
                <div className="relative shrink-0">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-11 h-11 rounded-full object-cover bg-neutral-200 dark:bg-neutral-800"
                    referrerPolicy="no-referrer"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white dark:ring-neutral-900 ${
                      contact.status === 'online'
                        ? 'bg-emerald-500'
                        : contact.status === 'away'
                        ? 'bg-amber-500'
                        : 'bg-neutral-400'
                    }`}
                  />
                </div>

                {/* Info Container */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {contact.name}
                      </span>
                    </div>
                    
                    {/* Timestamp */}
                    <span className="text-[11px] text-neutral-400 dark:text-neutral-500 shrink-0 font-mono tabular-nums">
                      {lastMessage ? new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>

                  {/* Message Snippet & Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate flex items-center gap-1">
                      {lastMessage ? (
                        <>
                          {lastMessage.senderId === 'me' && (
                            <span className="shrink-0 text-neutral-400">
                              {lastMessage.status === 'read' ? (
                                <CheckCheck className="w-3 h-3 text-cyan-500 inline" />
                              ) : lastMessage.status === 'delivered' ? (
                                <CheckCheck className="w-3 h-3 inline" />
                              ) : (
                                <Check className="w-3 h-3 inline" />
                              )}
                            </span>
                          )}
                          {lastMessage.type === 'voice' ? (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              <Mic className="w-3 h-3" /> Voice message
                            </span>
                          ) : lastMessage.type === 'file' ? (
                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                              <FileText className="w-3 h-3" /> {lastMessage.fileData?.name || 'File attachment'}
                            </span>
                          ) : (
                            <span className="truncate">{lastMessage.text}</span>
                          )}
                        </>
                      ) : (
                        <span className="italic text-neutral-400">No messages yet</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {contact.isPinned && (
                        <Pin className="w-3 h-3 text-neutral-400 fill-neutral-400" />
                      )}
                      {contact.unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500 text-white min-w-4 text-center">
                          {contact.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
