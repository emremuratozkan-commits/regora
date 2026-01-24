/**
 * Validation Utilities
 * Zod schemas for form validation, XSS prevention, and file validation
 */

import { z } from 'zod';

// ============================================
// XSS Prevention - Input Sanitization
// ============================================

const HTML_ENTITIES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
};

/**
 * Escapes HTML entities to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
    return input.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Removes all HTML tags from input
 */
export function stripHtmlTags(input: string): string {
    return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitizes input for safe display - removes tags and escapes remaining
 */
export function sanitizeInput(input: string): string {
    return sanitizeHtml(stripHtmlTags(input.trim()));
}

// ============================================
// Zod Schemas - Form Validation
// ============================================

/**
 * Username validation rules:
 * - 3-30 characters
 * - Only letters, numbers, and underscores
 * - No spaces
 */
export const usernameSchema = z
    .string()
    .min(3, 'Kullanıcı adı en az 3 karakter olmalı')
    .max(30, 'Kullanıcı adı en fazla 30 karakter olabilir')
    .regex(/^[a-zA-Z0-9_]+$/, 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir')
    .transform(sanitizeInput);

/**
 * Password validation rules:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export const passwordSchema = z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalı')
    .max(128, 'Şifre en fazla 128 karakter olabilir')
    .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermeli')
    .regex(/[a-z]/, 'Şifre en az bir küçük harf içermeli')
    .regex(/[0-9]/, 'Şifre en az bir rakam içermeli');

/**
 * Name validation rules:
 * - 2-100 characters
 * - Letters and spaces only
 */
export const nameSchema = z
    .string()
    .min(2, 'İsim en az 2 karakter olmalı')
    .max(100, 'İsim en fazla 100 karakter olabilir')
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, 'İsim sadece harf içerebilir')
    .transform(sanitizeInput);

/**
 * Turkish phone number validation
 * Accepts formats: 5XXXXXXXXX, 05XXXXXXXXX, +905XXXXXXXXX
 */
export const phoneSchema = z
    .string()
    .regex(
        /^(\+90|0)?5[0-9]{9}$/,
        'Geçerli bir telefon numarası girin (örn: 5551234567)'
    )
    .transform((val: string) => val.replace(/^(\+90|0)/, '')); // Normalize to 5XXXXXXXXX

/**
 * Block/Building identifier validation
 */
export const blockSchema = z
    .string()
    .min(1, 'Blok bilgisi gerekli')
    .max(10, 'Blok en fazla 10 karakter olabilir')
    .transform(sanitizeInput);

/**
 * Apartment number validation
 */
export const apartmentSchema = z
    .string()
    .min(1, 'Daire numarası gerekli')
    .max(10, 'Daire numarası en fazla 10 karakter olabilir')
    .transform(sanitizeInput);

/**
 * Site ID validation - must be non-empty
 */
export const siteIdSchema = z
    .string()
    .min(1, 'Lütfen bir site seçin');

/**
 * Generic text content validation with XSS protection
 */
export const textContentSchema = z
    .string()
    .min(1, 'Bu alan boş bırakılamaz')
    .max(5000, 'Maksimum 5000 karakter')
    .transform(sanitizeInput);

// ============================================
// Form Schemas
// ============================================

/**
 * Login form validation schema
 */
export const loginFormSchema = z.object({
    username: usernameSchema,
    password: z.string().min(1, 'Şifre gerekli') // Don't validate password complexity on login
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

/**
 * Registration form - Step 1 (Personal Info)
 */
export const registerStep1Schema = z.object({
    name: nameSchema,
    username: usernameSchema,
    phoneNumber: phoneSchema
});

export type RegisterStep1Data = z.infer<typeof registerStep1Schema>;

/**
 * Registration form - Step 2 (Property Info)
 */
export const registerStep2Schema = z.object({
    siteId: siteIdSchema,
    block: blockSchema,
    apartment: apartmentSchema
});

export type RegisterStep2Data = z.infer<typeof registerStep2Schema>;

/**
 * Complete registration data
 */
export const registerFormSchema = registerStep1Schema.merge(registerStep2Schema);

export type RegisterFormData = z.infer<typeof registerFormSchema>;

// ============================================
// File Upload Validation
// ============================================

export interface FileValidationOptions {
    maxSizeBytes: number;
    allowedTypes: string[];
    allowedExtensions?: string[];
}

export interface FileValidationResult {
    valid: boolean;
    error?: string;
}

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
];

const ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

/**
 * Validates a file for uploads
 */
export function validateFile(
    file: File,
    options: Partial<FileValidationOptions> = {}
): FileValidationResult {
    const {
        maxSizeBytes = DEFAULT_MAX_FILE_SIZE,
        allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES],
        allowedExtensions
    } = options;

    // Size check
    if (file.size > maxSizeBytes) {
        const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(1);
        return {
            valid: false,
            error: `Dosya boyutu ${maxSizeMB}MB'dan büyük olamaz`
        };
    }

    // Type check
    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `Desteklenmeyen dosya türü: ${file.type || 'bilinmiyor'}`
        };
    }

    // Extension check (additional security)
    if (allowedExtensions) {
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (!extension || !allowedExtensions.includes(extension)) {
            return {
                valid: false,
                error: `Desteklenmeyen dosya uzantısı: .${extension || 'yok'}`
            };
        }
    }

    return { valid: true };
}

/**
 * Validates image files specifically
 */
export function validateImageFile(file: File): FileValidationResult {
    return validateFile(file, {
        maxSizeBytes: 5 * 1024 * 1024, // 5MB
        allowedTypes: ALLOWED_IMAGE_TYPES,
        allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp']
    });
}

/**
 * Validates document files specifically
 */
export function validateDocumentFile(file: File): FileValidationResult {
    return validateFile(file, {
        maxSizeBytes: 10 * 1024 * 1024, // 10MB
        allowedTypes: ALLOWED_DOCUMENT_TYPES,
        allowedExtensions: ['pdf', 'doc', 'docx']
    });
}

// ============================================
// Validation Helper
// ============================================

export interface ValidationError {
    field: string;
    message: string;
}

/**
 * Parses a Zod schema and returns formatted errors
 */
export function parseWithErrors<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: ValidationError[] } {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    const errors: ValidationError[] = result.error.errors.map((err: { path: (string | number)[]; message: string }) => ({
        field: err.path.join('.'),
        message: err.message
    }));

    return { success: false, errors };
}
