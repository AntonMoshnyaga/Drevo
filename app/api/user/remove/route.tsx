import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function DELETE(req: Request) {
    try {
        const { familyId, accountId, requesterId } = await req.json();

        if (!familyId || !accountId || !requesterId) {
            return NextResponse.json({ error: 'Відсутні обов’язкові параметри' }, { status: 400 });
        }

        const [requesterRole]: any = await db.query(
            'SELECT role_id FROM connections WHERE family_id = ? AND account_id = ?',
            [familyId, requesterId]
        );

        if (!requesterRole.length || requesterRole[0].role_id !== 1) {
            return NextResponse.json({ error: 'Тільки власник може видаляти учасників' }, { status: 403 });
        }

        if (Number(accountId) === Number(requesterId)) {
            return NextResponse.json({ error: 'Ви не можете видалити себе' }, { status: 400 });
        }

        await db.query(
            'DELETE FROM connections WHERE family_id = ? AND account_id = ?',
            [familyId, accountId]
        );

        return NextResponse.json({ message: 'Учасника успішно видалено' });

    } catch (error: any) {
        console.error('Remove member error:', error);
        return NextResponse.json({ error: 'Помилка сервера при видаленні' }, { status: 500 });
    }
}