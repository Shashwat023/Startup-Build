import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getStartupFormData } from '@/lib/crew-storage';

export async function GET(req: NextRequest) {
    try {
        // Get user session (NextAuth v5)
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Retrieve from MongoDB
        const formData = await getStartupFormData(session.user.email);

        if (!formData) {
            return NextResponse.json({ formData: null }, { status: 200 });
        }

        return NextResponse.json({ formData });
    } catch (error: any) {
        console.error('Error retrieving startup form data:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve form data', details: error.message },
            { status: 500 }
        );
    }
}
