import { Item, Claim } from '../types';

const ITEMS_KEY = 'lost-found-items';
const CLAIMS_KEY = 'lost-found-claims';
const USER_KEY = 'lost-found-user';

// Mock user data
export const getCurrentUser = () => {
  const stored = localStorage.getItem(USER_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  const user = {
    id: 'user-' + Math.random().toString(36).substr(2, 9),
    name: 'Current User',
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

// Items
export const getItems = (): Item[] => {
  const stored = localStorage.getItem(ITEMS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveItems = (items: Item[]) => {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
};

export const addItem = (item: Item) => {
  const items = getItems();
  items.unshift(item);
  saveItems(items);
};

export const updateItem = (id: string, updates: Partial<Item>) => {
  const items = getItems();
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    saveItems(items);
  }
};

export const getItemById = (id: string): Item | undefined => {
  const items = getItems();
  return items.find(item => item.id === id);
};

// Claims
export const getClaims = (): Claim[] => {
  const stored = localStorage.getItem(CLAIMS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveClaims = (claims: Claim[]) => {
  localStorage.setItem(CLAIMS_KEY, JSON.stringify(claims));
};

export const addClaim = (claim: Claim) => {
  const claims = getClaims();
  claims.unshift(claim);
  saveClaims(claims);
};

export const updateClaim = (id: string, updates: Partial<Claim>) => {
  const claims = getClaims();
  const index = claims.findIndex(claim => claim.id === id);
  if (index !== -1) {
    claims[index] = { ...claims[index], ...updates };
    saveClaims(claims);
  }
};

export const getClaimsByItemId = (itemId: string): Claim[] => {
  const claims = getClaims();
  return claims.filter(claim => claim.itemId === itemId);
};

export const getClaimsByUserId = (userId: string): Claim[] => {
  const claims = getClaims();
  return claims.filter(claim => claim.userId === userId);
};
