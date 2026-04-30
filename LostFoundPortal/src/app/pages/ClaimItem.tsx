import { useParams, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
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
import { getItemById, getCurrentUser, addClaim, getClaimsByItemId } from '../utils/storage';
import { Item } from '../types';
import { toast } from 'sonner';

export function ClaimItem() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [message, setMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (id) {
      const foundItem = getItemById(id);
      setItem(foundItem || null);

      // Check if user already claimed
      if (foundItem) {
        const claims = getClaimsByItemId(id);
        const userClaim = claims.find(c => c.userId === currentUser.id);
        if (userClaim) {
          setSubmitted(true);
        }
      }
    }
  }, [id, currentUser.id]);

  if (!item) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Item Not Found</h2>
          <p className="text-slate-600 mb-4">The item you're trying to claim doesn't exist.</p>
          <Button onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (item.status === 'claimed') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <Button variant="ghost" onClick={() => navigate(`/item/${id}`)} className="mb-4 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Item
        </Button>
        <Alert className="bg-slate-50 border-slate-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This item has already been claimed and is no longer available.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Claim Submitted!</h2>
              <p className="text-slate-600 mb-6">
                Your claim request has been sent. The item owner will review it and get back to you.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate('/dashboard')}>
                  View Dashboard
                </Button>
                <Button variant="outline" onClick={() => navigate('/')}>
                  Back to Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const confirmClaim = () => {
    const newClaim = {
      id: Date.now().toString(),
      itemId: item.id,
      itemName: item.name,
      userId: currentUser.id,
      userName: currentUser.name,
      status: 'pending' as const,
      message: message.trim() || 'I believe this is my item.',
      createdAt: new Date().toISOString(),
    };

    addClaim(newClaim);
    setShowConfirmation(false);
    setSubmitted(true);
    toast.success('Claim submitted successfully!');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <Button
        variant="ghost"
        onClick={() => navigate(`/item/${id}`)}
        className="mb-4 gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Item
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Claim Item</CardTitle>
          <CardDescription>
            Submit a claim request for: <span className="font-semibold text-slate-900">{item.name}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Preview */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex gap-4">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{item.name}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2">{item.description}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {item.type === 'lost' ? 'Lost' : 'Found'} at {item.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <Label htmlFor="message">
                Why do you believe this is your item? (Optional)
              </Label>
              <Textarea
                id="message"
                placeholder="Provide additional details to help verify ownership..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="mt-1.5"
              />
              <p className="text-sm text-slate-500 mt-1.5">
                This information will be shared with the {item.type === 'lost' ? 'owner' : 'finder'}.
              </p>
            </div>

            {/* Info Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Once submitted, the {item.type === 'lost' ? 'owner' : 'finder'} will review your claim request. 
                You'll be notified of their decision. Please be patient as they verify ownership.
              </AlertDescription>
            </Alert>

            {/* Duplicate Prevention Notice */}
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-900">
                You can only submit one claim per item. Make sure this is your item before submitting.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1">
                Submit Claim Request
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/item/${id}`)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Claim Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to claim "{item.name}"? Once submitted, the {item.type === 'lost' ? 'owner' : 'finder'} will 
              review your request. You cannot submit multiple claims for the same item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClaim}>
              Yes, Submit Claim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
