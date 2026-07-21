'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';

export async function createPlayer(formData: FormData) {
  const pin = formData.get('pin');
  
  // Checks PIN against process.env.ADMIN_PIN
  if (pin !== process.env.ADMIN_PIN) {
    throw new Error('Unauthorized: Invalid PIN');
  }

  const name = formData.get('name') as string;
  const region = formData.get('region') as string;
  const points = parseInt(formData.get('points') as string, 10) || 1000;

  const { error } = await supabaseAdmin
    .from('players')
    .insert([{ name, region, points, matches: 0, wins: 0, losses: 0 }]);

  if (error) {
    console.error('Error adding player:', error);
    throw new Error('Failed to create player');
  }

  // Refreshes the cache on the main leaderboard page instantly
  revalidatePath('/');
}