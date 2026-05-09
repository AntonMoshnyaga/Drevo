import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const familyId = searchParams.get('familyId');

    if (!familyId) {
        return NextResponse.json({ error: 'Family ID is required' }, { status: 400 });
    }

    try {
        // 1. Отримуємо членів сім'ї
        const [members]: any = await db.query(
            'SELECT id, name, photo_url, gender, birth_date, death_date FROM family_members WHERE family_id = ?',
            [familyId]
        );
        
        // 2. Отримуємо зв'язки за новою структурою (parent_id, child_id)
        const [rels]: any = await db.query(
            `SELECT r.parent_id, r.child_id, r.relation_type 
             FROM relationships r 
             JOIN family_members m ON r.child_id = m.id 
             WHERE m.family_id = ?`,
            [familyId]
        );

        // 3. Формуємо вузли (Nodes)
        const nodes = members.map((m: any, index: number) => ({
            id: m.id.toString(),
            type: 'familyNode', // Вказуємо твій кастомний тип Node2D
            data: { 
                label: m.name, 
                photo_url: m.photo_url,
                gender: m.gender,
                birth_date: m.birth_date,
                death_date: m.death_date
            },
            position: { x: (index % 3) * 250, y: Math.floor(index / 3) * 150 },
        }));

        // 4. Формуємо зв'язки (Edges) за новою логікою
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