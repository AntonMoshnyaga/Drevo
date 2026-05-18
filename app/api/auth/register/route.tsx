import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ message: 'Всі поля обов’язкові' }, { status: 400 });
        }

        const [existingUsers] = await pool.query(
            'SELECT id FROM accounts WHERE email = ?',
            [email]
        );

        if ((existingUsers as any[]).length > 0) {
            return NextResponse.json({ message: 'Користувач з таким e-mail вже існує' }, { status: 409 });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result]: any = await pool.query(
            'INSERT INTO accounts (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        const insertId = result.insertId;

        return NextResponse.json({ 
            message: 'Акаунт успішно створено!',
            user: {
                id: insertId,
                name: name,
                email: email
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Помилка реєстрації:', error);
        return NextResponse.json({ message: 'Внутрішня помилка сервера' }, { status: 500 });
    }
}