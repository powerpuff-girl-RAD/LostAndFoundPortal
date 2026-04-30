import { useParams, useNavigate, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Calendar, Tag, User, Mail, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { getItemById, getCurrentUser, getClaimsByItemId } from '../utils/storage';
import { Item, Claim } from '../types';

export function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (id) {
      const foundItem = getItemById(id);
      setItem(foundItem || null);
      
      if (foundItem) {
        const itemClaims = getClaimsByItemId(id);
        setClaims(itemClaims);
      }
    }
  }, [id]);

  if (!item) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Item Not Found</h2>
          <p className="text-slate-600 mb-4">The item you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const statusColors = {
    active: item.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700',
    claimed: 'bg-slate-100 text-slate-600',
  };

  const typeLabels = {
    lost: 'Lost Item',
    found: 'Found Item',
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

  const isOwner = item.userId === currentUser.id;
  const userHasClaimed = claims.some(c => c.userId === currentUser.id);
  const hasPendingClaims = claims.some(c => c.status === 'pending');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="mb-4 gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Browse
      </Button>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Image */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Tag className="w-24 h-24" />
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="flex gap-2">
            <Badge className={statusColors[item.status]}>
              {item.status === 'claimed' ? 'Claimed' : typeLabels[item.type]}
            </Badge>
            {item.status === 'active' && new Date(item.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000 && (
              <Badge className="bg-amber-500 text-white">
                New
              </Badge>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{item.name}</h1>
            <p className="text-lg text-slate-600">{item.description}</p>
          </div>

          {/* Metadata */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Tag className="w-5 h-5 text-slate-500 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-slate-700">Category</div>
                <div className="text-slate-600">{categoryLabels[item.category]}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-slate-500 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-slate-700">
                  Location {item.type === 'lost' ? 'Lost' : 'Found'}
                </div>
                <div className="text-slate-600">{item.location}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-slate-500 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-slate-700">
                  Date {item.type === 'lost' ? 'Lost' : 'Found'}
                </div>
                <div className="text-slate-600">
                  {new Date(item.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-slate-500 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-slate-700">
                  {item.type === 'lost' ? 'Reported by' : 'Found by'}
                </div>
                <div className="text-slate-600">{item.userName}</div>
              </div>
            </div>

            {item.contactPreference && (
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-slate-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-slate-700">How to Claim</div>
                  <div className="text-slate-600">{item.contactPreference}</div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 space-y-3">
            {item.status === 'claimed' && (
              <Alert className="bg-slate-50 border-slate-200">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  This item has been claimed and is no longer available.
                </AlertDescription>
              </Alert>
            )}

            {item.status === 'active' && !isOwner && !userHasClaimed && (
              <Link to={`/claim/${item.id}`}>
                <Button className="w-full" size="lg">
                  Claim This Item
                </Button>
              </Link>
            )}

            {item.status === 'active' && !isOwner && userHasClaimed && (
              <Alert className="bg-blue-50 border-blue-200">
                <Clock className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  You have already submitted a claim for this item. Check your dashboard for updates.
                </AlertDescription>
              </Alert>
            )}

            {isOwner && (
              <Alert className="bg-blue-50 border-blue-200">
                <User className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  This is your item. You can view claim requests in your dashboard.
                  {hasPendingClaims && (
                    <span className="block mt-1 font-medium">
                      You have pending claims to review!
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {isOwner && (
              <Link to="/dashboard">
                <Button variant="outline" className="w-full">
                  View Dashboard
                </Button>
              </Link>
            )}
          </div>

          {/* Recent Activity */}
          {claims.length > 0 && isOwner && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-slate-900 mb-3">
                  Claim Requests ({claims.length})
                </h3>
                <div className="space-y-2">
                  {claims.slice(0, 3).map((claim) => (
                    <div
                      key={claim.id}
                      className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                    >
                      <div className="text-sm">
                        <div className="font-medium text-slate-900">{claim.userName}</div>
                        <div className="text-slate-500 text-xs">
                          {new Date(claim.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge
                        variant={
                          claim.status === 'approved'
                            ? 'default'
                            : claim.status === 'rejected'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {claim.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                {claims.length > 3 && (
                  <Link to="/dashboard">
                    <Button variant="link" className="w-full mt-2 p-0">
                      View all claims
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}