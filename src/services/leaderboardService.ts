import { getSupabase } from '../lib/supabase';
import type { FeedEntry, LeaderboardEntry } from '../types/game';

interface LeaderboardRow {
  user_id: string;
  display_name: string;
  arena_rating: number;
  power_score: number;
  depth: number;
  updated_at: string;
}

interface FeedRow {
  id: string;
  user_id: string;
  display_name: string;
  text: string;
  created_at: string;
}

function mapLeaderboardRow(row: LeaderboardRow, currentUserId: string): LeaderboardEntry {
  return {
    id: row.user_id,
    name: row.display_name,
    arenaRating: row.arena_rating,
    powerScore: row.power_score,
    depth: row.depth,
    timestamp: new Date(row.updated_at).getTime(),
    isPlayer: row.user_id === currentUserId,
  };
}

function mapFeedRow(row: FeedRow): FeedEntry {
  return {
    id: row.id,
    text: row.text,
    timestamp: new Date(row.created_at).getTime(),
  };
}

export async function fetchLeaderboard(currentUserId: string): Promise<LeaderboardEntry[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('leaderboard_entries')
    .select('user_id, display_name, arena_rating, power_score, depth, updated_at')
    .order('arena_rating', { ascending: false })
    .limit(100);

  if (error) throw error;

  return (data ?? []).map((row) => mapLeaderboardRow(row as LeaderboardRow, currentUserId));
}

export async function fetchFeed(limit = 50): Promise<FeedEntry[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('feed_entries')
    .select('id, user_id, display_name, text, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) => mapFeedRow(row as FeedRow));
}

export async function postFeedEntry(
  userId: string,
  displayName: string,
  text: string,
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('feed_entries').insert({
    user_id: userId,
    display_name: displayName,
    text,
  });

  if (error) throw error;
}

export async function applyArenaResult(params: {
  opponentId: string;
  playerWon: boolean;
  playerDelta: number;
  opponentDelta: number;
  playerPower: number;
  playerDepth: number;
}): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.rpc('apply_arena_result', {
    p_opponent_id: params.opponentId,
    p_player_won: params.playerWon,
    p_player_delta: params.playerDelta,
    p_opponent_delta: params.opponentDelta,
    p_player_power: params.playerPower,
    p_player_depth: params.playerDepth,
  });

  if (error) throw error;
}

export function getArenaOpponentsFromLeaderboard(
  leaderboard: LeaderboardEntry[],
): LeaderboardEntry[] {
  return leaderboard.filter((entry) => !entry.isPlayer);
}

export function getLeaderboardEntryById(
  leaderboard: LeaderboardEntry[],
  opponentId: string,
): LeaderboardEntry | undefined {
  return leaderboard.find((entry) => entry.id === opponentId && !entry.isPlayer);
}
