export type ItemStatus = 'active' | 'claimed';
export type ItemType = 'lost' | 'found';
export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export type Category = 
  | 'electronics'
  | 'id-cards'
  | 'books'
  | 'clothing'
  | 'bags'
  | 'keys'
  | 'accessories'
  | 'other';

export interface Item {
  id: string;
  type: ItemType;
  name: string;
  category: Category;
  description: string;
  location: string;
  date: string;
  image?: string;
  status: ItemStatus;
  userId: string;
  userName: string;
  createdAt: string;
  contactPreference?: string;
}

export interface Claim {
  id: string;
  itemId: string;
  itemName: string;
  userId: string;
  userName: string;
  status: ClaimStatus;
  message: string;
  createdAt: string;
}
