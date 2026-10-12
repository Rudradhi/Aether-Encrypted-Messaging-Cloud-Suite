/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { NavigationDock } from './components/NavigationDock';
import { ConversationList } from './components/ConversationList';
import { ChatWorkspace } from './components/ChatWorkspace';
import { CallModal } from './components/CallModal';
import { CloudDrive } from './components/CloudDrive';
import { EncryptionModal } from './components/EncryptionModal';
import { SettingsModal } from './components/SettingsModal';
import { NewChatModal } from './components/NewChatModal';
import { HomeLanding } from './components/HomeLanding';

import { 
  Contact, 
  Message, 
  DriveFile, 
  CallSession, 
  AppSettings,
  UserProfile
} from './types';
import { 
  INITIAL_CONTACTS, 
  INITIAL_MESSAGES, 
  INITIAL_DRIVE_FILES, 
  INITIAL_SETTINGS, 
  CHAT_THEMES 
} from './data/initialData';
import { sounds } from './services/soundEffects';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'chats' | 'drive' | 'vault' | 'settings'>('home');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('aether_user');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return null;
  });

  // Real contacts list: if user logged in previously, use stored contacts, else empty list for real new user
  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const stored = localStorage.getItem('aether_contacts');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  });

  const [activeContactId, setActiveContactId] = useState<string>('');
  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    try {
      const stored = localStorage.getItem('aether_messages');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return {};
  });

  const [driveFiles, setDriveFiles] = useState<DriveFile[]>(INITIAL_DRIVE_FILES);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);

  // Modal states
  const [showEncryptionModal, setShowEncryptionModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  // Active Call Session
  const [callSession, setCallSession] = useState<CallSession | null>(null);

  // Sync dark mode class to html element
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Sync sound effects preference
  useEffect(() => {
    sounds.enabled = settings.soundEffects;
  }, [settings.soundEffects]);

  // Active theme object
  const activeTheme = useMemo(() => {
    return CHAT_THEMES.find(t => t.id === settings.activeThemeId) || CHAT_THEMES[0];
  }, [settings.activeThemeId]);

  // Active contact object
  const activeContact = useMemo(() => {
    return contacts.find(c => c.id === activeContactId) || contacts[0];
  }, [contacts, activeContactId]);

  // Total unread counter
  const unreadTotal = useMemo(() => {
    return contacts.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  }, [contacts]);

  // Ephemeral message self-destruct clock loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setMessages(prev => {
        let changed = false;
        const next: Record<string, Message[]> = {};

        for (const [convoId, msgs] of Object.entries(prev)) {
          const filtered = msgs.filter(m => {
            if (m.expiresAt && m.expiresAt <= now) {
              changed = true;
              return false;
            }
            return true;
          });
          next[convoId] = filtered;
        }

        if (changed) {
          sounds.playBurn();
        }
        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Send message handler with low-latency delivery status transitions
  const handleSendMessage = (msgData: Partial<Message>) => {
    const newMsgId = `msg_${Date.now()}`;
    const now = Date.now();
    const expiresAt = msgData.ephemeralSeconds ? now + msgData.ephemeralSeconds * 1000 : undefined;

    const newMsg: Message = {
      id: newMsgId,
      conversationId: activeContactId,
      senderId: 'me',
      text: msgData.text || '',
      type: msgData.type || 'text',
      status: 'sent',
      timestamp: now,
      isEncrypted: true,
      cipherMeta: msgData.cipherMeta,
      ephemeralSeconds: msgData.ephemeralSeconds,
      expiresAt,
      replyToId: msgData.replyToId,
      fileData: msgData.fileData,
      voiceData: msgData.voiceData,
    };

    setMessages(prev => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newMsg],
    }));

    // Simulate low-latency delivery transitions: sent -> delivered -> read
    setTimeout(() => {
      setMessages(prev => {
        const list = prev[activeContactId] || [];
        return {
          ...prev,
          [activeContactId]: list.map(m => m.id === newMsgId ? { ...m, status: 'delivered' } : m),
        };
      });
    }, 300);

    setTimeout(() => {
      if (settings.readReceipts) {
        setMessages(prev => {
          const list = prev[activeContactId] || [];
          return {
            ...prev,
            [activeContactId]: list.map(m => m.id === newMsgId ? { ...m, status: 'read' } : m),
          };
        });
      }
    }, 900);

    // Realistic automated peer response simulation for interactive immersion
    if (msgData.type === 'text' && activeContact) {
      setTimeout(() => {
        const replyText = getContextualReply(activeContact.name, msgData.text || '');
        const peerMsgId = `msg_peer_${Date.now()}`;
        const peerMsg: Message = {
          id: peerMsgId,
          conversationId: activeContactId,
          senderId: activeContactId,
          text: replyText,
          type: 'text',
          status: 'read',
          timestamp: Date.now(),
          isEncrypted: true,
          cipherMeta: {
            algorithm: 'ChaCha20-Poly1305 (RFC 8439)',
            nonceHex: 'd3f4a5b6c7d8e9f011223344',
            macTagHex: '778899aabbccddeeff00112233445566',
            ciphertextHex: '89ab01cd23ef...',
            keyFingerprint: 'SHA256: ' + (activeContact.publicKeyHex?.slice(0, 8) || '00000000'),
          },
        };

        setMessages(prev => ({
          ...prev,
          [activeContactId]: [...(prev[activeContactId] || []), peerMsg],
        }));

        sounds.playReceived();
      }, 1600);
    }
  };

  // Delete message
  const handleDeleteMessage = (msgId: string) => {
    setMessages(prev => {
      const list = prev[activeContactId] || [];
      return {
        ...prev,
        [activeContactId]: list.filter(m => m.id !== msgId),
      };
    });
  };

  // Initiate Audio / Video Call
  const handleStartCall = (type: 'voice' | 'video') => {
    sounds.playSent();
    const session: CallSession = {
      active: true,
      contactId: activeContactId,
      type,
      status: 'connected',
      startTime: Date.now(),
      durationSec: 0,
      isMuted: false,
      isVideoEnabled: type === 'video',
      isScreenSharing: false,
      isSpeakerOn: true,
      safetyFingerprint: activeContact.safetyNumber.split(' ').slice(0, 3).join('-'),
    };
    setCallSession(session);
  };

  const handleEndCall = () => {
    if (callSession) {
      // Log call into conversation
      const callLogMsg: Message = {
        id: `msg_call_${Date.now()}`,
        conversationId: callSession.contactId,
        senderId: 'me',
        text: `${callSession.type === 'video' ? 'Video' : 'Voice'} call ended`,
        type: 'text',
        status: 'read',
        timestamp: Date.now(),
        isEncrypted: true,
      };

      setMessages(prev => ({
        ...prev,
        [callSession.contactId]: [...(prev[callSession.contactId] || []), callLogMsg],
      }));
    }
    setCallSession(null);
  };

  // Upload file to Cloud Drive
  const handleUploadDriveFile = (fileData: Partial<DriveFile>) => {
    const newFile: DriveFile = {
      id: `file_${Date.now()}`,
      name: fileData.name || 'Untitled Document',
      size: fileData.size || 1024 * 512,
      type: fileData.type || 'document',
      extension: fileData.extension || 'DAT',
      url: fileData.url || '#',
      uploadedAt: Date.now(),
      isEncrypted: true,
      sharedInConversations: [],
    };
    setDriveFiles(prev => [newFile, ...prev]);
    sounds.playSent();
  };

  const handleDeleteDriveFile = (fileId: string) => {
    setDriveFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleToggleStarDriveFile = (fileId: string) => {
    setDriveFiles(prev =>
      prev.map(f => f.id === fileId ? { ...f, starred: !f.starred } : f)
    );
  };

  const handleShareFileToChat = (file: DriveFile, contactId: string) => {
    setActiveContactId(contactId);
    setActiveTab('chats');

    const shareMsg: Message = {
      id: `msg_share_${Date.now()}`,
      conversationId: contactId,
      senderId: 'me',
      text: file.name,
      type: 'file',
      status: 'sent',
      timestamp: Date.now(),
      isEncrypted: true,
      fileData: {
        id: file.id,
        name: file.name,
        size: file.size,
        mimeType: file.type === 'image' ? 'image/png' : 'application/pdf',
        url: file.url,
        previewUrl: file.type === 'image' ? file.url : undefined,
        category: file.type,
      },
    };

    setMessages(prev => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), shareMsg],
    }));

    sounds.playSent();
  };

  // Sync contacts and messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('aether_contacts', JSON.stringify(contacts));
    } catch {
      // ignore
    }
  }, [contacts]);

  useEffect(() => {
    try {
      localStorage.setItem('aether_messages', JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('aether_user', JSON.stringify(currentUser));
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  // Handle successful login or registration from the landing page
  const handleLoginSuccess = (userData: { name: string; email: string; isNewUser: boolean }) => {
    const handle = `@${userData.name.toLowerCase().replace(/\s+/g, '.')}`;
    const profile: UserProfile = {
      id: `user_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      handle,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80`,
      joinedAt: Date.now(),
      status: 'online',
      statusText: 'Active',
    };

    setCurrentUser(profile);

    // If new user and has no contacts, introduce a welcoming system greeting contact
    if (contacts.length === 0) {
      const welcomeContactId = 'aether_concierge';
      const welcomeContact: Contact = {
        id: welcomeContactId,
        name: 'Aether Network',
        username: '@aether.team',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=256&h=256&q=80',
        status: 'online',
        statusText: 'Official network concierge',
        category: 'direct',
        role: 'System Concierge',
        isE2EEVerified: true,
        safetyNumber: '0000 1111 2222 3333 4444 5555',
        publicKeyHex: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
        unreadCount: 1,
      };

      const welcomeMessage: Message = {
        id: `msg_welcome_${Date.now()}`,
        conversationId: welcomeContactId,
        senderId: welcomeContactId,
        text: `Welcome to Aether, ${userData.name}! Your account is active. You can add your direct team members or personal contacts using the + button anytime.`,
        type: 'text',
        status: 'read',
        timestamp: Date.now(),
        isEncrypted: true,
      };

      setContacts([welcomeContact]);
      setMessages({ [welcomeContactId]: [welcomeMessage] });
      setActiveContactId(welcomeContactId);
    } else {
      if (!activeContactId && contacts.length > 0) {
        setActiveContactId(contacts[0].id);
      }
    }

    setActiveTab('chats');
  };

  // Toggle Contact Verified status
  const handleToggleVerified = (contactId: string) => {
    setContacts(prev =>
      prev.map(c => c.id === contactId ? { ...c, isE2EEVerified: !c.isE2EEVerified } : c)
    );
  };

  // Add Contact / Team Channel
  const handleAddContact = (newContact: Contact) => {
    setContacts(prev => [newContact, ...prev]);
    setMessages(prev => ({ ...prev, [newContact.id]: [] }));
    setActiveContactId(newContact.id);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-sans antialiased">
      {/* 1. Ultra-minimal Leftmost Navigation Dock */}
      <NavigationDock
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'settings') {
            setShowSettingsModal(true);
          } else if (tab === 'vault') {
            setShowEncryptionModal(true);
          } else {
            setActiveTab(tab);
          }
        }}
        settings={settings}
        setSettings={setSettings}
        unreadTotal={unreadTotal}
        activeContactName={activeContact?.name}
        userProfile={currentUser || undefined}
      />

      {/* 2. Main Workspace Canvas */}
      <div className="flex-1 h-full flex overflow-hidden">
        {activeTab === 'home' ? (
          <HomeLanding 
            onEnterApp={() => setActiveTab('chats')} 
            onLoginSuccess={handleLoginSuccess}
          />
        ) : activeTab === 'chats' ? (
          <>
            {/* Conversation List / Contacts Panel */}
            <ConversationList
              contacts={contacts}
              activeContactId={activeContactId}
              onSelectContact={(id) => {
                setActiveContactId(id);
                // Clear unread badge
                setContacts(prev =>
                  prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c)
                );
              }}
              messages={messages}
              onOpenNewChat={() => setShowNewChatModal(true)}
            />

            {/* Active Encrypted Chat Workspace */}
            {activeContact ? (
              <ChatWorkspace
                contact={activeContact}
                messages={messages[activeContactId] || []}
                onSendMessage={handleSendMessage}
                onStartCall={handleStartCall}
                onOpenEncryptionModal={() => setShowEncryptionModal(true)}
                onOpenDriveModal={() => setActiveTab('drive')}
                activeTheme={activeTheme}
                driveFiles={driveFiles}
                onDeleteMessage={handleDeleteMessage}
              />
            ) : (
              <div className="flex-1 h-full flex items-center justify-center text-neutral-400">
                Select a conversation to begin encrypted messaging
              </div>
            )}
          </>
        ) : (
          /* Cloud Drive Full Interface */
          <CloudDrive
            files={driveFiles}
            contacts={contacts}
            onUploadFile={handleUploadDriveFile}
            onDeleteFile={handleDeleteDriveFile}
            onToggleStar={handleToggleStarDriveFile}
            onShareToChat={handleShareFileToChat}
          />
        )}
      </div>

      {/* 3. Real-time Video / Voice Call Modal */}
      {callSession && (
        <CallModal
          callSession={callSession}
          contact={contacts.find(c => c.id === callSession.contactId) || activeContact}
          onEndCall={handleEndCall}
          onToggleMute={() => setCallSession(prev => prev ? ({ ...prev, isMuted: !prev.isMuted }) : null)}
          onToggleVideo={() => setCallSession(prev => prev ? ({ ...prev, isVideoEnabled: !prev.isVideoEnabled }) : null)}
        />
      )}

      {/* 4. ChaCha20-Poly1305 Security Inspector & Safety Numbers Modal */}
      {showEncryptionModal && (
        <EncryptionModal
          contact={activeContact}
          onClose={() => setShowEncryptionModal(false)}
          onToggleVerified={handleToggleVerified}
        />
      )}

      {/* 5. Settings, Themes & Cross-Platform Sync Modal */}
      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          setSettings={setSettings}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* 6. New Encrypted Chat / Team Channel Modal */}
      {showNewChatModal && (
        <NewChatModal
          contacts={contacts}
          onSelectContact={(id) => {
            setActiveContactId(id);
            setActiveTab('chats');
          }}
          onAddContact={handleAddContact}
          onClose={() => setShowNewChatModal(false)}
        />
      )}
    </div>
  );
}

// Helper to provide realistic contextual replies
function getContextualReply(name: string, userText: string): string {
  const lower = userText.toLowerCase();
  if (lower.includes('call') || lower.includes('video') || lower.includes('voice')) {
    return `Ready whenever you are! I have my camera and microphone tested on this end.`;
  }
  if (lower.includes('encrypt') || lower.includes('chacha') || lower.includes('security')) {
    return `Everything is protected with authenticated encryption.`;
  }
  if (lower.includes('file') || lower.includes('drive') || lower.includes('doc')) {
    return `Got it! I saved a copy to my Cloud Drive.`;
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return `Hey there! How is everything going today?`;
  }
  return `Acknowledged! Message received.`;
}
