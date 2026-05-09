import { NextResponse } from 'next/server';
import db from '@/lib/db'; // Припускаємо, що це ваш pool
import { ResultSetHeader, PoolConnection } from 'mysql2/promise';

export async function POST(req: Request) {
    // Отримуємо окреме з'єднання з пулу для транзакції
    const connection: PoolConnection = await db.getConnection();

    try {
        const { name, userId } = await req.json();

        if (!name || !userId) {
            return NextResponse.json({ error: 'Дані неповні' }, { status: 400 });
        }

        // 1. Починаємо транзакцію
        await connection.beginTransaction();

        // 2. Створюємо сім'ю
        // Згідно з вашою схемою: ID сім'ї (AI), ID аккаунта (owner), Назва
        const [familyResult] = await connection.execute<ResultSetHeader>(
            'INSERT INTO families (name, `account_id`) VALUES (?, ?)',
            [name, userId]
        );
        const familyId = familyResult.insertId;

        // 3. Створюємо зв'язок (Connection)
        // ID ролі для власника/адміна (наприклад, 1)
        const OWNER_ROLE_ID = 1; 

        await connection.execute(
            'INSERT INTO connections (`family_id`, `account_id`, `role_id`) VALUES (?, ?, ?)',
            [familyId, userId, OWNER_ROLE_ID]
        );

        // 4. Підтверджуємо транзакцію
        await connection.commit();

        return NextResponse.json({ 
            id: familyId, 
            name, 
            count: 1 
        }, { status: 201 });

    } catch (error) {
        // Якщо сталася помилка — відкочуємо зміни
        await connection.rollback();
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Помилка при створенні сім\'ї' }, { status: 500 });

    } finally {
        // ОБОВ'ЯЗКОВО повертаємо з'єднання в пул
        connection.release();
    }
}