import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Shop, UserProfile } from '../lib/types';
import { useAuth } from '../lib/AuthContext';
import { BarChart3, Users, Store, Map } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function Reports() {
  const { profile } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [users, setUsers] = useState<Record<string, UserProfile>>({});

  useEffect(() => {
    if (profile?.role !== 'manager') return;
    
    // Fetch users for mapping rep names
    getDocs(collection(db, 'users')).then(snap => {
      const uMap: Record<string, UserProfile> = {};
      snap.forEach(d => {
        uMap[d.id] = { id: d.id, ...d.data() } as UserProfile;
      });
      setUsers(uMap);
    });

    const unsubShops = onSnapshot(query(collection(db, 'shops')), (snapshot) => {
      setShops(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shop)));
    });

    return () => unsubShops();
  }, [profile]);

  if (profile?.role !== 'manager') {
    return <Navigate to="/" />;
  }

  // Aggregate by Rep
  const repStats: Record<string, { total: number, actualClients: number }> = {};
  // Aggregate by District
  const districtStats: Record<string, number> = {};

  shops.forEach(shop => {
    // By rep
    const repId = shop.addedBy;
    if (!repStats[repId]) repStats[repId] = { total: 0, actualClients: 0 };
    repStats[repId].total++;
    if (shop.status === 'actual_client') repStats[repId].actualClients++;

  // By area
    const dist = shop.area || shop.district || 'غير محدد';
    districtStats[dist] = (districtStats[dist] || 0) + 1;
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">التقارير والأداء</h1>
        <p className="text-slate-500">إحصائيات شاملة لأداء المندوبين وتوزيع المناطق</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Reps Performance */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <Users className="text-blue-500" />
            <h2 className="text-xl font-bold text-slate-800">أداء المندوبين</h2>
          </div>
          
          <div className="space-y-4">
            {Object.entries(repStats).map(([repId, stats]) => (
              <div key={repId} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <h3 className="font-bold text-slate-900">{users[repId]?.name || 'مندوب غير معروف'}</h3>
                </div>
                <div className="flex gap-4 text-center">
                  <div>
                    <p className="text-xs text-slate-500">محلات جديدة</p>
                    <p className="font-bold text-slate-900">{stats.total}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">عملاء فعليون</p>
                    <p className="font-bold text-emerald-600">{stats.actualClients}</p>
                  </div>
                </div>
              </div>
            ))}
            {Object.keys(repStats).length === 0 && <p className="text-slate-500 text-center">لا توجد بيانات</p>}
          </div>
        </div>

        {/* Districts Performance */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <Map className="text-amber-500" />
            <h2 className="text-xl font-bold text-slate-800">توزيع المناطق</h2>
          </div>
          
          <div className="space-y-3">
            {Object.entries(districtStats)
              .sort((a, b) => b[1] - a[1]) // Sort desc
              .map(([dist, total]) => (
                <div key={dist} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-700">{dist}</span>
                    <span className="font-bold text-slate-900">{total} محل</span>
                  </div>
                  {/* Simple progress bar representation */}
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 rounded-full" 
                      style={{ width: `${Math.min((total / Math.max(shops.length, 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
            ))}
            {Object.keys(districtStats).length === 0 && <p className="text-slate-500 text-center">لا توجد بيانات</p>}
          </div>
        </div>

      </div>
    </div>
  );
}
