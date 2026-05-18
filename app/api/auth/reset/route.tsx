import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: 'Email обов’язковий' }, { status: 400 });
        }

        const [users]: any = await db.execute('SELECT id FROM accounts WHERE email = ?', [email]);

        if (users.length === 0) {
            return NextResponse.json({ message: 'Якщо email є в базі, лист буде надіслано' }, { status: 200 });
        }


        return NextResponse.json({ message: 'Лист для скидання надіслано' }, { status: 200 });

    } catch (error) {
        console.error('Reset error:', error);
        return NextResponse.json({ message: 'Помилка сервера' }, { status: 500 });
    }
}