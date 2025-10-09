import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Get backend URL with fallback
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const registerUrl = `${backendUrl}/api/customers/admin`;

        // Forward request to backend
        const response = await fetch(registerUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        console.log('- Response data:', data);

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || 'Đăng ký tài khoản thất bại' },
                { status: response.status }
            );
        }

        // Return the response from backend
        return NextResponse.json(data);
    } catch (error) {
        console.error('❌ Auth proxy error:', error);
        return NextResponse.json(
            { message: 'Lỗi kết nối đến server' },
            { status: 500 }
        );
    }
}
