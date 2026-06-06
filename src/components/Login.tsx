import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { signInWithGoogle } from '../lib/firebase';
import { Compass, ExternalLink } from 'lucide-react';

export default function Login() {
  const { loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-20 h-20 bg-blue-600 outline outline-8 outline-blue-50 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Compass size={40} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">بوصلة ميدان</h1>
            <p className="text-slate-500 mt-2">نظام إدارة الزيارات الميدانية</p>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium text-right mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-xl transition-all"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          تسجيل الدخول باستخدام جوجل
        </button>
        
        <div className="text-sm border-t border-slate-100 pt-6 text-slate-500 flex flex-col items-center gap-2">
           <span className="font-bold flex items-center gap-2"><ExternalLink size={16} /> ملاحظة مهمة:</span>
           <p>إذا لم تفتح نافذة تسجيل الدخول، يرجى فتح التطبيق في <strong>علامة تبويب جديدة</strong> باستخدام الزر الموجود أعلى يمين الشاشة لتجاوز قيود المتصفح.</p>
        </div>
      </div>
    </div>
  );
}
