# Aether — Minimalist Real-Time Messaging & Cloud Communication Suite

A super clean, high-performance, and privacy-first communication platform combining RFC 8439 ChaCha20-Poly1305 authenticated end-to-end encrypted messaging, voice notes with live waveforms, interactive audio/video calls with local media streams, ephemeral messages, and an integrated cloud drive for seamless file sharing across mobile and desktop.

***

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural revisions have been incorporated:

- **Confirmed: ChaCha20-Poly1305 Authenticated Encryption (AEAD)**: Upgraded from generic AES-GCM to industry-standard **ChaCha20-Poly1305 (RFC 8439)** using the audited `@noble/ciphers` library. Every message and vault file is encrypted with a 256-bit key, 96-bit unique cryptographically secure nonce, and 128-bit Poly1305 authentication tag to guarantee confidentiality and tamper-proof integrity.
- **Confirmed: Communication Focus**: Personal direct messaging and privacy-focused conversations lead the experience, while supporting direct team and 1-on-1 collaboration with low latency.
- **Confirmed: Audio & Video Calling**: Interactive in-app call modal utilizing real WebRTC `navigator.mediaDevices.getUserMedia` for live camera and microphone preview, interactive mute/camera controls, audio waveform visualizer, call duration timers, and end-to-end encrypted session badges.
- **Confirmed: Integrated Cloud Storage**: A dedicated Cloud Drive tab with category filters (Documents, Media, Voice Notes, Encrypted Vault) alongside seamless in-chat media previews and direct "Send to Chat" actions.
- **Design & Typography Choice**: Clean typography pairing Roboto and Plus Jakarta Sans with refined system fallbacks (Calibri / Segoe UI), strictly respecting anti-slop guidelines with zero pill-badge clutter, crisp micro-interactions, dark/light theme switching, and 5 customizable chat color atmospheres.

***

## 1. Overview & Core Concept

**Aether** is engineered for both personal confidentiality and agile team collaboration. It provides an intuitive, distraction-free environment that feels featherlight for non-technical users while delivering military-grade security features like ChaCha20-Poly1305 AEAD stream encryption, visual safety numbers, and disappearing messages.

- **Primary Persona**: Professionals and privacy-conscious users who demand high security, rapid low-latency communication, crisp audio/video calling, and effortless file storage in one unified interface.
- **Key Value**: Replaces bloated legacy chat suites with a minimalist, responsive interface that synchronizes contacts, media, and real-time conversation state seamlessly.

***

## 2. User Experience & Visual Design

### Key User Flows

1. **Direct Encrypted Messaging (ChaCha20-Poly1305)**:
   - Open active conversation from the contact roster.
   - See contact presence (Online, Away, Offline), typing indicators, and E2EE security verification badge with cryptographic safety number.
   - In-depth Encryption Inspector modal showing ChaCha20 key hash, algorithm specifications (RFC 8439 / Poly1305 MAC tag), and safety fingerprint QR/hash code.
   - Compose rich text, record voice memos with live audio waveform recording, attach files from local device or Cloud Drive, and send ephemeral messages with self-destruct timers (5s to 24h).
   - Real-time message status transitions: `Sent (✓)` $\rightarrow$ `Delivered (✓✓)` $\rightarrow$ `Read (✓✓ blue)`.
2. **Interactive Voice & Video Calls**:
   - Initiate 1-click voice or video call directly from the chat header.
   - Interactive call overlay displays real camera feed, microphone audio level visualizer, duration timer, encryption safety fingerprint, speaker toggle, screen sharing simulation, and call end.
3. **Integrated Cloud Drive & File Sharing**:
   - Browse files categorized into Documents, Media, Audio Memos, and Encrypted Vault.
   - Upload new files, view detailed metadata (file size, format, upload date), preview contents inline, download, or directly attach into active conversations.
4. **Theme & Customization Suite**:
   - Toggle instantly between Dark Mode and Light Mode.
   - Select customized chat themes (Midnight Onyx, Emerald Mint, Cyber Azure, Lavender Sunset, Minimal Mono) with custom chat bubble accents and subtle chat wallpaper motifs.

### Visual Identity & Theme Tokens

- **Aesthetic Direction**: Minimalist, Swiss-inspired typographic discipline, crisp geometric lines, subtle hairlines (`border-neutral-200 dark:border-neutral-800`), zero pill clutter.
- **Palette**:
  - *Dark Canvas (60%)*: Neutral deep slate (`#0B0F17`) and structural paneling (`#111827`, `#1A2234`).
  - *Light Canvas (60%)*: Clean crisp white (`#FFFFFF`) and warm neutral slate (`#F8FAFC`).
  - *Accent Budget (10%)*: Precision Emerald (`#10B981`) or Indigo Azure (`#3B82F6`) reserved strictly for active states, CTAs, and read receipts.
- **Typography**: Roboto and Plus Jakarta Sans with tabular figures (`font-mono tabular-nums`) for timestamps, call durations, and cryptographic keys.

