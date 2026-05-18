import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function DELETE(req: Request) {
    try {
        const { inviteId, familyId, requesterId } = await req.json();

        if (!inviteId || !familyId || !requesterId) {
            return NextResponse.json({ error: 'Відсутні дані для видалення' }, { status: 400 });
        }

        const [access]: any = await db.query(
            'SELECT role_id FROM connections WHERE family_id = ? AND account_id = ?',
            [familyId, requesterId]
        );

        if (!access.length || access[0].role_id !== 1) {
            return NextResponse.json({ error: 'Немає прав для керування кодами' }, { status: 403 });
        }

        await db.query(
            'DELETE FROM join_codes WHERE id = ? AND family_id = ?',
            [inviteId, familyId]
        );

        return NextResponse.json({ message: 'Код успішно анульовано' });

    } catch (error: any) {
        console.error('Revoke invite error:', error);
        return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 });
    }
}