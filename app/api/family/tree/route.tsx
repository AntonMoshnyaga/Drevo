import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const familyId = searchParams.get('familyId');

    const cookieStore = await cookies();
    const userId = cookieStore.get('auth-token')?.value;

    if (!familyId) {
        return NextResponse.json({ error: 'Family ID is required' }, { status: 400 });
    }

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {

        const [rows]: any = await db.query(
            'SELECT * FROM connections WHERE family_id = ? AND account_id = ?',
            [familyId, userId]
        );

        if (rows.length === 0) {

            return NextResponse.json({ error: 'Доступ заборонено до цієї сім\'ї' }, { status: 403 });
        }

        const [members]: any = await db.query(
            'SELECT id, name, photo_url, gender, birth_date, death_date FROM family_members WHERE family_id = ?',
            [familyId]
        );
        
        const [rels]: any = await db.query(
            `SELECT r.parent_id, r.child_id, r.relation_type 
            FROM relationships r 
            JOIN family_members m ON r.child_id = m.id 
            WHERE m.family_id = ?`,
            [familyId]
        );

        const nodes = members.map((m: any, index: number) => ({
            id: m.id.toString(),
            type: 'familyNode',
            data: { 
                label: m.name, 
                photo_url: m.photo_url,
                gender: m.gender,
                birth_date: m.birth_date,
                death_date: m.death_date
            },
            position: { x: (index % 3) * 250, y: Math.floor(index / 3) * 150 },
        }));

        const edges = rels.map((r: any) => ({
            id: `e-${r.parent_id}-${r.child_id}`,
            source: r.parent_id.toString(),
            target: r.child_id.toString(),
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#AD9561', strokeWidth: 2 }
        }));

        return NextResponse.json({ nodes, edges });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Помилка бази даних' }, { status: 500 });
    }
}