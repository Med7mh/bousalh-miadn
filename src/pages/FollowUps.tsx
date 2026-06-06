import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Shop } from '../lib/types';
import { useAuth } from '../lib/AuthContext';
import { format, isBefore, isToday, startOfDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CalendarClock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function FollowUps() {
  const [shops, setShops] = useState<Shop[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Only shops that have a nextFollowUpDate set
    // In NoSQL, filtering like this requires an index on nextFollowUpDate and status.
    // For MVP with small datasets or without deploying custom complex indexes, we can just grab all and filter if it breaks, but >0 is okay without index usually.
    // Actually, order by nextFollowUpDate requires index.
    // To be safe in preview and bypass missing indexes, let's just query everything or query by status == needs_followup and sort locally.
    const q = query(
      collection(db, 'shops'), 
      where('status', '==', 'needs_followup')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shop));
      // Sort locally to avoid index reqs
      data.sort((a, b) => (a.nextFollowUpDate || 0) - (b.nextFollowUpDate || 0));
      setShops(data.filter(s => s.nextFollowUpDate != null));
    });

    return () => unsubscribe();
  }, []);

  const todayStart = startOfDay(new Date()).getTime();

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">المتابعات المطلوبة</h1>
        <p className="text-slate-500">العملاء الذين يحتاجون متابعة قريبة</p>
      </div>

      <div className="space-y-4">
        {shops.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-100">
            لا توجد متابعات مطلوبة حالياً.
          </div>
        ) : (
          shops.map(shop => {
            const date = shop.nextFollowUpDate!;
            const isOverdue = date < todayStart;
            const isTodayDate = isToday(date);
            
            return (
              <div 
                key={shop.id}
                onClick={() => navigate(`/shops/${shop.id}`)}
                className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h3 className="font-bold text-lg text-slate-900 mb-1">{shop.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin size={16} className="text-slate-400" />
                    <span>{shop.area || shop.district}</span>
                  </div>
                </div>

                <div className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shrink-0 w-fit",
                  isOverdue ? "bg-red-50 text-red-700" :
                  isTodayDate ? "bg-orange-50 text-orange-700" :
                  "bg-blue-50 text-blue-700"
                )}>
                  <CalendarClock size={16} />
                  {isOverdue ? `متأخر (${format(date, 'd MMM yyyy', { locale: ar })})` :
                   isTodayDate ? 'اليوم' :
                   format(date, 'd MMM', { locale: ar })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
