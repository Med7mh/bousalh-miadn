import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Shop } from '../lib/types';
import { Search, Plus, MapPin, Phone } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const statusMap: Record<string, { label: string, color: string }> = {
  not_interested: { label: 'غير مهتم', color: 'bg-red-100 text-red-700' },
  interested: { label: 'مهتم', color: 'bg-amber-100 text-amber-700' },
  needs_followup: { label: 'يحتاج متابعة', color: 'bg-orange-100 text-orange-700' },
  selling: { label: 'يبيع المنتج', color: 'bg-blue-100 text-blue-700' },
  actual_client: { label: 'عميل فعلي', color: 'bg-emerald-100 text-emerald-700' },
};

export default function Shops() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'shops'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shop));
      setShops(data);
    });
    return () => unsubscribe();
  }, []);

  const filteredShops = shops.filter(s => 
    s.name.includes(search) || 
    (s.area || s.district || '').includes(search) || 
    (s.managerName || '').includes(search)
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">المحلات</h1>
          <p className="text-slate-500">سجل المحلات والعملاء المرتبطين بك</p>
        </div>
        <button 
          onClick={() => navigate('/shops/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          إضافة محل
        </button>
      </div>

      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text"
          placeholder="ابحث باسم المحل، المنطقة، أو اسم المسؤول..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl py-3 pr-12 pl-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredShops.map(shop => (
          <div 
            key={shop.id}
            onClick={() => navigate(`/shops/${shop.id}`)}
            className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-[0.98]"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg text-slate-900">{shop.name}</h3>
              <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold", statusMap[shop.status]?.color || "bg-slate-100 text-slate-600")}>
                {statusMap[shop.status]?.label || 'مجهول'}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-slate-400" />
                <span>{shop.area || `${shop.district} - ${shop.city}`}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-slate-400" />
                <span>{shop.phone || shop.whatsapp || 'لا يوجد رقم'}</span>
              </div>
            </div>
          </div>
        ))}
        {filteredShops.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            لا توجد محلات مطابقة للبحث.
          </div>
        )}
      </div>
    </div>
  );
}
