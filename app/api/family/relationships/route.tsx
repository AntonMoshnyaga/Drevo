import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { parent_id, child_id, relation_type } = await request.json();

        if (!parent_id || !child_id) {
            return NextResponse.json({ error: 'Відсутні ID для зв\'язку' }, { status: 400 });
        }

        const [existing] = await pool.query(
            'SELECT * FROM relationships WHERE parent_id = ? AND child_id = ?',
            [parent_id, child_id]
        );

        if ((existing as any[]).length > 0) {
            return NextResponse.json({ error: 'Цей зв’язок уже існує' }, { status: 409 });
        }

        await pool.query(
            'INSERT INTO relationships (parent_id, child_id, relation_type) VALUES (?, ?, ?)',
            [parent_id, child_id, relation_type || 'biological']
        );

        return NextResponse.json({ success: true }, { status: 201 });

    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { parent_id, child_id } = await request.json();

        if (!parent_id || !child_id) {
            return NextResponse.json({ error: 'Відсутні ID для видалення зв\'язку' }, { status: 400 });
        }

        const [result]: any = await pool.query(
            'DELETE FROM relationships WHERE parent_id = ? AND child_id = ?',
            [parent_id, child_id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Зв’язок не знайдено' }, { status: 404 });
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error("Database error during DELETE:", error);
        return NextResponse.json({ error: 'Помилка сервера при видаленні' }, { status: 500 });
    }
}