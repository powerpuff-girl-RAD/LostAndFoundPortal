import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Package, Inbox, CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { EmptyState } from '../components/EmptyState';
import {
  getCurrentUser,
  getItems,
  getClaims,
  updateClaim,
  updateItem,
  getClaimsByUserId,
} from '../utils/storage';
import { Item, Claim } from '../types';
import { toast } from 'sonner';

export function Dashboard() {
  const currentUser = getCurrentUser();
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [myClaims, setMyClaims] = useState<Claim[]>([]);
  const [claimsOnMyItems, setClaimsOnMyItems] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allItems = getItems();
    const userItems = allItems.filter(item => item.userId === currentUser.id);
    setMyItems(userItems);

    const userClaims = getClaimsByUserId(currentUser.id);
    setMyClaims(userClaims);

    const allClaims = getClaims();
    const claimsForMyItems = allClaims.filter(claim => 
      userItems.some(item => item.id === claim.itemId)
    );
    setClaimsOnMyItems(claimsForMyItems);
  };

  const handleApproveClaim = () => {
    if (!selectedClaim) return;

    updateClaim(selectedClaim.id, { status: 'approved' });
    updateItem(selectedClaim.itemId, { status: 'claimed' });
    
    // Reject all other claims for this item
    const otherClaims = claimsOnMyItems.filter(
      c => c.itemId === selectedClaim.itemId && c.id !== selectedClaim.id && c.status === 'pending'
    );
    otherClaims.forEach(claim => {
      updateClaim(claim.id, { status: 'rejected' });
    });

    setShowApproveDialog(false);
    setSelectedClaim(null);
    loadData();
    toast.success('Claim approved! Item marked as claimed.');
  };

  const handleRejectClaim = () => {
    if (!selectedClaim) return;

    updateClaim(selectedClaim.id, { status: 'rejected' });
    setShowRejectDialog(false);
    setSelectedClaim(null);
    loadData();
    toast.success('Claim rejected.');
  };

  const activeItems = myItems.filter(item => item.status === 'active');
  const pendingClaimsOnMyItems = claimsOnMyItems.filter(claim => claim.status === 'pending');

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Dashboard</h1>
        <p className="text-slate-600">
          Welcome back, {currentUser.name}! Manage your items and claims.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-slate-900">{myItems.length}</div>
            <div className="text-sm text-slate-600">Total Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{activeItems.length}</div>
            <div className="text-sm text-slate-600">Active Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">{myClaims.length}</div>
            <div className="text-sm text-slate-600">My Claims</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{pendingClaimsOnMyItems.length}</div>
            <div className="text-sm text-slate-600">Pending Reviews</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="my-items" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-items">
            My Items ({myItems.length})
          </TabsTrigger>
          <TabsTrigger value="my-claims">
            My Claims ({myClaims.length})
          </TabsTrigger>
        </TabsList>

        {/* My Items Tab */}
        <TabsContent value="my-items" className="space-y-6">
          {/* Pending Claims Alert */}
          {pendingClaimsOnMyItems.length > 0 && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 mb-1">
                      You have {pendingClaimsOnMyItems.length} pending claim{pendingClaimsOnMyItems.length !== 1 ? 's' : ''} to review
                    </h3>
                    <p className="text-sm text-amber-800">
                      Review claims below to approve or reject them.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Items List */}
          {myItems.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No items yet"
              description="You haven't reported any lost or found items. Start by reporting an item."
              action={
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link to="/report-lost">
                    <Button>Report Lost Item</Button>
                  </Link>
                  <Link to="/report-found">
                    <Button variant="outline">Report Found Item</Button>
                  </Link>
                </div>
              }
            />
          ) : (
            <div className="space-y-4">
              {myItems.map((item) => {
                const itemClaims = claimsOnMyItems.filter(c => c.itemId === item.id);
                const pendingClaims = itemClaims.filter(c => c.status === 'pending');

                return (
                  <Card key={item.id}>
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-24 h-24 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900 mb-1">{item.name}</h3>
                              <p className="text-sm text-slate-600 line-clamp-2">{item.description}</p>
                            </div>
                            <Badge
                              className={
                                item.status === 'claimed'
                                  ? 'bg-slate-100 text-slate-600'
                                  : item.type === 'lost'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-green-100 text-green-700'
                              }
                            >
                              {item.status === 'claimed' ? 'Claimed' : item.type === 'lost' ? 'Lost' : 'Found'}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mb-3">
                            <span>{categoryLabels[item.category]}</span>
                            <span>{item.location}</span>
                            <span>{new Date(item.date).toLocaleDateString()}</span>
                          </div>

                          {pendingClaims.length > 0 && (
                            <div className="bg-amber-50 rounded-lg p-3 mb-3">
                              <div className="font-medium text-amber-900 text-sm mb-2">
                                {pendingClaims.length} Pending Claim{pendingClaims.length !== 1 ? 's' : ''}
                              </div>
                              <div className="space-y-2">
                                {pendingClaims.map((claim) => (
                                  <div
                                    key={claim.id}
                                    className="flex items-center justify-between bg-white rounded p-2"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-slate-900 text-sm">
                                        {claim.userName}
                                      </div>
                                      {claim.message && (
                                        <p className="text-xs text-slate-600 line-clamp-1">
                                          {claim.message}
                                        </p>
                                      )}
                                      <div className="text-xs text-slate-500">
                                        {new Date(claim.createdAt).toLocaleDateString()}
                                      </div>
                                    </div>
                                    <div className="flex gap-2 ml-2">
                                      <Button
                                        size="sm"
                                        variant="default"
                                        onClick={() => {
                                          setSelectedClaim(claim);
                                          setShowApproveDialog(true);
                                        }}
                                      >
                                        <CheckCircle2 className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setSelectedClaim(claim);
                                          setShowRejectDialog(true);
                                        }}
                                      >
                                        <XCircle className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Link to={`/item/${item.id}`}>
                              <Button size="sm" variant="outline" className="gap-2">
                                <Eye className="w-4 h-4" />
                                View Details
                              </Button>
                            </Link>
                            {itemClaims.length > 0 && (
                              <Badge variant="secondary" className="self-center">
                                {itemClaims.length} total claim{itemClaims.length !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* My Claims Tab */}
        <TabsContent value="my-claims" className="space-y-4">
          {myClaims.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No claims yet"
              description="You haven't submitted any claims. Browse items to find what you're looking for."
              action={
                <Link to="/">
                  <Button>Browse Items</Button>
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {myClaims.map((claim) => {
                const item = getItems().find(i => i.id === claim.itemId);
                if (!item) return null;

                return (
                  <Card key={claim.id}>
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-24 h-24 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h3 className="font-semibold text-slate-900 mb-1">{claim.itemName}</h3>
                              <p className="text-sm text-slate-600 line-clamp-2">{item.description}</p>
                            </div>
                            <Badge
                              variant={
                                claim.status === 'approved'
                                  ? 'default'
                                  : claim.status === 'rejected'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                              className={
                                claim.status === 'pending'
                                  ? 'bg-amber-100 text-amber-700'
                                  : ''
                              }
                            >
                              {claim.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                              {claim.status === 'approved' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                              {claim.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                              {claim.status}
                            </Badge>
                          </div>

                          {claim.message && (
                            <div className="bg-slate-50 rounded p-2 mb-3">
                              <div className="text-xs font-medium text-slate-700 mb-1">Your message:</div>
                              <p className="text-sm text-slate-600">{claim.message}</p>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mb-3">
                            <span>Claimed on {new Date(claim.createdAt).toLocaleDateString()}</span>
                          </div>

                          {claim.status === 'pending' && (
                            <div className="bg-blue-50 rounded-lg p-3 mb-3">
                              <p className="text-sm text-blue-900">
                                Your claim is being reviewed by the {item.type === 'lost' ? 'owner' : 'finder'}. You'll be notified once they make a decision.
                              </p>
                            </div>
                          )}

                          {claim.status === 'approved' && (
                            <div className="bg-green-50 rounded-lg p-3 mb-3">
                              <p className="text-sm text-green-900">
                                Congratulations! Your claim has been approved. Please coordinate with the {item.type === 'lost' ? 'owner' : 'finder'} to collect your item.
                              </p>
                            </div>
                          )}

                          {claim.status === 'rejected' && (
                            <div className="bg-red-50 rounded-lg p-3 mb-3">
                              <p className="text-sm text-red-900">
                                Your claim was not approved. This might not be your item. Continue browsing for other matches.
                              </p>
                            </div>
                          )}

                          <Link to={`/item/${item.id}`}>
                            <Button size="sm" variant="outline" className="gap-2">
                              <Eye className="w-4 h-4" />
                              View Item
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Claim</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this claim? This will mark the item as claimed and automatically reject all other pending claims for this item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApproveClaim}>
              Yes, Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Claim</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this claim? The user will be notified that their claim was not approved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRejectClaim} className="bg-red-600 hover:bg-red-700">
              Yes, Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
