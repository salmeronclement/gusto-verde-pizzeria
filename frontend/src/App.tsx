import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Layouts
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';

// Pages Client
// Pages Client
import HomePage from './pages/HomePage';
import Menu from './pages/Menu'; // Replaces PizzasPage
import CartPage from './pages/Cart';
import OrderRecap from './pages/OrderRecap';
import OrderInfos from './pages/OrderInfos'; // AJOUTÉ
import ConfirmationPage from './pages/ConfirmationPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ClientPage from './pages/client/ClientPage';
import NotFoundPage from './pages/NotFoundPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import BlogPage from './pages/BlogPage';
import BlogPostDetailsPage from './pages/BlogPostDetailsPage';

// Pages Admin
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminDriversPage from './pages/admin/AdminDriversPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminHistoryPage from './pages/admin/AdminHistoryPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminAppearancePage from './pages/admin/AdminAppearancePage';
import AdminBlogPage from './pages/admin/AdminBlogPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';

// Store
import { useAuthStore } from './store/useAuthStore';

// Composant simple pour les pages en construction
const PageEnConstruction = ({ title }: { title: string }) => (
  <div className="p-10 text-center">
    <h2 className="text-2xl font-bold text-gray-700 mb-2">{title}</h2>
    <p className="text-gray-500">Cette fonctionnalité arrive bientôt ! 🚧</p>
  </div>
);

function App() {
  const location = useLocation();
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Routes>
      {/* --- ROUTES CLIENT (Publiques) --- */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="nos-pizzas" element={<Menu />} />
        <Route path="panier" element={<CartPage />} />
        <Route path="commande/recap" element={<OrderRecap />} />
        <Route path="commande/confirmation" element={<ConfirmationPage />} />
        <Route path="suivi-commande/:orderId" element={<OrderTrackingPage />} />

        {/* Pages informatives */}
        <Route path="contact" element={<ContactPage />} />
        <Route path="a-propos" element={<AboutPage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="blog/:id" element={<BlogPostDetailsPage />} />

        {/* Auth Client */}
        <Route path="connexion" element={<LoginPage />} />
        <Route path="inscription" element={<RegisterPage />} />
        <Route path="mon-compte" element={<ClientPage />} />
      </Route>

      {/* --- ROUTES ADMIN (Login standalone) --- */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* --- ROUTES ADMIN (Protégées par AdminLayout) --- */}
      <Route path="/admin" element={<AdminLayout />}>
        {/* Redirection par défaut vers commandes */}
        <Route index element={<Navigate to="/admin/commandes" replace />} />

        {/* Pages fonctionnelles restaurées */}
        <Route path="commandes" element={<AdminOrdersPage />} />
        <Route path="livreurs" element={<AdminDriversPage />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="historique" element={<AdminHistoryPage />} />
        <Route path="produits" element={<AdminProductsPage />} />
        <Route path="apparence" element={<AdminAppearancePage />} />
        <Route path="blog" element={<AdminBlogPage />} />
        <Route path="clients" element={<AdminCustomersPage />} />
        <Route path="parametres" element={<AdminSettingsPage />} />
      </Route>

      {/* --- CATCH ALL (Redirection 404 vers accueil) --- */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;