import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { saveStartupFormData } from '@/lib/crew-storage';
import { StartupInput } from '@/types/crew';

export async function POST(req: NextRequest) {
    try {
        // Get user session (NextAuth v5)
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { formData }: { formData: StartupInput } = await req.json();

        // Save to MongoDB
        await saveStartupFormData(session.user.email, formData);

        return NextResponse.json({ success: true, message: 'Form data saved successfully' });
    } catch (error: any) {
        console.error('Error saving startup form data:', error);
        return NextResponse.json(
            { error: 'Failed to save form data', details: error.message },
            { status: 500 }
        );
    }
}
