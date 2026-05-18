import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, name, gender, birthDate, deathDate, photoUrl } = body;

        if (!id || !name) {
            return NextResponse.json(
                { message: "Не вказано ID або ім'я родича" }, 
                { status: 400 }
            );
        }

        const formatDate = (dateStr: string | null) => {
            if (!dateStr) return null;

            return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
        };

        const cleanBirthDate = formatDate(birthDate);
        const cleanDeathDate = formatDate(deathDate);

        const genderBoolean = gender === 'Чоловіча' ? 1 : 0;

        const [result]: any = await db.query(
            `UPDATE family_members 
                SET name = ?, gender = ?, birth_date = ?, death_date = ?, photo_url = ? 
                WHERE id = ?`,
            [
                name, 
                genderBoolean, 
                cleanBirthDate || null, 
                cleanDeathDate || null, 
                photoUrl || null, 
                id
            ]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { message: "Родича з таким ID не знайдено" }, 
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Дані успішно оновлено" }, 
            { status: 200 }
        );

    } catch (error) {
        console.error("Помилка оновлення родича:", error);
        return NextResponse.json(
            { message: "Внутрішня помилка сервера" }, 
            { status: 500 }
        );
    }
}