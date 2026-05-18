import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
        return NextResponse.json({ message: 'Заповніть всі поля' }, { status: 400 });
    }

    const [rows]: any = await pool.query(
        'SELECT * FROM accounts WHERE email = ? OR name = ?',
        [identifier, identifier]
    );

    const user = rows[0];

    if (!user) {
        return NextResponse.json({ message: 'Користувача не знайдено' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return NextResponse.json({ message: 'Невірний пароль' }, { status: 401 });
    }

    return NextResponse.json({ 
        message: 'Вхід успішний',
        user: { id: user.id, name: user.name, email: user.email, photo_url: user.photo_url } 
    }, { status: 200 });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ message: 'Помилка сервера' }, { status: 500 });
    }
}