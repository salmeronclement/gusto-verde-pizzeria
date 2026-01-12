import axios from 'axios';
// On ré-exporte les types pour que le reste de l'app les trouve
export * from '../types';

// 👇 Configuration de l'API (Production)
// 👇 Configuration de l'API (Production)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
// export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper pour les images
export const getImageUrl = (path: string | undefined | null) => {
  if (!path) return '/api/placeholder/400/320';
  if (path.startsWith('http')) return path;

  // On retire '/api' de la base URL pour les images car elles sont servies à la racine /uploads
  const baseUrl = API_BASE_URL.endsWith('/api')
    ? API_BASE_URL.slice(0, -4)
    : API_BASE_URL;

  return `${baseUrl}${path}`;
};

// Intercepteur pour le token JWT
api.interceptors.request.use((config) => {
  let token = null;

  // 1. Si requête ADMIN -> Chercher le token dans admin-storage (Zustand)
  if (config.url?.includes('/admin')) {
    const adminStorage = localStorage.getItem('admin-storage');
    if (adminStorage) {
      try {
        const parsed = JSON.parse(adminStorage);
        if (parsed.state?.token) {
          token = parsed.state.token;
        }
      } catch (e) {
        console.error("Erreur parsing token admin:", e);
      }
    }
  }
  // 2. Sinon -> Token classique (Client / Livreur)
  else {
    token = localStorage.getItem('token');
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs 401 (Expiration Token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si erreur 401 sur une route admin -> Redirection vers login admin
    if (error.response?.status === 401 && error.config?.url?.includes('/admin')) {
      // On évite la boucle si on est déjà sur le login
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- PUBLIC / CLIENT ---

export const getProducts = async () => {
  try {
    const response = await api.get('/products');
    // Sécurité : on vérifie si c'est un tableau, sinon on cherche dedans, sinon tableau vide
    const data = response.data;
    let products = [];

    if (Array.isArray(data)) products = data;
    else if (data && Array.isArray(data.data)) products = data.data;
    else if (data && Array.isArray(data.products)) products = data.products;

    // Mapping pour normaliser l'image (database snake_case vers frontend camelCase)
    return products.map((p: any) => ({
      ...p,
      imageUrl: p.imageUrl || p.image_url || p.image || null
    }));

  } catch (error) {
    console.error("Erreur chargement produits:", error);
    return []; // On renvoie un tableau vide pour ne pas faire planter l'app
  }
};
export const getPizzas = getProducts;

export const submitOrder = async (items: any[], customer: any, mode: 'livraison' | 'emporter', address?: any, scheduledAt?: string | null) => {
  let firstName = customer.first_name || '';
  let lastName = customer.last_name || '';

  if (!firstName && customer.name) {
    const parts = customer.name.trim().split(' ');
    firstName = parts[0];
    lastName = parts.slice(1).join(' ') || '.';
  }

  const payload: any = {
    items: items.map(item => ({
      id: item.id || item.productId,
      productId: item.id || item.productId, // REQUIRED by backend ordersRoutes.js line 116
      quantity: item.quantity,
      notes: item.notes,
      unitPrice: item.isFree ? 0 : (item.unitPrice ?? item.price),
      isReward: item.isReward || false,
      isFree: item.isFree || false
    })),
    customer: {
      first_name: firstName,
      last_name: lastName,
      phone: customer.phone,
      email: customer.email
    },
    mode,
    comment: customer.comment || null,
    scheduledAt: scheduledAt || null
  };

  const rewardItem = items.find(item => item.isReward);
  if (rewardItem) {
    payload.rewardPizzaId = rewardItem.id || rewardItem.productId;
  }

  if (mode === 'livraison') {
    const addr = address || customer.address;
    if (addr) {
      payload.address = {
        street: addr.street,
        postal_code: addr.postalCode || addr.postal_code,
        city: addr.city,
        additional_info: addr.additionalInfo || addr.additional_info
      };
    }
  }

  const response = await api.post('/orders', payload);
  return response.data;
};

export const fetchOrderTracking = async (orderId: number | string) => {
  try {
    const response = await api.get(`/orders/${orderId}/tracking`);
    return response.data;
  } catch (e) {
    console.error(e);
    return null;
  }
};

// --- CONTENT ---

export const getHeroSlides = async () => {
  const response = await api.get('/content/hero-slides');
  return response.data;
};

// --- AUTH CLIENT (Téléphone) ---

export const sendClientAuthCode = async (phone: string) => {
  const response = await api.post('/auth/client/send-code', { phone });
  return response.data;
};

export const verifyClientAuthCode = async (payload: any) => {
  const response = await api.post('/auth/client/verify-code', payload);
  return response.data;
};

// --- CLIENT PROFILE ---

export const getUserProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateUserProfile = async (data: any) => {
  const response = await api.put('/auth/me', data);
  return response.data;
};

export const getUserOrders = async (userId: number) => {
  const response = await api.get(`/orders/customers/${userId}/orders`); // Adjusted path matching ordersRoutes.js logic if needed, but usually it's /api/customers/:id/orders
  // wait, ordersRoutes has router.get('/customers/:customerId/orders')
  return response.data;
};

export const addUserAddress = async (address: any) => {
  const response = await api.post('/auth/addresses', address);
  return response.data;
};

export const updateUserAddress = async (id: number, address: any) => {
  const response = await api.put(`/auth/addresses/${id}`, address);
  return response.data;
};

export const deleteUserAddress = async (id: number) => {
  const response = await api.delete(`/auth/addresses/${id}`);
  return response.data;
};

// --- ADMIN / BLOG ---

export const getAdminBlogPosts = async () => {
  const response = await api.get('/blog/admin');
  return response.data;
};

export const createBlogPost = async (data: FormData) => {
  const response = await api.post('/blog/admin', data);
  return response.data;
};

export const updateBlogPost = async (id: number, data: FormData) => {
  const response = await api.put(`/blog/admin/${id}`, data);
  return response.data;
};

export const deleteBlogPost = async (id: number) => {
  const response = await api.delete(`/blog/admin/${id}`);
  return response.data;
};

// --- ADMIN / SERVICE ---

export const getServiceAdminStatus = async () => {
  try {
    const response = await api.get('/admin/service/status');
    return response.data;
  } catch (error) {
    console.error("Erreur statut service:", error);
    return { isOpen: false, service: null };
  }
};

export const openService = async () => {
  const response = await api.post('/admin/service/open');
  return response.data;
};

export const closeService = async () => {
  const response = await api.post('/admin/service/close');
  return response.data;
};

export const getServiceAdminHistory = async () => {
  const response = await api.get('/admin/service/history');
  return response.data;
};

// --- AUTH ---

export const loginUser = async (email: string, pass: string) => {
  const response = await api.post('/auth/login', { email, password: pass });
  return response.data;
};

export const register = async (userData: any) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const adminLogin = async (credentials: any) => {
  const response = await api.post('/auth/admin/login', {
    username: credentials.username || credentials.email,
    password: credentials.password
  });
  return { token: response.data.token, admin: response.data.admin };
};

// --- ADMIN ---

export const getAdminStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (e) {
    return { totalOrders: 0, revenue: 0, activeDrivers: 0 };
  }
};

export const getAdminSettings = async () => {
  try {
    const response = await api.get('/admin/settings');
    return response.data;
  } catch (e) {
    return {};
  }
};

export const updateAdminSettings = async (settings: any) => {
  const response = await api.put('/admin/settings', settings);
  return response.data;
};

export const getAdminOrders = async () => {
  const response = await api.get('/admin/orders');
  return response.data;
};

export const updateOrderStatus = async (orderId: number, status: string) => {
  const response = await api.patch(`/admin/orders/${orderId}/status`, { status });
  return response.data;
};

export const assignDriverToOrder = async (orderId: number, driverId: number) => {
  const response = await api.patch(`/admin/orders/${orderId}/assign-driver`, { driverId });
  return response.data;
};

export const getAdminDrivers = async () => {
  const response = await api.get('/admin/drivers');
  return response.data;
};

export const createDriver = async (data: any) => {
  const response = await api.post('/admin/drivers', data);
  return response.data;
};

export const updateDriver = async (id: number, data: any) => {
  const response = await api.put(`/admin/drivers/${id}`, data);
  return response.data;
};

export const removeDriver = async (id: number) => {
  const response = await api.delete(`/admin/drivers/${id}`);
  return response.data;
};

export const getAdminProducts = async () => {
  const response = await api.get('/admin/products');
  const data = response.data;
  const products = Array.isArray(data) ? data : [];

  return products.map((p: any) => ({
    ...p,
    imageUrl: p.imageUrl || p.image_url || p.image || null
  }));
};

export const createProduct = async (data: FormData) => {
  const response = await api.post('/admin/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
  return response.data;
};

export const updateProduct = async (id: number | string, data: FormData) => {
  const response = await api.put(`/admin/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
  return response.data;
};

export const deleteProduct = async (id: number | string) => {
  const response = await api.delete(`/admin/products/${id}`);
  return response.data;
};

export const bulkUpdateProducts = async (payload: any) => {
  const response = await api.patch('/admin/products/bulk', payload);
  return response.data;
};

export const getServiceDetails = async (serviceId?: number) => {
  try {
    // CORRECTION : La route pour les détails d'un vieux service est /admin/service/history/:id
    // Pour le service actuel (ou stats), c'est /admin/service/status ou /admin/service/details (à vérifier)
    // Ici on parle de l'historique principalement :
    const url = serviceId ? `/admin/service/history/${serviceId}` : '/admin/service/status';
    const response = await api.get(url);
    return response.data;
  } catch (e) {
    return { isOpen: false, stats: { topItems: [] } };
  }
};

export const getServiceHistory = async () => {
  try {
    const response = await api.get('/admin/service/history');
    return response.data;
  } catch (e) {
    return [];
  }
};

// Compatibilité
export const getPublicSettings = async () => {
  try {
    const response = await api.get('/admin/settings/public');
    return response.data;
  } catch (e) {
    console.error("Erreur chargement settings publics:", e);
    return {};
  }
};

// --- ADMIN / CLIENTS ---

export const getAdminCustomers = async () => {
  const response = await api.get('/admin/customers');
  return response.data;
};

export const updateCustomerLoyalty = async (id: number, points: number) => {
  const response = await api.patch(`/admin/customers/${id}/loyalty`, { loyalty_points: points });
  return response.data;
};

export const getAdminCustomerDetails = async (id: number) => {
  const response = await api.get(`/admin/customers/${id}`);
  return response.data;
};

// --- LIVREUR ---

export const sendDriverCode = async (phone: string) => {
  const response = await api.post('/auth/driver/send-code', { phone });
  return response.data;
};

export const verifyDriverCode = async (phone: string, code: string) => {
  const response = await api.post('/auth/driver/verify-code', { phone, code });
  return response.data;
};

export const getDriverProfile = async () => {
  const response = await api.get('/driver/profile');
  return response.data;
};

export const getDriverOrders = async () => {
  const response = await api.get('/driver/orders');
  return response.data;
};

export const startDelivery = async (id: number) => updateOrderStatus(id, 'en_livraison');
export const completeDelivery = async (id: number) => updateOrderStatus(id, 'livree');
export const getDriverHistory = async () => []; // TODO: Implement if needed