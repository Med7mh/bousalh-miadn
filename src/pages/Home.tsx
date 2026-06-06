import React, { useEffect, useState } from 'react';
import { useDashboardStats } from '../lib/hooks';
import { Store, CalendarClock, Users, CheckCircle2, TrendingUp, Bell, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Shop } from '../lib/types';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function Home() {
  const stats = useDashboardStats();
  const navigate = useNavigate();
  const [recentShops, setRecentShops] = useState<Shop[]>([]);

  useEffect(() => {
    // Use updatedAt for recent activity to bypass missing indices on lastVisitDate
    const fetchRecent = async () => {
      try {
        const q = query(collection(db, 'shops'), orderBy('updatedAt', 'desc'), limit(3));
        const snap = await getDocs(q);
        setRecentShops(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shop)));
      } catch (err) {
        console.error(err);
      }
    };
    fetchRecent();
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">مرحباً بك</h1>
          <p className="text-slate-500">نظرة عامة على أدائك اليوم</p>
        </div>
        <div className="bg-white p-2 rounded-full shadow-sm relative text-slate-400 hover:text-slate-900 transition-colors">
          <Bell size={24} />
          {stats.dueFollowUps > 0 && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
          )}
        </div>
      </header>

      {/* Ticker / Alert alert */}
      {stats.dueFollowUps > 0 && (
        <div 
          onClick={() => navigate('/follow-ups')}
          className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-xl flex items-center justify-between cursor-pointer hover:bg-orange-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <CalendarClock className="text-orange-600" />
            <span className="font-semibold">لديك {stats.dueFollowUps} متابعات مستحقة اليوم</span>
          </div>
          <span className="text-sm font-bold text-orange-600">&larr;</span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon={Store} 
          label="المحلات" 
          value={stats.totalShops} 
          color="bg-blue-50 text-blue-600" 
        />
        <StatCard 
          icon={TrendingUp} 
          label="زيارات اليوم" 
          value={stats.visitsToday} 
          color="bg-emerald-50 text-emerald-600" 
        />
        <StatCard 
          icon={Users} 
          label="عملاء مهتمون" 
          value={stats.interested} 
          color="bg-amber-50 text-amber-600" 
        />
        <StatCard 
          icon={CheckCircle2} 
          label="عملاء فعليون" 
          value={stats.actualClients} 
          color="bg-indigo-50 text-indigo-600" 
        />
      </div>

      <div className="pt-4 grid md:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
            <h2 className="font-bold text-lg mb-4 text-slate-800">آخر المحلات التي تمت زيارتها</h2>
            <div className="space-y-3 flex-1">
              {recentShops.length === 0 ? (
                <div className="text-sm text-slate-500 text-center py-4">لم يتم تسجيل أي زيارات حديثة</div>
              ) : (
                recentShops.map(shop => (
                  <div 
                    key={shop.id}
                    onClick={() => navigate(`/shops/${shop.id}`)}
                    className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl cursor-pointer border border-transparent hover:border-slate-100 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{shop.name}</div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <MapPin size={12} />
                        {shop.area || shop.district}
                      </div>
                    </div>
                    {shop.lastVisitDate && (
                      <div className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                        {format(shop.lastVisitDate, 'd MMM', { locale: ar })}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
         </div>

         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
            <h2 className="font-bold text-lg mb-4 text-slate-800">إجراءات سريعة</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => navigate('/shops/new')} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-medium transition-colors">
                إضافة محل جديد
              </button>
              <button onClick={() => navigate('/shops')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-3 rounded-xl font-medium transition-colors">
                بحث في المحلات
              </button>
            </div>
         </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: number | string, color: string }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
    </div>
  );
}
