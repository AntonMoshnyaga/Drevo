import { NextResponse } from 'next/server';
import db from '@/lib/db'; 

export async function DELETE(req: Request) {
    try {
        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'ID користувача обов\'язковий для видалення' }, 
                { status: 400 }
            );
        }

        const [result] = await db.query('DELETE FROM accounts WHERE id = ?', [id]);

        return NextResponse.json(
            { message: 'Акаунт успішно видалено' },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Помилка при видаленні акаунта:', error);
        
        return NextResponse.json(
            { error: 'Внутрішня помилка сервера при видаленні акаунта' }, 
            { status: 500 }
        );
    }
}