/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Contact {
  id: string;
  name: string;
  username: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  statusText?: string;
  lastSeen?: string;
  category: 'direct' | 'team';
  role?: string;
  isE2EEVerified: boolean;
  safetyNumber: string;
  publicKeyHex: string;
  unreadCount: number;
  isPinned?: boolean;
  isMuted?: boolean;
}

export type MessageType = 'text' | 'voice' | 'file' | 'system' | 'call_event';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface CipherMeta {
  algorithm: 'ChaCha20-Poly1305 (RFC 8439)';
  nonceHex: string;
  macTagHex: string;
  ciphertextHex: string;
  keyFingerprint: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string; // 'me' or contact.id
  text: string;
  type: MessageType;
  status: MessageStatus;
  timestamp: number;
  isEncrypted: boolean;
  cipherMeta?: CipherMeta;
  ephemeralSeconds?: number;
  expiresAt?: number;
  replyToId?: string;
  reactions?: Record<string, string[]>; // emoji -> array of user names
  fileData?: {
    id?: string;
    name: string;
    size: number;
    mimeType: string;
    url: string;
    previewUrl?: string;
    category?: 'document' | 'image' | 'video' | 'audio' | 'vault';
  };
  voiceData?: {
    durationSec: number;
    waveform: number[];
    audioUrl?: string;
  };
  callData?: {
    callType: 'voice' | 'video';
    durationSec: number;
    completed: boolean;
  };
}

export interface DriveFile {
  id: string;
  name: string;
  size: number;
  type: 'document' | 'image' | 'video' | 'audio' | 'vault';
  extension: string;
  url: string;
  uploadedAt: number;
  isEncrypted: boolean;
  sharedInConversations: string[];
  starred?: boolean;
}

export interface CallSession {
  active: boolean;
  contactId: string;
  type: 'voice' | 'video';
  status: 'ringing' | 'connected' | 'ended';
  startTime?: number;
  durationSec: number;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isSpeakerOn: boolean;
  safetyFingerprint: string;
}

export interface ChatTheme {
  id: string;
  name: string;
  bubbleSelf: string;
  bubbleSelfText: string;
  bubbleOther: string;
  bubbleOtherText: string;
  accentBg: string;
  accentText: string;
  previewColor: string;
  wallpaper: 'clean' | 'subtle-dots' | 'grid' | 'mesh';
}

export interface AppSettings {
  darkMode: boolean;
  activeThemeId: string;
  readReceipts: boolean;
  typingIndicators: boolean;
  defaultEphemeralSec: number;
  soundEffects: boolean;
  syncDeviceName: string;
  syncDevices: {
    name: string;
    type: 'desktop' | 'mobile' | 'tablet';
    lastSync: string;
    status: 'synced' | 'syncing';
  }[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  handle: string;
  avatar: string;
  joinedAt: number;
  status: 'online' | 'away' | 'offline';
  statusText?: string;
}
