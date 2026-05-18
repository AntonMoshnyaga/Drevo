import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: "ID не надано" }, { status: 400 });
        }

        const [result] = await pool.query(
            'DELETE FROM family_members WHERE id = ?',
            [id]
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Помилка на сервері:", error);
        return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
    }
}