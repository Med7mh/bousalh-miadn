import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { auth, signInWithGoogle } from '../lib/firebase';
import { Compass, ExternalLink, Mail, Lock } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { loading, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const { getDocs, query, collection, where, setDoc, doc } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase');
        
        const usersSnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'manager')));
        const isFirstUser = usersSnapshot.empty;
        
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: userCredential.user.email,
          name: email.split('@')[0], // Default name from email
          role: isFirstUser ? 'manager' : 'rep',
          createdAt: Date.now()
        });

      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          setError('بيانات الدخول غير صحيحة');
      } else if (err.code === 'auth/email-already-in-use') {
          setError('البريد الإلكتروني مسجل مسبقاً');
      } else if (err.code === 'auth/weak-password') {
          setError('كلمة المرور ضعيفة جداً');
      } else {
          setError(err.message || 'حدث خطأ أثناء المصادقة');
      }
    }
  };

  const handleGoogleLogin = async () => {
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
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
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
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4 pt-4 text-right">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-10 pl-4 outline-none focus:border-blue-500 text-left" 
                dir="ltr"
                placeholder="email@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="password" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-10 pl-4 outline-none focus:border-blue-500 text-left" 
                dir="ltr"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all"
          >
            {isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="flex items-center gap-2 pt-2">
           <hr className="flex-1 border-slate-200" />
           <span className="text-sm text-slate-400">أو</span>
           <hr className="flex-1 border-slate-200" />
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-xl transition-all"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          تسجيل الدخول باستخدام جوجل
        </button>
        
        <div className="text-sm text-slate-500 pt-2">
            {isSignUp ? 'لديك حساب بالفعل؟ ' : 'ليس لديك حساب؟ '}
            <button 
               type="button"
               onClick={() => setIsSignUp(!isSignUp)} 
               className="text-blue-600 font-bold hover:underline"
            >
               {isSignUp ? 'تسجيل الدخول' : 'إنشاء حساب'}
            </button>
        </div>

      </div>
    </div>
  );
}
