'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';
import { processSyncLogic } from '@/lib/sync';

export async function createPlayer(formData: FormData) {
  const pin = formData.get('pin');
  
  // Checks PIN against process.env.ADMIN_PIN
  if (pin !== process.env.ADMIN_PIN) {
    throw new Error('Unauthorized: Invalid PIN');
  }

  const name = formData.get('name') as string;
  const region = formData.get('region') as string;
  const elo = parseInt(formData.get('points') as string, 10) || 1000;

  const { error } = await supabaseAdmin
    .from('players')
    .insert([{ name, region, elo, matches_played: 0, wins: 0, losses: 0 }]);

  if (error) {
    console.error('Error adding player:', error);
    throw new Error('Failed to create player');
  }

  // Refreshes the cache on the main leaderboard page instantly
  revalidatePath('/');
}

export async function syncReclubSession(reclubUrl: string, region: string) {
  if (!reclubUrl || !reclubUrl.startsWith("http")) {
    return { success: false, error: "Please provide a valid HTTP URL." };
  }

  try {
    const data = await processSyncLogic(reclubUrl, region);

    // Force Next.js to immediately purge the cached leaderboard and re-render
    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to process session." };
  }
}