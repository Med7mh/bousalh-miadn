import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Shop, Visit, ShopStatus, VisitResult } from '../lib/types';
import { ArrowRight, MapPin, Phone, User, Plus, MessageCircle } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '../lib/utils';

const statusMap: Record<string, { label: string, color: string }> = {
  not_interested: { label: 'غير مهتم', color: 'bg-red-100 text-red-700' },
  interested: { label: 'مهتم', color: 'bg-amber-100 text-amber-700' },
  needs_followup: { label: 'يحتاج متابعة', color: 'bg-orange-100 text-orange-700' },
  selling: { label: 'يبيع المنتج', color: 'bg-blue-100 text-blue-700' },
  actual_client: { label: 'عميل فعلي', color: 'bg-emerald-100 text-emerald-700' },
};

const resultOptions: { value: VisitResult, label: string }[] = [
  { value: 'not_found', label: 'لم أجده' },
  { value: 'rejected', label: 'رفض المنتج' },
  { value: 'interested', label: 'مهتم' },
  { value: 'requested_second_visit', label: 'طلب زيارة ثانية' },
  { value: 'requested_quote', label: 'طلب عرض سعر' },
  { value: 'started_buying', label: 'بدأ البيع' },
  { value: 'actual_client', label: 'عميل فعلي' },
];

export default function ShopDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [shop, setShop] = useState<Shop | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [showVisitModal, setShowVisitModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    // Fetch Shop
    const shopRef = doc(db, 'shops', id);
    const unsubShop = onSnapshot(shopRef, (d) => {
      if (d.exists()) {
        setShop({ id: d.id, ...d.data() } as Shop);
      }
    });

    // Fetch Visits
    const visitsRef = collection(db, `shops/${id}/visits`);
    const qVisits = query(visitsRef, orderBy('createdAt', 'desc'));
    const unsubVisits = onSnapshot(qVisits, (snap) => {
      setVisits(snap.docs.map(d => ({ id: d.id, ...d.data() } as Visit)));
    });

    return () => { unsubShop(); unsubVisits(); };
  }, [id]);

  if (!shop) return <div className="p-8">جاري التحميل...</div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/shops')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-2"
      >
        <ArrowRight size={20} />
        رجوع للمحلات
      </button>

      {/* Shop Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
        <div className="absolute top-6 left-6">
          <span className={cn("px-4 py-1.5 rounded-full text-sm font-bold", statusMap[shop.status]?.color || "bg-slate-100 text-slate-600")}>
            {statusMap[shop.status]?.label || 'مجهول'}
          </span>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-6">{shop.name}</h1>
        
        <div className="grid sm:grid-cols-2 gap-4 text-slate-600 mb-6">
          <div className="flex items-center gap-3">
            <User className="text-blue-500" size={20} />
            <span>المسؤول: <strong className="text-slate-900">{shop.managerName || 'غير مسجل'}</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="text-blue-500" size={20} />
            <span>الهاتف: <strong className="text-slate-900">{shop.phone || shop.whatsapp || 'غير مسجل'}</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="text-blue-500" size={20} />
            <span>المنطقة: <strong className="text-slate-900">{shop.area || shop.district}</strong></span>
          </div>
        </div>

        {shop.whatsapp && (
          <a
            href={`https://wa.me/${shop.whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-4 py-2.5 rounded-xl transition-colors font-bold"
          >
            <MessageCircle size={20} />
            مراسلة واتساب
          </a>
        )}
      </div>

      {/* Visits Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">سجل الزيارات</h2>
          <button 
            onClick={() => setShowVisitModal(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            تسجيل زيارة
          </button>
        </div>

        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
          {visits.length === 0 ? (
            <div className="text-center text-slate-500 py-6">لم يتم تسجيل أي زيارات حتى الآن.</div>
          ) : (
             visits.map((visit, i) => (
               <div key={visit.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                 <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-blue-600 text-blue-600 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                   <span className="text-sm font-bold">{visits.length - i}</span>
                 </div>
                 <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                   <div className="flex items-center justify-between space-x-2 mb-1">
                     <div className="font-bold text-slate-900">{resultOptions.find(o => o.value === visit.result)?.label}</div>
                     <time className="text-xs font-medium text-slate-500">
                       {format(visit.createdAt, 'd MMM yyyy', { locale: ar })}
                     </time>
                   </div>
                   {visit.notes && <div className="text-slate-600 text-sm mt-2">{visit.notes}</div>}
                 </div>
               </div>
             ))
          )}
        </div>
      </div>

      {showVisitModal && (
        <VisitModal 
          shop={shop} 
          onClose={() => setShowVisitModal(false)} 
        />
      )}
    </div>
  );
}

function VisitModal({ shop, onClose }: { shop: Shop, onClose: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VisitResult>('not_found');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  
  // Products simulation
  const availableProducts = ['عصير برتقال', 'عصير مانجو', 'عصير تفاح'];
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const toggleProduct = (product: string) => {
    setSelectedProducts(prev => 
      prev.includes(product) ? prev.filter(p => p !== product) : [...prev, product]
    );
  };

  const determineNewStatus = (res: VisitResult): ShopStatus => {
    switch(res) {
      case 'rejected': return 'not_interested';
      case 'interested':
      case 'requested_quote': return 'interested';
      case 'requested_second_visit': return 'needs_followup';
      case 'started_buying': return 'selling';
      case 'actual_client': return 'actual_client';
      default: return shop.status;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const visitRef = doc(collection(db, `shops/${shop.id}/visits`));
      
      const newStatus = determineNewStatus(result);
      const targetFollowUp = followUpDate ? new Date(followUpDate).getTime() : null;

      const now = Date.now();
      await addDoc(collection(db, `shops/${shop.id}/visits`), {
        shopId: shop.id,
        result,
        productsOffered: selectedProducts,
        notes,
        followUpDate: targetFollowUp,
        repId: user.uid,
        createdAt: now
      });

      // Update shop status & follow up date
      await updateDoc(doc(db, 'shops', shop.id), {
        status: newStatus,
        nextFollowUpDate: targetFollowUp || shop.nextFollowUpDate || null,
        updatedAt: now,
        lastVisitDate: now
      });

      onClose();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">تسجيل زيارة جديدة</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">نتيجة الزيارة *</label>
            <div className="grid grid-cols-2 gap-2">
              {resultOptions.map(opt => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setResult(opt.value)}
                  className={cn(
                    "p-3 rounded-xl border text-sm font-medium transition-all text-right",
                    result === opt.value 
                      ? "border-blue-500 bg-blue-50 text-blue-700" 
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">المنتجات التي تم عرضها</label>
            <div className="flex flex-wrap gap-2">
              {availableProducts.map(p => (
                <button
                  type="button"
                  key={p}
                  onClick={() => toggleProduct(p)}
                  className={cn(
                    "px-4 py-2 rounded-full border text-sm font-medium transition-all",
                    selectedProducts.includes(p)
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">ملاحظات</label>
            <textarea 
              rows={3} 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="مثال: يريد تجربة المنتج أولاً..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500 resize-none text-sm" 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">موعد المتابعة القادمة (اختياري)</label>
            <input 
              type="date" 
              value={followUpDate}
              onChange={e => setFollowUpDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500" 
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ الزيارة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
