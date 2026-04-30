import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Upload, X, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { addItem, getCurrentUser } from '../utils/storage';
import { Category } from '../types';
import { toast } from 'sonner';

export function ReportFound() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: '' as Category | '',
    description: '',
    location: '',
    date: '',
    contactPreference: '',
  });
  const [image, setImage] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories: { value: Category; label: string }[] = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'id-cards', label: 'ID Cards' },
    { value: 'books', label: 'Books' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'bags', label: 'Bags' },
    { value: 'keys', label: 'Keys' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'other', label: 'Other' },
  ];

  const contactOptions = [
    'Email me to claim',
    'Turn in to security office',
    'Turn in to library desk',
    'Contact me through platform',
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: 'Image must be less than 5MB' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setErrors({ ...errors, image: '' });
    }
  };

  const removeImage = () => {
    setImage('');
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const user = getCurrentUser();
    const newItem = {
      id: Date.now().toString(),
      type: 'found' as const,
      name: formData.name,
      category: formData.category as Category,
      description: formData.description,
      location: formData.location,
      date: formData.date,
      image: image || undefined,
      status: 'active' as const,
      userId: user.id,
      userName: user.name,
      createdAt: new Date().toISOString(),
      contactPreference: formData.contactPreference || undefined,
    };

    addItem(newItem);
    toast.success('Found item reported successfully!');
    navigate('/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <Card>
        <CardHeader>
          <CardTitle>Report Found Item</CardTitle>
          <CardDescription>
            Help reunite someone with their lost item by providing details about what you found.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Name */}
            <div>
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Student ID Card"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as Category })}
              >
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600 mt-1">{errors.category}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed description. Avoid including sensitive information for security purposes."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={errors.description ? 'border-red-500' : ''}
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">Location Found *</Label>
              <Input
                id="location"
                type="text"
                placeholder="e.g., Main Library Entrance"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className={errors.location ? 'border-red-500' : ''}
              />
              {errors.location && (
                <p className="text-sm text-red-600 mt-1">{errors.location}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <Label htmlFor="date">Date Found *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={errors.date ? 'border-red-500' : ''}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.date && (
                <p className="text-sm text-red-600 mt-1">{errors.date}</p>
              )}
            </div>

            {/* Contact Preference */}
            <div>
              <Label htmlFor="contactPreference">How to Claim (Optional)</Label>
              <Select
                value={formData.contactPreference}
                onValueChange={(value) => setFormData({ ...formData, contactPreference: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contact preference" />
                </SelectTrigger>
                <SelectContent>
                  {contactOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-slate-500 mt-1">
                Let others know how they can claim this item
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <Label>Image (Optional)</Label>
              <p className="text-sm text-slate-500 mb-2">
                Upload a photo to help the owner identify their item
              </p>
              
              {!image ? (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <Upload className="w-10 h-10 text-slate-400 mb-2" />
                  <span className="text-sm text-slate-600">Click to upload image</span>
                  <span className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              ) : (
                <div className="relative w-full h-40 rounded-lg overflow-hidden border border-slate-200">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {errors.image && (
                <p className="text-sm text-red-600 mt-1">{errors.image}</p>
              )}
            </div>

            {/* Info Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                For security reasons, avoid sharing sensitive personal information. The owner can claim the item through the platform.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1">
                Submit Report
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
