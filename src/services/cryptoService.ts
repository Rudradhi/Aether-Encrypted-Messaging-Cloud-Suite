/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { chacha20poly1305 } from '@noble/ciphers/chacha.js';

// Byte <-> Hex conversions
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '');
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  return bytes;
}

// UTF-8 <-> Bytes
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function stringToBytes(str: string): Uint8Array {
  return encoder.encode(str);
}

export function bytesToString(bytes: Uint8Array): string {
  return decoder.decode(bytes);
}

// Generate cryptographically random 256-bit key (32 bytes)
export function generateChaChaKey(): Uint8Array {
  const key = new Uint8Array(32);
  crypto.getRandomValues(key);
  return key;
}

// Generate standard 96-bit IETF RFC 8439 nonce (12 bytes)
export function generateNonce(): Uint8Array {
  const nonce = new Uint8Array(12);
  crypto.getRandomValues(nonce);
  return nonce;
}

/**
 * Encrypt arbitrary text with ChaCha20-Poly1305 AEAD (RFC 8439)
 */
export function encryptChaCha20(
  plaintext: string,
  key: Uint8Array,
  customNonce?: Uint8Array,
  associatedData?: string
): {
  ciphertextHex: string;
  nonceHex: string;
  macTagHex: string;
  rawPayloadHex: string;
} {
  const nonce = customNonce || generateNonce();
  const plaintextBytes = stringToBytes(plaintext);
  const aadBytes = associatedData ? stringToBytes(associatedData) : undefined;

  // @noble/ciphers chacha20poly1305(key, nonce, AAD)
  const chacha = chacha20poly1305(key, nonce, aadBytes);
  const encryptedWithTag = chacha.encrypt(plaintextBytes);

  // The last 16 bytes is the Poly1305 MAC tag
  const tagLength = 16;
  const ciphertextBytes = encryptedWithTag.slice(0, encryptedWithTag.length - tagLength);
  const tagBytes = encryptedWithTag.slice(encryptedWithTag.length - tagLength);

  return {
    ciphertextHex: bytesToHex(ciphertextBytes),
    nonceHex: bytesToHex(nonce),
    macTagHex: bytesToHex(tagBytes),
    rawPayloadHex: bytesToHex(encryptedWithTag),
  };
}

/**
 * Decrypt ChaCha20-Poly1305 AEAD payload with authenticity verification
 */
export function decryptChaCha20(
  ciphertextHex: string,
  nonceHex: string,
  macTagHex: string,
  key: Uint8Array,
  associatedData?: string
): string {
  const nonce = hexToBytes(nonceHex);
  const ciphertextBytes = hexToBytes(ciphertextHex);
  const tagBytes = hexToBytes(macTagHex);

  // Recombine ciphertext + 16-byte Poly1305 tag
  const combined = new Uint8Array(ciphertextBytes.length + tagBytes.length);
  combined.set(ciphertextBytes, 0);
  combined.set(tagBytes, ciphertextBytes.length);

  const aadBytes = associatedData ? stringToBytes(associatedData) : undefined;
  const chacha = chacha20poly1305(key, nonce, aadBytes);
  const decryptedBytes = chacha.decrypt(combined);

  return bytesToString(decryptedBytes);
}

/**
 * Compute Signal-style 60-digit safety numbers from two public identities
 */
export function computeSafetyNumber(identityA: string, identityB: string): string {
  let hashVal = 0;
  const combined = (identityA < identityB ? identityA + identityB : identityB + identityA);
  for (let i = 0; i < combined.length; i++) {
    hashVal = (hashVal * 31 + combined.charCodeAt(i)) >>> 0;
  }
  
  // Format into 12 blocks of 5 digits (60 digits total like Signal)
  const digits: string[] = [];
  for (let block = 0; block < 12; block++) {
    const pseudoSeed = (hashVal * (block + 7) * 9876543) % 100000;
    digits.push(Math.abs(pseudoSeed).toString().padStart(5, '0'));
  }
  return digits.join(' ');
}

// Generate shared persistent session key for a conversation
export const SESSION_KEYS: Record<string, Uint8Array> = {};

export function getOrCreateConversationKey(conversationId: string): Uint8Array {
  if (!SESSION_KEYS[conversationId]) {
    // Deterministic or cached key based on conversation ID
    const seed = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      seed[i] = (conversationId.charCodeAt(i % conversationId.length) * (i + 13)) % 256;
    }
    SESSION_KEYS[conversationId] = seed;
  }
  return SESSION_KEYS[conversationId];
}
