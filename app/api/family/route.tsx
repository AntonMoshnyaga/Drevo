import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const familyId = searchParams.get('familyId');
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Не вказано ID користувача' }, { status: 400 });
        }

        // 1. ЗАПИТ НА СПИСОК СІМЕЙ (завжди потрібен для головної або бічної панелі)
        const familyListQuery = `
            SELECT 
                f.id as id, 
                f.name as name,
                (SELECT COUNT(*) FROM family_members WHERE family_id = f.id) as count
            FROM families f
            JOIN connections c ON f.id = c.family_id
            WHERE c.account_id = ?
        `;
        const [families] = await db.execute(familyListQuery, [userId]);

        // 2. ЯКЩО familyId НЕМАЄ — повертаємо просто масив сімей (для MainPage)
        if (!familyId) {
            return NextResponse.json(families, { status: 200 });
        }

        // 3. ЯКЩО familyId Є — збираємо повні дані дерева
        const [nodes] = await db.execute(
            'SELECT id, name as label, gender, photo_url, birth_date, death_date, position_x, position_y FROM family_members WHERE family_id = ?',
            [familyId]
        );

        const [relationships] = await db.execute(
            'SELECT parent_id, child_id, relation_type FROM relationships WHERE child_id IN (SELECT id FROM family_members WHERE family_id = ?)',
            [familyId]
        );

        return NextResponse.json({
            nodes: nodes,
            edges: relationships,
            families: families // Список сімей теж додаємо про всяк випадок
        }, { status: 200 });

    } catch (error) {
        console.error('Помилка завантаження:', error);
        return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 });
    }
}