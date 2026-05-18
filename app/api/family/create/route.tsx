import { NextResponse } from 'next/server';
import db from '@/lib/db'; 
import { ResultSetHeader, PoolConnection } from 'mysql2/promise';

export async function POST(req: Request) {

    const connection: PoolConnection = await db.getConnection();

    try {
        const { name, userId } = await req.json();

        if (!name || !userId) {
            return NextResponse.json({ error: 'Дані неповні' }, { status: 400 });
        }

        await connection.beginTransaction();

        const [familyResult] = await connection.execute<ResultSetHeader>(
            'INSERT INTO families (name, `account_id`) VALUES (?, ?)',
            [name, userId]
        );
        const familyId = familyResult.insertId;

        const OWNER_ROLE_ID = 1; 

        await connection.execute(
            'INSERT INTO connections (`family_id`, `account_id`, `role_id`) VALUES (?, ?, ?)',
            [familyId, userId, OWNER_ROLE_ID]
        );

        await connection.commit();

        return NextResponse.json({ 
            id: familyId, 
            name, 
            count: 1 
        }, { status: 201 });

    } catch (error) {

        await connection.rollback();
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Помилка при створенні сім\'ї' }, { status: 500 });

    } finally {
        connection.release();
    }
}