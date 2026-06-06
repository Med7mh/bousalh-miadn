import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Home from './pages/Home';
import Shops from './pages/Shops';
import NewShop from './pages/NewShop';
import ShopDetail from './pages/ShopDetail';
import FollowUps from './pages/FollowUps';
import Reports from './pages/Reports';

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, profile, loading } = useAuth();
  
  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50">جاري التحميل...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!profile) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center space-y-6">
      <div className="text-slate-800 text-lg font-medium">عذراً، لم يكتمل إعداد حسابك بشكل صحيح.</div>
      <p className="text-slate-500 max-w-sm">
        نظراً لأن هذه أول مرة تسجل فيها الدخول، يرجى الضغط على الزر أدناه لإكمال الإعداد.
      </p>
      <div className="flex gap-4">
        <button 
          onClick={async () => {
            try {
              const { doc, setDoc, getDocs, query, collection, where } = await import('firebase/firestore');
              const { db } = await import('./lib/firebase');
              const usersSnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'manager')));
              const isFirstUser = usersSnapshot.empty;
              
              await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                name: user.displayName || 'مستخدم مجهول',
                role: isFirstUser ? 'manager' : 'rep',
                createdAt: Date.now()
              });
              window.location.reload();
            } catch (err: any) {
              alert('خطأ: ' + err.message);
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
        >
          إكمال إعداد الحساب
        </button>
        <button 
          onClick={() => {
            import('./lib/firebase').then(({ signOut }) => signOut());
          }}
          className="bg-white border border-red-200 text-red-600 hover:bg-red-50 font-medium px-6 py-2.5 rounded-xl transition-colors"
        >
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
  
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
            <Route index element={<Home />} />
            <Route path="shops" element={<Shops />} />
            <Route path="shops/new" element={<NewShop />} />
            <Route path="shops/:id" element={<ShopDetail />} />
            <Route path="follow-ups" element={<FollowUps />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
