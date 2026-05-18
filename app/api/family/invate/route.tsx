import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { code, accountId } = body; 

        console.log("Спроба приєднання:", { code, accountId });

        if (!code || !accountId) {
            return NextResponse.json({ 
                message: 'Код та ID користувача обов’язкові' 
            }, { status: 400 });
        }

        const [codes]: any = await db.query(
            `SELECT family_id, role_id, uses_count, max_uses FROM join_codes 
                WHERE code = ? AND expiry_date > NOW()`,
            [code]
        );

        if (!codes || codes.length === 0) {
            return NextResponse.json({ message: 'Код недійсний або протермінований' }, { status: 404 });
        }

        const { family_id, role_id, uses_count, max_uses } = codes[0];

        const [existing]: any = await db.query(
            'SELECT * FROM connections WHERE family_id = ? AND account_id = ?',
            [family_id, accountId]
        );

        if (existing.length > 0) {
            return NextResponse.json({ message: 'Ви вже є учасником цієї сім’ї' }, { status: 400 });
        }

        await db.query(
            'INSERT INTO connections (family_id, account_id, role_id) VALUES (?, ?, ?)',
            [family_id, accountId, role_id]
        );

        const newUsesCount = uses_count + 1;
        
        await db.query(
            'UPDATE join_codes SET uses_count = ? WHERE code = ?',
            [newUsesCount, code]
        );

        if (newUsesCount >= max_uses) {
            await db.query('DELETE FROM join_codes WHERE code = ?', [code]);
            console.log(`Код ${code} був видалений, оскільки досягнуто ліміт використань (${max_uses})`);
        }

        return NextResponse.json({ message: 'Успішно приєднано!' }, { status: 200 });

    } catch (error: any) {
        console.error("Критична помилка при вступі до сім'ї:", error);
        return NextResponse.json({ 
            message: 'Помилка на сервері', 
            details: error.message 
        }, { status: 500 });
    }
}