***

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: ChaCha20-Poly1305 (RFC 8439) via `@noble/ciphers`**
  - *Chosen Approach*: Implement ChaCha20-Poly1305 using `@noble/ciphers/chacha.js`, with cryptographically random 256-bit keys and unique 96-bit nonces (`crypto.getRandomValues`) per encrypted payload.
  - *Why*: Delivers lightning-fast software encryption, immune to cache-timing attacks, matching modern protocols like WireGuard and Signal.
  - *Alternatives Considered*: Python backend proxy was considered, but pure client-side TypeScript execution ensures zero-trust end-to-end privacy directly in the user's browser without plaintext leaving memory.
- **Decision 2: Real Hardware MediaStream vs. Mock Video Calls**
  - *Chosen Approach*: Real `navigator.mediaDevices.getUserMedia` integration with graceful simulated fallback when camera/mic is in use or blocked by permissions.
  - *Why*: Gives users authentic confidence in the video/voice calling experience.
- **Decision 3: Integrated Cloud Storage Synchronization**
  - *Chosen Approach*: Reactive local/cached state synchronizer with persistent cloud drive registry, instant file ingestion, and cross-chat reference links.
  - *Why*: Allows instantaneous zero-latency sharing without external cloud latency.

***

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          AETHER APP ROOT                               │
│      (Theme Provider · ChaCha20-Poly1305 Crypto Engine · Device Sync)  │
└───────┬───────────────────────────────┬────────────────────────┬───────┘
        │                               │                        │
        ▼                               ▼                        ▼
┌─────────────────┐           ┌──────────────────┐     ┌─────────────────┐
│  APP NAVIGATION │           │   ACTIVE CHAT    │     │   CLOUD DRIVE   │
│  • Contacts     │           │   WORKSPACE      │     │   • Storage HUD │
│  • Direct Chats │           │  • E2EE Badge    │     │   • File Grid   │
│  • Settings     │           │  • Message List  │     │   • Vault       │
│  • Theme Switch │           │  • Ephemeral Bar │     │   • Upload &    │
└───────┬─────────┘           │  • Voice / Input │     │     Direct Share│
        │                     └────────┬─────────┘     └─────────────────┘
        │                              │
        ▼                              ▼
┌─────────────────┐           ┌──────────────────────────────────────────┐
│ PRESENCE ENGINE │           │        AUDIO / VIDEO CALL OVERLAY        │
│ • Online/Typing │           │  • Real getUserMedia Live Stream         │
│ • Read Receipts │           │  • Mic Level & Waveform Visualizer       │
│ • Low-Latency   │           │  • ChaCha20 Handshake Safety Fingerprint │
└─────────────────┘           └──────────────────────────────────────────┘
```

### Core Entities & State

- **Conversation**: `id`, `name`, `avatar`, `isDirect`, `isE2EE`, `safetyNumber`, `theme`, `ephemeralTimeoutSeconds`, `unreadCount`, `lastSeen`.
- **Message**: `id`, `conversationId`, `senderId`, `text`, `type ('text'|'audio'|'file'|'call_log')`, `fileMetadata`, `audioDuration`, `status ('sending'|'sent'|'delivered'|'read')`, `timestamp`, `expiresAt`, `isEncrypted`, `cipherMeta: { algorithm: 'ChaCha20-Poly1305', nonce: string, tag: string }`.
- **DriveFile**: `id`, `name`, `size`, `type ('document'|'media'|'audio'|'vault')`, `blobUrl`, `uploadedAt`, `isEncrypted`, `sharedWith`.
- **CallSession**: `active`, `type ('voice'|'video')`, `contactId`, `startTime`, `isMuted`, `isVideoEnabled`, `localStream`, `safetyFingerprint`.

***

## 5. Execution Plan & Validation

1. **Step 1: Install `@noble/ciphers` & Foundational Crypto Architecture**
   - Install `@noble/ciphers` via package manager.
   - Build `cryptoService.ts` implementing ChaCha20-Poly1305 AEAD key generation, authenticated encryption, decryption, nonce generation, and safety fingerprint calculations.
2. **Step 2: Core Messaging Interface & Real-Time UX**
   - Build 3-pane desktop / responsive mobile layout.
   - Implement live typing, ephemeral countdown timers, read receipts, and quote/reply interactions.
   - Build voice recorder with Web Audio API MediaRecorder and waveform scrubber.
3. **Step 3: Interactive Video & Audio Calling Overlay**
   - Connect live camera/microphone feed with device permission handling.
   - Add call controls (mute, camera toggle, screen sharing, duration timer, end call).
4. **Step 4: Cloud Storage Drive Hub & Cross-Platform Sync**
   - Dedicated Drive tab with categorized browsing, upload simulation, file previews, and direct chat sharing.
5. **Step 5: Themes, Polish & Build Verification**
   - Dark/Light mode switching and 5 custom chat themes.
   - Run compilation check (`compile_applet`) and verify zero errors.
