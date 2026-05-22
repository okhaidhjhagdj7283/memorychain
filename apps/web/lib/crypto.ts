/**
 * Client-side AES-GCM encryption/decryption cho private memories
 */

export interface EncryptResult {
  encryptedBytes: Uint8Array
  keyBase64: string
  ivBase64: string
}

export async function encryptFile(fileBytes: Uint8Array): Promise<EncryptResult> {
  // Tạo key ngẫu nhiên AES-256-GCM
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )

  // Tạo IV ngẫu nhiên 96-bit
  const iv = crypto.getRandomValues(new Uint8Array(12))

  // Encrypt
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    fileBytes
  )

  // Export key dạng Base64
  const rawKey = await crypto.subtle.exportKey('raw', key)
  const keyBase64 = arrayBufferToBase64(rawKey)
  const ivBase64 = arrayBufferToBase64(iv.buffer)

  return {
    encryptedBytes: new Uint8Array(encryptedBuffer),
    keyBase64,
    ivBase64,
  }
}

export async function decryptFile(
  encryptedBytes: Uint8Array,
  keyBase64: string,
  ivBase64: string
): Promise<Uint8Array> {
  const rawKey = base64ToArrayBuffer(keyBase64)
  const iv = base64ToArrayBuffer(ivBase64)

  const key = await crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  )

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    key,
    encryptedBytes
  )

  return new Uint8Array(decryptedBuffer)
}

export async function hashFile(fileBytes: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', fileBytes)
  return arrayBufferToHex(hashBuffer)
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  bytes.forEach(b => { binary += String.fromCharCode(b) })
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
