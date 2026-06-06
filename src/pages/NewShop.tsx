import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { ArrowRight } from 'lucide-react';
import { ShopStatus } from '../lib/types';

export default function NewShop() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    managerName: '',
    phone: '',
    whatsapp: '',
    area: '',
    type: 'بقالة',
    visitDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const newShopRef = doc(collection(db, 'shops'));
      const visitTime = new Date(formData.visitDate).getTime();
      const now = Date.now();

      await setDoc(newShopRef, {
        name: formData.name,
        managerName: formData.managerName,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        area: formData.area,
        type: formData.type,
        status: 'needs_followup' as ShopStatus,
        addedBy: user.uid,
        createdAt: now,
        updatedAt: now,
        lastVisitDate: visitTime
      });

      const visitRef = doc(collection(db, `shops/${newShopRef.id}/visits`));
      await setDoc(visitRef, {
        shopId: newShopRef.id,
        result: 'interested',
        productsOffered: [],
        notes: 'الزيارة الأولى أثناء تسجيل المحل',
        followUpDate: null,
        repId: user.uid,
        createdAt: visitTime
      });

      navigate(`/shops/${newShopRef.id}`);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الإضافة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/shops')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
      >
        <ArrowRight size={20} />
        رجوع للمحلات
      </button>

      <h1 className="text-2xl font-bold text-slate-900">إضافة محل جديد</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">اسم المحل *</label>
          <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">اسم المسؤول</label>
          <input type="text" value={formData.managerName} onChange={e => setFormData({...formData, managerName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الهاتف</label>
            <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">واتساب</label>
            <input type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">المنطقة (الحي/المدينة) *</label>
            <input required type="text" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ الزيارة *</label>
            <input required type="date" value={formData.visitDate} onChange={e => setFormData({...formData, visitDate: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">نوع المحل</label>
          <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-blue-500">
            <option>بقالة</option>
            <option>سوبرماركت</option>
            <option>مطعم</option>
            <option>كافتيريا</option>
            <option>أخرى</option>
          </select>
        </div>

        <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 mt-4 rounded-xl transition-colors">
          {loading ? 'جاري العرض...' : 'حفظ المحل'}
        </button>
      </form>
    </div>
  );
}
