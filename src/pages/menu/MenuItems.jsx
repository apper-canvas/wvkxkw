import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllMenuItems } from '../../store/menuItemsSlice';
import { deleteMenuItem } from '../../services/menuItemService';
import Layout from '../../components/layout/Layout';
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';

const MenuItems = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error, totalCount } = useSelector(state => state.menuItems);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    dietary: [],
    available: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  
  // Categories and dietary options from the DB structure
  const categories = ['Breakfast', 'Lunch', 'Dinner', 'Sides', 'Beverages', 'Desserts'];
  const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Low-Carb'];

  // Fetch menu items when component mounts or filters change
  useEffect(() => {
    const fetchItems = async () => {
      // Build filter conditions based on current filters
      const filterConditions = [];
      
      if (searchQuery) {
        filterConditions.push({
          fieldName: "Name",
          Operator: "Contains",
          values: [searchQuery]
        });
      }
      
      if (filters.category) {
        filterConditions.push({
          fieldName: "category",
          Operator: "ExactMatch",
          values: [filters.category]
        });
      }
      
      if (filters.dietary.length > 0) {
        filterConditions.push({
          fieldName: "dietary_restrictions",
          Operator: "Contains",
          values: filters.dietary
        });
      }
      
      if (filters.available === 'true') {
        filterConditions.push({
          fieldName: "available",
          Operator: "ExactMatch",
          values: [true]
        });
      } else if (filters.available === 'false') {
        filterConditions.push({
          fieldName: "available",
          Operator: "ExactMatch",
          values: [false]
        });
      }
      
      const whereGroups = filterConditions.length > 0 ? [{
        operator: "AND",
        subGroups: [{
          conditions: filterConditions,
          operator: ""
        }]
      }] : undefined;
      
      dispatch(fetchAllMenuItems({
        filters: whereGroups,
        pagingInfo: {
          limit: itemsPerPage,
          offset: (page - 1) * itemsPerPage
        }
      }));
    };
    
    fetchItems();
  }, [dispatch, page, itemsPerPage, searchQuery, filters]);

  // Handle search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page on new search
  };

  // Handle filter changes
  const handleFilterChange = (type, value) => {
    if (type === 'category') {
      setFilters({ ...filters, category: value });
    } else if (type === 'available') {
      setFilters({ ...filters, available: value });
    } else if (type === 'dietary') {
      // Toggle dietary restriction
      const newDietary = filters.dietary.includes(value)
        ? filters.dietary.filter(item => item !== value)
        : [...filters.dietary, value];
      setFilters({ ...filters, dietary: newDietary });
    }
    setPage(1); // Reset to first page on filter change
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      dietary: [],
      available: ''
    });
    setSearchQuery('');
    setPage(1);
  };

  // Handle item selection
  const toggleItemSelection = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    try {
      await deleteMenuItem(selectedItems);
      dispatch(fetchAllMenuItems({
        pagingInfo: { limit: itemsPerPage, offset: (page - 1) * itemsPerPage }
      }));
      setSelectedItems([]);
      toast.success(`${selectedItems.length} items deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete items');
    }
  };

  // Handle single item delete
  const handleDelete = async (id) => {
    try {
      await deleteMenuItem(id);
      dispatch(fetchAllMenuItems({
        pagingInfo: { limit: itemsPerPage, offset: (page - 1) * itemsPerPage }
      }));
      setConfirmDelete(null);
      toast.success('Item deleted successfully');
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menu Items</h1>
        <Link 
          to="/menu/new" 
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Add Menu Item
        </Link>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-surface-800 p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border rounded-md border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-surface-400" />
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)} 
              className="flex items-center px-3 py-2 border rounded-md border-surface-300 dark:border-surface-600"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters {(filters.category || filters.dietary.length > 0 || filters.available) && <span className="ml-1 w-2 h-2 bg-blue-600 rounded-full"></span>}
            </button>
            {(filters.category || filters.dietary.length > 0 || filters.available) && (
              <button 
                onClick={clearFilters} 
                className="flex items-center px-3 py-2 border rounded-md border-surface-300 dark:border-surface-600 text-red-600"
              >
                <X className="w-5 h-5 mr-2" />
                Clear
              </button>
            )}
          </div>
        </div>
        
        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 border rounded-md border-surface-200 dark:border-surface-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full p-2 border rounded-md border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              {/* Availability Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Availability</label>
                <select
                  value={filters.available}
                  onChange={(e) => handleFilterChange('available', e.target.value)}
                  className="w-full p-2 border rounded-md border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-700"
                >
                  <option value="">All Items</option>
                  <option value="true">Available Only</option>
                  <option value="false">Unavailable Only</option>
                </select>
              </div>
              
              {/* Dietary Restrictions Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Dietary Restrictions</label>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map(option => (
                    <label key={option} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.dietary.includes(option)}
                        onChange={() => handleFilterChange('dietary', option)}
                        className="mr-1"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Menu Items Table */}
      <div className="bg-white dark:bg-surface-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
            <thead>
              <tr className="bg-surface-50 dark:bg-surface-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Availability</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-surface-800 divide-y divide-surface-200 dark:divide-surface-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">Loading menu items...</td>
                </tr>
              ) : items.length > 0 ? (
                items.map(item => (
                  <tr key={item.Id} className="hover:bg-surface-50 dark:hover:bg-surface-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.image_url && (
                          <img 
                            src={item.image_url} 
                            alt={item.Name} 
                            className="w-10 h-10 rounded-full mr-3 object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{item.Name}</div>
                          <div className="text-sm text-surface-500 truncate max-w-xs">{item.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">${item.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.available 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {item.available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-2">
                        <Link to={`/menu/${item.Id}`} className="p-1 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700">
                          <Eye className="w-5 h-5 text-blue-600" />
                        </Link>
                        <Link to={`/menu/${item.Id}/edit`} className="p-1 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700">
                          <Edit className="w-5 h-5 text-green-600" />
                        </Link>
                        <button 
                          onClick={() => setConfirmDelete(item.Id)} 
                          className="p-1 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">No menu items found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-surface-200 dark:border-surface-700 px-4 py-3">
            <div className="flex items-center">
              <span className="text-sm text-surface-700 dark:text-surface-300">
                Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, totalCount)} of {totalCount} items
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="p-2 rounded-md border border-surface-300 dark:border-surface-600 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-sm text-surface-700 dark:text-surface-300">
                Page {page} of {totalPages}
              </div>
              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="p-2 rounded-md border border-surface-300 dark:border-surface-600 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-surface-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p className="mb-6 text-surface-600 dark:text-surface-400">
              Are you sure you want to delete this menu item? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
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

export default MenuItems;