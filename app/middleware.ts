import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '')

    // Các route auth không cần thiết nữa vì đã bọc login trực tiếp
    const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password']

    const { pathname } = request.nextUrl

    // Nếu đang ở trang auth và đã có token, redirect về admin
    if (authRoutes.some(route => pathname.startsWith(route)) && token) {
        return NextResponse.redirect(new URL('/admin', request.url))
    }

    // Không cần redirect admin nữa vì đã có LoginWrapper
    return NextResponse.next()
}

export const config = {
    matcher: [
        '/auth/:path*'
    ]
}
