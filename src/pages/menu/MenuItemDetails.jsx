import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getMenuItemById, deleteMenuItem } from '../../services/menuItemService';
import Layout from '../../components/layout/Layout';
import { ArrowLeft, Edit, Trash2, Clock, Tag, UtensilsCrossed, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const MenuItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [menuItem, setMenuItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const fetchMenuItem = async () => {
      setLoading(true);
      try {
        const data = await getMenuItemById(id);
        if (data) {
          setMenuItem(data);
        } else {
          setError('Menu item not found');
        }
      } catch (err) {
        console.error('Error fetching menu item:', err);
        setError('Failed to load menu item details');
        toast.error('Failed to load menu item details');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItem();
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteMenuItem(id);
      toast.success('Menu item deleted successfully');
      navigate('/menu');
    } catch (err) {
      console.error('Error deleting menu item:', err);
      toast.error('Failed to delete menu item');
    }
  };

  // Format dietary restrictions
  const formatDietaryRestrictions = (restrictions) => {
    if (!restrictions) return [];
    return typeof restrictions === 'string' ? restrictions.split(';') : restrictions;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center p-12">
          <div className="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  if (error || !menuItem) {
    return (
      <Layout>
        <div className="text-center p-12">
          <h2 className="text-xl font-semibold text-red-600 mb-4">{error || 'Menu item not found'}</h2>
          <Link to="/menu" className="text-blue-600 hover:text-blue-800">Return to Menu Items</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/menu" className="mr-4">
            <ArrowLeft className="w-5 h-5 text-surface-600 hover:text-surface-900" />
          </Link>
          <h1 className="text-2xl font-bold">{menuItem.Name}</h1>
        </div>
        <div className="flex space-x-3">
          <Link 
            to={`/menu/${id}/edit`}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
          >
            <Edit className="w-5 h-5 mr-2" />
            Edit
          </Link>
          <button 
            onClick={() => setConfirmDelete(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Item Image */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-surface-800 rounded-lg shadow-sm overflow-hidden">
            {menuItem.image_url ? (
              <img 
                src={menuItem.image_url} 
                alt={menuItem.Name} 
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                }}
              />
            ) : (
              <div className="w-full h-64 bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                <UtensilsCrossed className="w-16 h-16 text-surface-400" />
              </div>
            )}
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-xl">${menuItem.price}</span>
                <span className={`flex items-center text-sm ${
                  menuItem.available 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {menuItem.available 
                    ? <><CheckCircle className="w-4 h-4 mr-1" /> Available</> 
                    : <><XCircle className="w-4 h-4 mr-1" /> Unavailable</>
                  }
                </span>
              </div>
              <div className="flex items-center text-surface-600 dark:text-surface-400 text-sm">
                <Clock className="w-4 h-4 mr-1" />
                <span>{menuItem.preparation_time || 0} minutes prep time</span>
              </div>
            </div>
          </div>
          
          {/* Dietary Restrictions */}
          <div className="bg-white dark:bg-surface-800 rounded-lg shadow-sm p-4 mt-6">
            <h3 className="font-semibold text-surface-800 dark:text-surface-200 mb-3 flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              Dietary Information
            </h3>
            <div className="flex flex-wrap gap-2">
              {formatDietaryRestrictions(menuItem.dietary_restrictions).length > 0 ? (
                formatDietaryRestrictions(menuItem.dietary_restrictions).map(restriction => (
                  <span 
                    key={restriction}
                    className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs"
                  >
                    {restriction}
                  </span>
                ))
              ) : (
                <span className="text-surface-500 text-sm">No dietary restrictions</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Menu Item Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-surface-800 rounded-lg shadow-sm p-6">
            <h2 className="font-semibold text-xl mb-4">Item Details</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-surface-500 dark:text-surface-400">Category</h3>
                <p className="mt-1">{menuItem.category}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-surface-500 dark:text-surface-400">Description</h3>
                <p className="mt-1">{menuItem.description || 'No description provided'}</p>
              </div>
              
              {/* Item Metadata */}
              <div className="pt-4 border-t border-surface-200 dark:border-surface-700">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h3 className="font-medium text-surface-500 dark:text-surface-400">Item ID</h3>
                    <p>{menuItem.Id}</p>
                  </div>
                  
                  {menuItem.CreatedOn && (
                    <div>
                      <h3 className="font-medium text-surface-500 dark:text-surface-400">Created On</h3>
                      <p>{new Date(menuItem.CreatedOn).toLocaleString()}</p>
                    </div>
                  )}
                  
                  {menuItem.ModifiedOn && (
                    <div>
                      <h3 className="font-medium text-surface-500 dark:text-surface-400">Last Modified</h3>
                      <p>{new Date(menuItem.ModifiedOn).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-surface-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p className="mb-6 text-surface-600 dark:text-surface-400">
              Are you sure you want to delete "{menuItem.Name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MenuItemDetails;