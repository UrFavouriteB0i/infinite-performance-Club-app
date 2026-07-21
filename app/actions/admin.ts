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

export async function syncReclubSession(reclubUrl: string) {
  if (!reclubUrl || !reclubUrl.startsWith("http")) {
    return { success: false, error: "Please provide a valid HTTP URL." };
  }

  // Determine base host (works both locally and on Vercel deployment)
  const host = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  try {
    const res = await fetch(`${host}/api/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: reclubUrl }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error || "Failed to process session." };
    }

    // Force Next.js to immediately purge the cached leaderboard and re-render
    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true, data: data };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error occurred." };
  }
}