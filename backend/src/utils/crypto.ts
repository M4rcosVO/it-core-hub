import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const SECRET = process.env.ENCRYPTION_KEY || 'gellak-it-core-encryption-key-2026';
// Derive a 32-byte key using SHA-256
const KEY = crypto.createHash('sha256').update(SECRET).digest();

/**
 * Criptografa uma senha ou texto plano usando AES-256-CBC.
 * Retorna no formato iv:encryptedData (em hexadecimal).
 */
export function encryptPassword(plainText: string): string {
  if (!plainText) return plainText;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Descriptografa uma senha ou texto cifrado no formato iv:encryptedData.
 * Se o formato não for reconhecido, retorna o próprio texto (compatibilidade).
 */
export function decryptPassword(cipherText: string): string {
  if (!cipherText) return cipherText;
  const parts = cipherText.split(':');
  if (parts.length !== 2 || parts[0].length !== 32) {
    // Não está no formato iv:encrypted (ex.: texto salvo anteriormente em plano)
    return cipherText;
  }

  try {
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Erro ao descriptografar:', error);
    return cipherText;
  }
}

/**
 * Verifica se uma string está no formato cifrado iv:encryptedData
 */
export function isEncrypted(text: string): boolean {
  if (!text) return false;
  const parts = text.split(':');
  return parts.length === 2 && parts[0].length === 32 && /^[0-9a-fA-F]+$/.test(parts[0]) && /^[0-9a-fA-F]+$/.test(parts[1]);
}
