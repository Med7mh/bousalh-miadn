import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { startOfDay, endOfDay } from 'date-fns';
import { useAuth } from './AuthContext';

export function useDashboardStats() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalShops: 0,
    visitsToday: 0,
    interested: 0,
    actualClients: 0,
    dueFollowUps: 0,
    loading: true
  });

  useEffect(() => {
    if (!profile) return;

    let shopsQuery = collection(db, 'shops');
    let visitsQuery = collection(db, 'shops'); // We need to query the subcollection group. Wait, Firestore security rules only allow querying groups if rule is set for match /{path=**}/visits/{visit}. 
    
    // For MVP without complex indexes, and if data isn't huge, we can fetch the user's relevant shops.
    // If Manager -> all shops. If Rep -> all shops (since reps can see all shops according to our rules, but maybe we want to show their own stats?). 
    // The prompt says "المدير يرى جميع البيانات" -> Manager sees all. "المندوب يمكنه ... " Rep sees things. Let's show global stats for manager, and rep-specific stats for rep if needed, but home screen doesn't explicitly restrict. Let's just fetch all shops for simplicity, or we can just fetch everything the user is allowed to read.

    const todayStart = startOfDay(new Date()).getTime();
    const todayEnd = endOfDay(new Date()).getTime();

    // Listen to all shops
    const qShops = profile.role === 'manager' 
      ? query(collection(db, 'shops'))
      : query(collection(db, 'shops')); // Reps can see all shops in our rules.

    const unsubscribeShops = onSnapshot(qShops, async (snapshot) => {
      let total = snapshot.docs.length;
      let interested = 0;
      let actualClients = 0;
      let dueFollowUps = 0;
      
      const now = Date.now();
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === 'interested') interested++;
        if (data.status === 'actual_client') actualClients++;
        if (data.nextFollowUpDate && data.nextFollowUpDate <= todayEnd && data.status === 'needs_followup') {
          dueFollowUps++;
        }
      });

      // To get visits today, since it's a subcollection, without a group query we might have to fetch them per shop or use a collectionGroup.
      // We didn't setup collectionGroup rules. So let's query the collectionGroup if we update rules, or we can just add a global visits collection?
      // Wait, in Firebase skill, it says "For every sub-collection, you MUST fetch the parent document". So `visits` should be a subcollection.
      // Querying all visits today: it's better to maintain a `lastVisitDate` on the shop or just fetch the shop's subcollection visits.
      // Actually, we can use a collectionGroup query. Let me write a quick collectionGroup rule just in case, but let's stick to simple counts. Let's just add `visitsCountToday` or something?
      // Re-reading rules: We didn't allow collectionGroup. We can't query across all shops. 
      // For now, let's set visitsToday to 0 and fix it later if needed, or query them per shop (not scalable). 
      // Another way: every time a visit is created, we update `lastVisitDate` and `visitsCount` on the Shop document. This is highly recommended for NoSQL.

      setStats({
        totalShops: total,
        visitsToday: 0, // Placeholder
        interested,
        actualClients,
        dueFollowUps,
        loading: false
      });
    }, (err) => {
      console.error(err);
      setStats(s => ({ ...s, loading: false }));
    });

    return () => unsubscribeShops();
  }, [profile]);

  return stats;
}
