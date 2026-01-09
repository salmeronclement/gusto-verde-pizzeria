// --- DÉFINITIONS UNIVERSELLES ---

export interface Address {
  id?: number | string;
  name?: string;
  street: string;
  postal_code?: string;
  postalCode?: string;
  city: string;
  additional_info?: string;
  additionalInfo?: string;
}

export interface User {
  id: number | string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email: string;
  phone: string;
  loyalty_points?: number;
  addresses: Address[];
}

export interface CustomerInfo {
  first_name?: string;
  last_name?: string;
  name?: string;
  phone: string;
  email: string;
  address?: Address;
  scheduledTime?: string;
  scheduledDate?: string;
  comment?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  imageUrl?: string;
  is_promo_eligible?: boolean;
  isPromoEligible?: boolean;
  // Champs liés à la fidélité dans l'API
  is_loyalty_eligible?: boolean | number; 
  available?: boolean;
  ingredients?: string[];
  is_featured?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  notes?: string;
  productId: number | string; 
  unitPrice: number; 
  subtotal: number;
  isFree?: boolean;
  isReward?: boolean;
  unit_price?: number; 
  product_name?: string;
}

export type OrderStatus = string;

export interface Driver {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  current_status: string;
  is_active?: boolean;
}

export interface Order {
    id: number;
    created_at: string;
    createdAt?: string; 
    status: OrderStatus;
    total_amount: number | string;
    total?: number;
    mode: 'livraison' | 'emporter';
    customer_id?: number;
    items: any[]; 
    customer?: any;
    customerInfo?: any;
    delivery?: any;
    item_count?: number;
    comment?: string;
    scheduledTime?: string;
    delivery_fee?: number | string;
    delivery_address?: any;
}

// --- TYPES SPÉCIFIQUES ---

export interface AdminOrder extends Order {}
export interface DriverOrder extends Order {}

export interface ServiceDetails {
    isOpen: boolean;
    stats?: {
        topItems: any[];
        revenue?: number;
        orderCount?: number;
        averageTicket?: number;
    };
    service?: any;
    orders?: any[];
}

export interface Service {
    id: number;
    status: 'open' | 'closed';
    start_time?: string;
    end_time?: string;
    total_revenue?: number;
    order_count?: number;
    average_ticket?: number;
}

export interface OrderTracking extends Order {
    eta?: string;
    driverLocation?: { lat: number; lng: number };
}

// CORRECTION ICI : Mise à jour pour correspondre à l'usage réel
export interface LoyaltyProgram {
    enabled: boolean;
    target_pizzas: number; // Au lieu de reward_threshold
    require_purchase_for_reward?: boolean;
    // Champs optionnels pour compatibilité si nécessaire
    points_per_euro?: number;
    reward_threshold?: number;
}