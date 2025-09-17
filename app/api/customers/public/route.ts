import { NextResponse } from "next/server";

const BACKEND_API = `${process.env.API_BASE_URL}/api/customers/public`;

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const res = await fetch(BACKEND_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            cache: "no-store",
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            return NextResponse.json(
                { message: "Spring Boot API error", error },
                { status: res.status }
            );
        }

        const data = await res.json().catch(() => ({}));
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { message: "Internal Error", error },
            { status: 500 }
        );
    }
}


