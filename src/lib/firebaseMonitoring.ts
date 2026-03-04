import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export async function getUserCount(): Promise<number> {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.size;
  } catch (err) {
    console.error('Failed to get user count:', err);
    return 0;
  }
}

export async function estimateFirebaseCosts(userCount: number): Promise<{
  estimatedReads: number;
  estimatedWrites: number;
  estimatedCost: number;
}> {
  // Rough estimates based on typical usage
  const readsPerUser = 50; // auth checks, vault loads, etc.
  const writesPerUser = 10; // credits, listings, reports
  
  const estimatedReads = userCount * readsPerUser;
  const estimatedWrites = userCount * writesPerUser;
  
  // Firebase pricing: $0.06 per 100k reads, $0.18 per 100k writes
  const readCost = (estimatedReads / 100000) * 0.06;
  const writeCost = (estimatedWrites / 100000) * 0.18;
  
  return {
    estimatedReads,
    estimatedWrites,
    estimatedCost: readCost + writeCost,
  };
}

export function shouldAlert(userCount: number): boolean {
  // Alert at 1k, 2k, 3k, etc.
  return userCount > 0 && userCount % 1000 === 0;
}
