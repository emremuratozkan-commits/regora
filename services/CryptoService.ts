/**
 * CryptoService - AES-256-GCM Encryption/Decryption
 * Uses Web Crypto API for secure session encryption
 */

const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 256;
const PBKDF2_ITERATIONS = 100000;

class CryptoService {
    private keyCache: CryptoKey | null = null;
    private readonly storageKey = 'regora_session_key';

    /**
     * Derives an AES-256 key from the given password using PBKDF2
     */
    private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt.buffer as ArrayBuffer,
                iterations: PBKDF2_ITERATIONS,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: KEY_LENGTH },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Gets or generates a session encryption key
     */
    private async getSessionKey(): Promise<CryptoKey> {
        if (this.keyCache) return this.keyCache;

        // Use a combination of environment variable and random salt for key derivation
        const baseKey = import.meta.env.VITE_SESSION_ENCRYPTION_KEY || 'regora-default-key-change-in-production';

        // Check if we have a stored salt
        let storedSalt = localStorage.getItem(this.storageKey);
        let salt: Uint8Array;

        if (storedSalt) {
            salt = this.base64ToUint8Array(storedSalt);
        } else {
            salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
            localStorage.setItem(this.storageKey, this.uint8ArrayToBase64(salt));
        }

        this.keyCache = await this.deriveKey(baseKey, salt);
        return this.keyCache;
    }

    /**
     * Encrypts a string using AES-256-GCM
     */
    async encrypt(plaintext: string): Promise<string> {
        const key = await this.getSessionKey();
        const encoder = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

        const encryptedBuffer = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            encoder.encode(plaintext)
        );

        // Combine IV and encrypted data
        const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encryptedBuffer), iv.length);

        return this.uint8ArrayToBase64(combined);
    }

    /**
     * Decrypts a string that was encrypted with encrypt()
     */
    async decrypt(ciphertext: string): Promise<string> {
        try {
            const key = await this.getSessionKey();
            const combined = this.base64ToUint8Array(ciphertext);

            const iv = combined.slice(0, IV_LENGTH);
            const encryptedData = combined.slice(IV_LENGTH);

            const decryptedBuffer = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv },
                key,
                encryptedData
            );

            const decoder = new TextDecoder();
            return decoder.decode(decryptedBuffer);
        } catch (error) {
            console.error('Decryption failed:', error);
            throw new Error('Unable to decrypt data');
        }
    }

    /**
     * Clears the cached key (call on logout)
     */
    clearCache(): void {
        this.keyCache = null;
    }

    /**
     * Generates a secure random token
     */
    generateSecureToken(length: number = 32): string {
        const bytes = crypto.getRandomValues(new Uint8Array(length));
        return this.uint8ArrayToBase64(bytes);
    }

    private uint8ArrayToBase64(bytes: Uint8Array): string {
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i] ?? 0);
        }
        return btoa(binary);
    }

    private base64ToUint8Array(base64: string): Uint8Array {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }
}

export const cryptoService = new CryptoService();
