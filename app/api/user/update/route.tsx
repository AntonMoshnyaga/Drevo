import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request) {
    try {
        const { id, name, email, password, avatar } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'ID користувача обов’язковий' }, { status: 400 });
        }

        let query = "UPDATE accounts SET name = ?, email = ?, photo_url = ?";
        let params = [name, email, avatar];

        if (password && password.trim() !== "") {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += ", password = ?";
            params.push(hashedPassword);
        }

        query += " WHERE id = ?";
        params.push(id);

        await db.execute(query, params);

        return NextResponse.json({ message: 'Профіль оновлено успішно' }, { status: 200 });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Помилка при оновленні бази даних' }, { status: 500 });
    }
}