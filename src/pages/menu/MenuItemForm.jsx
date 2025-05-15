import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getMenuItemById, createMenuItem, updateMenuItem } from '../../services/menuItemService';
import Layout from '../../components/layout/Layout';
import { Save, ArrowLeft, X, Plus, Image } from 'lucide-react';
import { toast } from 'react-toastify';

const MenuItemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEditing = !!id;
  
  // Form state
  const [formData, setFormData] = useState({
    Name: '',
    description: '',
    price: '',
    category: '',
    dietary_restrictions: [],
    available: true,
    image_url: '',
    preparation_time: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Categories and dietary options from the DB structure
  const categories = ['Breakfast', 'Lunch', 'Dinner', 'Sides', 'Beverages', 'Desserts'];
  const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Low-Carb'];

  // Fetch menu item data if editing
  useEffect(() => {
    const fetchMenuItemData = async () => {
      if (isEditing) {
        setLoading(true);
        try {
          const data = await getMenuItemById(id);
          if (data) {
            // If dietary_restrictions is a string, convert to array
            const dietaryRestrictions = typeof data.dietary_restrictions === 'string'
              ? data.dietary_restrictions.split(';')
              : data.dietary_restrictions || [];
              
            setFormData({
              ...data,
              dietary_restrictions: dietaryRestrictions,
              price: data.price || '',
              preparation_time: data.preparation_time || ''
            });
          }
        } catch (error) {
          console.error('Error fetching menu item:', error);
          toast.error('Failed to load menu item data');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchMenuItemData();
  }, [id, isEditing]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'price') {
      // Only allow valid currency input (numbers and decimal point)
      const regex = /^(\d+)?(\.\d{0,2})?$/;
      if (value === '' || regex.test(value)) {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else if (name === 'preparation_time') {
      // Only allow valid number input
      const regex = /^\d*$/;
      if (value === '' || regex.test(value)) {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else if (type === 'checkbox') {
      if (name === 'available') {
        setFormData({
          ...formData,
          [name]: checked
        });
      } else if (name.startsWith('dietary_')) {
        const restriction = name.replace('dietary_', '');
        setFormData({
          ...formData,
          dietary_restrictions: checked
            ? [...formData.dietary_restrictions, restriction]
            : formData.dietary_restrictions.filter(r => r !== restriction)
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.Name.trim()) {
      newErrors.Name = 'Name is required';
    }
    
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(parseFloat(formData.price))) {
      newErrors.price = 'Price must be a valid number';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (formData.preparation_time && isNaN(parseInt(formData.preparation_time))) {
      newErrors.preparation_time = 'Preparation time must be a valid number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }
    
    setLoading(true);
    
    try {
      // Format data for API
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        preparation_time: formData.preparation_time ? parseInt(formData.preparation_time) : null,
        // Join dietary_restrictions array if needed by the API
        dietary_restrictions: formData.dietary_restrictions.join(';')
      };
      
      if (isEditing) {
        // Include ID for update
        await updateMenuItem({ ...submitData, Id: parseInt(id) });
        toast.success('Menu item updated successfully');
      } else {
        const result = await createMenuItem(submitData);
        toast.success('Menu item created successfully');
      }
      
      // Navigate back to menu items list
      navigate('/menu');
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error(isEditing ? 'Failed to update menu item' : 'Failed to create menu item');
    } finally {
      setLoading(false);
    }
  };

  // Handle image URL change
  const handleImageChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      image_url: value
    });
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/menu" className="mr-4">
            <ArrowLeft className="w-5 h-5 text-surface-600 hover:text-surface-900" />
          </Link>
          <h1 className="text-2xl font-bold">{isEditing ? 'Edit Menu Item' : 'Add Menu Item'}</h1>
        </div>
        <div className="flex space-x-3">
          <Link 
            to="/menu" 
            className="px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-md flex items-center"
          >
            <X className="w-5 h-5 mr-2" />
            Cancel
          </Link>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70 flex items-center"
          >
            {loading ? (
              <span className="loading-spinner mr-2"></span>
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            {isEditing ? 'Update Item' : 'Save Item'}
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-surface-800 rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Name <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  name="Name"
                  value={formData.Name}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.Name ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'} bg-white dark:bg-surface-700`}
                />
                {errors.Name && <p className="mt-1 text-sm text-red-600">{errors.Name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows="4"
                  className="w-full p-2 border border-surface-300 dark:border-surface-600 rounded-md bg-white dark:bg-surface-700"
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price ($) <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={`w-full p-2 border rounded-md ${errors.price ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'} bg-white dark:bg-surface-700`}
                  />
                  {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Prep Time (mins)</label>
                  <input
                    type="text"
                    name="preparation_time"
                    value={formData.preparation_time || ''}
                    onChange={handleChange}
                    placeholder="15"
                    className={`w-full p-2 border rounded-md ${errors.preparation_time ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'} bg-white dark:bg-surface-700`}
                  />
                  {errors.preparation_time && <p className="mt-1 text-sm text-red-600">{errors.preparation_time}</p>}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Category <span className="text-red-600">*</span></label>
                <select
                  name="category"
                  value={formData.category || ''}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${errors.category ? 'border-red-500' : 'border-surface-300 dark:border-surface-600'} bg-white dark:bg-surface-700`}
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
              </div>
              
              <div>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    name="available"
                    checked={formData.available}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium">Available for Ordering</label>
                </div>
                <p className="text-xs text-surface-500">
                  When checked, this item will appear in the ordering menu.
                </p>
              </div>
            </div>
            
            {/* Additional Information */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    name="image_url"
                    value={formData.image_url || ''}
                    onChange={handleImageChange}
                    placeholder="https://example.com/image.jpg"
                    className="flex-grow p-2 border border-surface-300 dark:border-surface-600 rounded-md bg-white dark:bg-surface-700"
                  />
                </div>
                
                {formData.image_url && (
                  <div className="mt-3 border rounded-md overflow-hidden">
                    <img 
                      src={formData.image_url} 
                      alt="Menu item preview" 
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                      }}
                    />
                  </div>
                )}
                
                {!formData.image_url && (
                  <div className="mt-3 border border-dashed rounded-md p-8 flex items-center justify-center flex-col">
                    <Image className="w-12 h-12 text-surface-400 mb-2" />
                    <p className="text-surface-500 text-sm">Enter an image URL above to preview</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Dietary Restrictions</label>
                <div className="grid grid-cols-2 gap-2">
                  {dietaryOptions.map(option => (
                    <div key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        name={`dietary_${option}`}
                        checked={formData.dietary_restrictions.includes(option)}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <label className="text-sm">{option}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              {isEditing && (
                <div className="border-t border-surface-200 dark:border-surface-700 pt-4 mt-6">
                  <h3 className="text-sm font-medium mb-2">Item Details</h3>
                  <div className="text-sm text-surface-600 dark:text-surface-400 space-y-1">
                    <p>Item ID: {id}</p>
                    {formData.CreatedOn && (
                      <p>Created: {new Date(formData.CreatedOn).toLocaleString()}</p>
                    )}
                    {formData.ModifiedOn && (
                      <p>Last Modified: {new Date(formData.ModifiedOn).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default MenuItemForm;