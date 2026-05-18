import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function DELETE(request: Request) {
    try {

        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json(
                { message: 'ID сім’ї не вказано' }, 
                { status: 400 }
            );
        }
        
        const [result]: any = await db.query(
            'DELETE FROM families WHERE id = ?', 
            [id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json(
                { message: 'Сім’ю не знайдено' }, 
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Сім’ю та всі пов’язані дані успішно видалено' }, 
            { status: 200 }
        );

    } catch (error: any) {

        console.error("Критична помилка API при видаленні сім’ї:", error);

        return NextResponse.json(
            { 
                message: 'Помилка на сервері при видаленні сім’ї', 
                details: error.message 
            }, 
            { status: 500 }
        );
    }
}