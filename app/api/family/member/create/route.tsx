import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { name, gender, birthDate, deathDate, familyId, photoUrl } = await req.json();

        if (!name || !familyId) {
            return NextResponse.json({ error: 'Name and Family ID are required' }, { status: 400 });
        }

        // ПЕРЕТВОРЕННЯ: Якщо стать 'Чоловіча', то 1 (true), інакше 0 (false)
        const genderBoolean = gender === 'Чоловіча' ? 1 : 0;

        const [result]: any = await db.query(
            'INSERT INTO family_members (name, gender, birth_date, death_date, family_id, photo_url) VALUES (?, ?, ?, ?, ?, ?)',
            [name, genderBoolean, birthDate || null, deathDate || null, familyId, photoUrl || null]
        );

        return NextResponse.json({ 
            success: true, 
            id: result.insertId,
            message: 'Члена сім\'ї додано' 
        });
    } catch (error) {
        console.error('Create Member Error:', error);
        return NextResponse.json({ error: 'Помилка при створенні запису' }, { status: 500 });
    }
}