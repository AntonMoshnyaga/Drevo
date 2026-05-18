import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const familyId = searchParams.get('familyId');
        const accountId = searchParams.get('accountId');

        if (!familyId || !accountId) {
            return NextResponse.json({ message: 'Missing parameters' }, { status: 400 });
        }

        const [accessCheck]: any = await db.query(
            'SELECT role_id FROM connections WHERE family_id = ? AND account_id = ?',
            [familyId, accountId]
        );

        if (accessCheck.length === 0) {
            return NextResponse.json({ message: 'Доступ заборонено' }, { status: 403 });
        }

        const [members]: any = await db.query(`
            SELECT 
                a.id as account_id, 
                a.name, 
                a.email, 
                c.role_id,
                r.role_name as role_name
            FROM accounts a
            JOIN connections c ON a.id = c.account_id
            JOIN roles r ON c.role_id = r.id
            WHERE c.family_id = ?`, 
            [familyId]
        );

        const [invites]: any = await db.query(
            'SELECT id, code, role_id, expiry_date, max_uses, uses_count FROM join_codes WHERE family_id = ?',
            [familyId]
        );

        return NextResponse.json({
            members: members,
            invites: invites
        });

    } catch (error: any) {
        console.error('API Control Error:', error);
        return NextResponse.json({ message: 'Server Error', error: error.message }, { status: 500 });
    }
}