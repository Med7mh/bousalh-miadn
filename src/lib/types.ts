export type UserRole = 'manager' | 'rep';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: number;
}

export type ShopStatus = 'not_interested' | 'interested' | 'needs_followup' | 'selling' | 'actual_client';
export type VisitResult = 'not_found' | 'rejected' | 'interested' | 'requested_second_visit' | 'requested_quote' | 'started_buying' | 'actual_client';

export interface Shop {
  id: string;
  name: string;
  managerName: string;
  phone: string;
  whatsapp: string;
  area: string;
  district?: string; // legacy
  city?: string; // legacy
  type: string;
  status: ShopStatus;
  addedBy: string;
  createdAt: number;
  updatedAt: number;
  nextFollowUpDate?: number;
  lastVisitDate?: number;
}

export interface Visit {
  id: string;
  shopId: string;
  result: VisitResult;
  productsOffered: string[];
  notes: string;
  followUpDate: number | null;
  repId: string;
  createdAt: number;
}

export interface Product {
  id: string;
  name: string;
  createdAt: number;
}
