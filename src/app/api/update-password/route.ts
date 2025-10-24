import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// This route is protected by the is_admin() check in the middleware or page-level auth.
// For this to work, the server environment MUST have:
// - SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY (this is a secret, do not expose it to the client)

export async function POST(req: NextRequest) {
  try {
    const { userId, newPassword } = await req.json();

    if (!userId || !newPassword) {
      return NextResponse.json({ error: 'User ID and new password are required' }, { status: 400 });
    }
    
    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // Create a Supabase client with the service role key to perform admin actions
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Update the user's password
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (error) {
      console.error('Supabase admin error:', error);
      return NextResponse.json({ error: error.message || 'Failed to update password' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Password updated successfully', user: data.user }, { status: 200 });

  } catch (e) {
    console.error('API Error:', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'An unexpected error occurred' }, { status: 500 });
  }
}
