import { NextResponse } from 'next/server';
// Переконайтеся, що шлях до вашого файлу конфігурації БД правильний
import db from '@/lib/db'; // або який у вас шлях до підключення MySQL

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, name, gender, birthDate, deathDate, photoUrl } = body;

        // Перевірка, чи передано ID та ім'я
        if (!id || !name) {
            return NextResponse.json(
                { message: "Не вказано ID або ім'я родича" }, 
                { status: 400 }
            );
        }

        const formatDate = (dateStr: string | null) => {
            if (!dateStr) return null;
            // Якщо прийшов ISO рядок (з символом T), беремо лише частину до T
            return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
        };

        const cleanBirthDate = formatDate(birthDate);
        const cleanDeathDate = formatDate(deathDate);

        // Конвертація статі для бази даних (як у роуті create)
        const genderBoolean = gender === 'Чоловіча' ? 1 : 0;

        // Виконуємо SQL-запит на оновлення
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

        // Якщо жоден рядок не оновлено, значить такого ID немає
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