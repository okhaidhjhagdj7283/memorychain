import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'memorychain-dev-secret'
)
const COOKIE_NAME = 'mc_session'

export interface SessionPayload {
  walletAddress: string
  iat?: number
  exp?: number
}

export async function signJWT(walletAddress: string): Promise<string> {
  return new SignJWT({ walletAddress })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyJWT(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as SessionPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyJWT(token)
}

export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyJWT(token)
}

export function setSessionCookie(token: string): { name: string; value: string; options: object } {
  return {
    name: COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    },
  }
}

export function generateNonce(): string {
  const array = new Uint8Array(32)
  if (typeof window !== 'undefined') {
    crypto.getRandomValues(array)
  } else {
    // Server side
    const { randomBytes } = require('crypto')
    const bytes = randomBytes(32)
    bytes.copy(Buffer.from(array.buffer))
  }
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function createSignMessage(nonce: string, walletAddress: string): string {
  return `Chào mừng đến với MemoryChain!\n\nXác thực đăng nhập của bạn:\nĐịa chỉ ví: ${walletAddress}\nNonce: ${nonce}\nThời gian: ${new Date().toISOString()}\n\nBằng cách ký message này, bạn đồng ý với Điều khoản dịch vụ của MemoryChain.`
}
