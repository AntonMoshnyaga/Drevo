import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth-token')?.value;

    const { pathname } = request.nextUrl;

    const isAuthPage = pathname.startsWith('/pages/auth') || 
                pathname.startsWith('/pages/registr');
    
    const isProtectedPage = pathname.startsWith('/pages/family');

    if (isProtectedPage && !token) {
        return NextResponse.redirect(new URL('/pages/auth', request.url));
    }

    if (isAuthPage && token) {
        return NextResponse.redirect(new URL('/pages/main', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/pages/family/:path*', '/pages/auth', '/pages/registr'],
};