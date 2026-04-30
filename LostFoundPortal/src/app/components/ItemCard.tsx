import { Link } from 'react-router';
import { MapPin, Calendar, Tag } from 'lucide-react';
import { Item } from '../types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  const statusColors = {
    active: item.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700',
    claimed: 'bg-slate-100 text-slate-600',
  };

  const typeLabels = {
    lost: 'Lost',
    found: 'Found',
  };

  const categoryLabels: Record<string, string> = {
    'electronics': 'Electronics',
    'id-cards': 'ID Cards',
    'books': 'Books',
    'clothing': 'Clothing',
    'bags': 'Bags',
    'keys': 'Keys',
    'accessories': 'Accessories',
    'other': 'Other',
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return new Date(item.date).toLocaleDateString();
  };

  return (
    <Link to={`/item/${item.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 h-full">
        {/* Image */}
        <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <Tag className="w-12 h-12" />
            </div>
          )}
          {/* Status Badge */}
          <div className="absolute top-2 right-2">
            <Badge className={statusColors[item.status]}>
              {item.status === 'claimed' ? 'Claimed' : typeLabels[item.type]}
            </Badge>
          </div>
          {/* Urgent Badge for recent items */}
          {item.status === 'active' && new Date(item.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000 && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-amber-500 text-white">New</Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-slate-900 mb-2 line-clamp-1">{item.name}</h3>
          
          <p className="text-sm text-slate-600 mb-3 line-clamp-2">{item.description}</p>
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Tag className="w-3.5 h-3.5" />
              <span>{categoryLabels[item.category]}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5" />
              <span className="line-clamp-1">{item.location}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>{timeAgo(item.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
