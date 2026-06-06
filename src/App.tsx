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
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center space-y-4">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <div className="text-slate-800 text-lg font-medium mt-4">جاري إعداد حسابك...</div>
      <p className="text-slate-500 max-w-sm">
        يرجى الانتظار بينما نقوم بتجهيز مساحة العمل الخاصة بك.
      </p>
      <button 
        onClick={() => {
          import('./lib/firebase').then(({ signOut }) => signOut());
        }}
        className="mt-6 text-red-600 hover:text-red-700 text-sm font-medium"
      >
        إلغاء وتسجيل الخروج
      </button>
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
