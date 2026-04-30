import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Search, Filter, Package, PlusCircle } from 'lucide-react';
import { ItemCard } from '../components/ItemCard';
import { EmptyState } from '../components/EmptyState';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { getItems, saveItems } from '../utils/storage';
import { mockItems } from '../utils/mockData';
import { Item, ItemType, Category } from '../types';

export function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ItemType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'claimed'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let storedItems = getItems();
    // Initialize with mock data if empty
    if (storedItems.length === 0) {
      saveItems(mockItems);
      storedItems = mockItems;
    }
    setItems(storedItems);
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

  const activeCount = items.filter(i => i.status === 'active').length;
  const lostCount = items.filter(i => i.type === 'lost' && i.status === 'active').length;
  const foundCount = items.filter(i => i.type === 'found' && i.status === 'active').length;

  const categories: { value: Category | 'all'; label: string }[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'id-cards', label: 'ID Cards' },
    { value: 'books', label: 'Books' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'bags', label: 'Bags' },
    { value: 'keys', label: 'Keys' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* Hero Section */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          Find What You're Looking For
        </h2>
        <p className="text-slate-600 mb-4">
          Browse {activeCount} active items or report a lost/found item
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-2xl font-bold text-slate-900">{activeCount}</div>
            <div className="text-sm text-slate-600">Active Items</div>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <div className="text-2xl font-bold text-red-700">{lostCount}</div>
            <div className="text-sm text-red-600">Lost Items</div>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-200 p-4 col-span-2 md:col-span-1">
            <div className="text-2xl font-bold text-green-700">{foundCount}</div>
            <div className="text-sm text-green-600">Found Items</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by item name, description, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 h-12"
          />
        </div>

        {/* Type Filter Tabs */}
        <div className="flex items-center gap-3 mb-4">
          <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as ItemType | 'all')} className="flex-1">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="lost">Lost</TabsTrigger>
              <TabsTrigger value="found">Found</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="h-10 w-10 shrink-0"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4 space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Category
              </label>
              <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as Category | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Status
              </label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'active' | 'claimed')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="claimed">Claimed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(categoryFilter !== 'all' || statusFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCategoryFilter('all');
                  setStatusFilter('all');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Active Filters */}
        {(searchQuery || typeFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all') && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-slate-600">Active filters:</span>
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                </Badge>
              )}
              {typeFilter !== 'all' && (
                <Badge variant="secondary">
                  Type: {typeFilter}
                </Badge>
              )}
              {categoryFilter !== 'all' && (
                <Badge variant="secondary">
                  Category: {categories.find(c => c.value === categoryFilter)?.label}
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="secondary">
                  Status: {statusFilter}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title="No items found"
          description="Try adjusting your search or filters to find what you're looking for."
          action={
            <div className="flex flex-col sm:flex-row gap-2">
              <Link to="/report-lost">
                <Button variant="default" className="gap-2">
                  <PlusCircle className="w-4 h-4" />
                  Report Lost Item
                </Button>
              </Link>
              <Link to="/report-found">
                <Button variant="outline" className="gap-2">
                  <Package className="w-4 h-4" />
                  Report Found Item
                </Button>
              </Link>
            </div>
          }
        />
      )}
    </div>
  );
}
