import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
import secureStorage from './secureStorage';

/**
 * Vault Service
 * Implements Blueprint Section 3: Identity, Cryptography & Secret Management.
 * Features: Post-Quantum Cryptography (ML-KEM), Hardware-Bound Keys.
 */

const KEY_STORAGE_ID = 'catcoder_vault_keys';

interface VaultKeys {
  publicKey: string;
  privateKey: string;
  deviceSeed: string;
}

/**
 * Requirement 3.2: Local identity keys and PQC
 */
export class Vault {
  private static instance: Vault;
  private keys: VaultKeys | null = null;

  private constructor() { }

  public static getInstance(): Vault {
    if (!Vault.instance) {
      Vault.instance = new Vault();
    }
    return Vault.instance;
  }

  /**
   * Requirement 3.3: Initialize without hardcoded keys.
   * Generates or retrieves device-bound PQC keys.
   */
  public async initialize(): Promise<void> {
    const stored = secureStorage.getItem(KEY_STORAGE_ID);
    if (stored) {
      this.keys = JSON.parse(stored);
      console.log("[Vault] Device Identity Restored.");
    } else {
      console.log("[Vault] Generating New Post-Quantum Device Identity...");
      const aliceKeys = ml_kem768.keygen();
      const deviceSeed = crypto.getRandomValues(new Uint8Array(32));

      this.keys = {
        publicKey: bytesToHex(aliceKeys.publicKey),
        privateKey: bytesToHex(aliceKeys.secretKey),
        deviceSeed: bytesToHex(deviceSeed)
      };

      secureStorage.setItem(KEY_STORAGE_ID, JSON.stringify(this.keys));
    }
  }

  /**
   * Requirement 3.3: Post-Quantum Key Encapsulation (ML-KEM)
   * Used for secure key exchange with "The Server" (simulated or real).
   */
  public encapsulate(peerPublicKeyHex: string) {
    const peerPubKey = hexToBytes(peerPublicKeyHex);
    const { cipherText, sharedSecret } = ml_kem768.encapsulate(peerPubKey);
    return {
      ciphertext: bytesToHex(cipherText),
      sharedSecret: bytesToHex(sharedSecret)
    };
  }

  public decapsulate(ciphertextHex: string) {
    if (!this.keys) throw new Error("Vault not initialized");
    const ciphertext = hexToBytes(ciphertextHex);
    const secretKey = hexToBytes(this.keys.privateKey);
    const sharedSecret = ml_kem768.decapsulate(ciphertext, secretKey);
    return bytesToHex(sharedSecret);
  }

  /**
   * Requirement 3.2: Get a hardware-bound key for Data at Rest
   * Derives a key from the device seed and a salt.
   */
  public async getEncryptionKey(salt: string = 'catcoder_default'): Promise<CryptoKey> {
    if (!this.keys) throw new Error("Vault not initialized");

    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new Uint8Array(hexToBytes(this.keys.deviceSeed)),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: enc.encode(salt),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  public getPublicKey(): string {
    return this.keys?.publicKey || '';
  }
}

export const vault = Vault.getInstance();
