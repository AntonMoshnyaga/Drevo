import { NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { familyId, accountId, roleId } = body;

        if (!familyId || !accountId || !roleId) {
            return NextResponse.json({ 
                message: 'Відсутні обов’язкові поля', 
                received: { familyId, accountId, roleId } 
            }, { status: 400 });
        }

        const [existingCodes]: any = await db.query(
            `SELECT code FROM join_codes 
            WHERE family_id = ? AND expiry_date > NOW() 
            LIMIT 1`,
            [Number(familyId)]
        );

        if (existingCodes.length > 0) {
            return NextResponse.json({ code: existingCodes[0].code }, { status: 200 });
        }

        const code = crypto.randomBytes(3).toString('hex').toUpperCase();

        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 24);
        const formattedDate = expiryDate.toISOString().slice(0, 19).replace('T', ' ');

        await db.query(
            `INSERT INTO join_codes (family_id, account_id, role_id, code, expiry_date, max_uses) 
            VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR), ?)`,
            [Number(familyId), Number(accountId), Number(roleId), code, 10]
        );

        console.log("Згенеровано новий код:", code);
        return NextResponse.json({ code }, { status: 200 });

    } catch (error: any) {
        console.error("ПОМИЛКА БД ПРИ ГЕНЕРАЦІЇ КОДУ:", error.message);
        
        return NextResponse.json({ 
            message: 'Помилка бази даних', 
            error: error.message 
        }, { status: 500 });
    }
}