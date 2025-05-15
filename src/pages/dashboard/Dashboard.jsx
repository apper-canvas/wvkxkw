import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Layout from '../../components/layout/Layout';
import { fetchMenuItems } from '../../services/menuItemService';
import { fetchOrders } from '../../services/orderService';
import { fetchInventoryItems } from '../../services/inventoryService';
import { 
  UtensilsCrossed, 
  ShoppingCart, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  Clock
} from 'lucide-react';
import Chart from 'react-apexcharts';
import { format } from 'date-fns';

const Dashboard = () => {
  const dispatch = useDispatch();
  const [menuItemsCount, setMenuItemsCount] = useState(0);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersByStatus, setOrdersByStatus] = useState({
    labels: ['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'],
    series: [0, 0, 0, 0, 0]
  });
  const [salesData, setSalesData] = useState({
    categories: [],
    series: [{
      name: 'Sales',
      data: []
    }]
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch menu items count
        const menuResponse = await fetchMenuItems();
        setMenuItemsCount(menuResponse.totalCount || 0);

        // Fetch pending orders
        const pendingOrdersResponse = await fetchOrders({
          filters: [{
            operator: "AND",
            subGroups: [{
              conditions: [{
                FieldName: "status",
                operator: "ExactMatch",
                values: ["Pending"]
              }],
              operator: ""
            }]
          }],
          pagingInfo: { limit: 5, offset: 0 }
        });
        setPendingOrders(pendingOrdersResponse.data || []);

        // Fetch low stock items
        const inventoryResponse = await fetchInventoryItems();
        const lowStock = (inventoryResponse.data || []).filter(
          item => item.quantity <= item.reorder_level
        ).slice(0, 5);
        setLowStockItems(lowStock);

        // Fetch recent orders
        const recentOrdersResponse = await fetchOrders({
          pagingInfo: { limit: 5, offset: 0 }
        });
        setRecentOrders(recentOrdersResponse.data || []);

        // Calculate orders by status for the pie chart
        const allOrdersResponse = await fetchOrders({
          pagingInfo: { limit: 100, offset: 0 }
        });
        const allOrders = allOrdersResponse.data || [];
        
        const statusCounts = {
          Pending: 0,
          Preparing: 0,
          Ready: 0,
          Delivered: 0,
          Cancelled: 0
        };
        
        allOrders.forEach(order => {
          if (statusCounts[order.status] !== undefined) {
            statusCounts[order.status]++;
          }
        });

        setOrdersByStatus({
          labels: Object.keys(statusCounts),
          series: Object.values(statusCounts)
        });

        // Generate sales data for the bar chart (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return format(d, 'MMM dd');
        }).reverse();

        // Simulate sales data
        const salesValues = Array.from({ length: 7 }, () => 
          Math.floor(Math.random() * 500) + 200
        );
        
        setSalesData({
          categories: last7Days,
          series: [{
            name: 'Sales',
            data: salesValues
          }]
        });

      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [dispatch]);

  // Chart options
  const pieChartOptions = {
    labels: ordersByStatus.labels,
    chart: {
      type: 'donut',
    },
    legend: {
      position: 'bottom'
    },
    colors: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#F87171']
  };

  const barChartOptions = {
    chart: {
      type: 'bar',
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
      },
    },
    dataLabels: {
      enabled: false
    },
    colors: ['#3B82F6'],
    xaxis: {
      categories: salesData.categories,
    },
    yaxis: {
      title: {
        text: '$ (dollars)'
      }
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-surface-800 p-6 rounded-lg shadow-sm flex items-center">
          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 mr-4">
            <UtensilsCrossed className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-surface-500 dark:text-surface-400">Menu Items</p>
            <p className="text-2xl font-semibold">{menuItemsCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 p-6 rounded-lg shadow-sm flex items-center">
          <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mr-4">
            <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-surface-500 dark:text-surface-400">Pending Orders</p>
            <p className="text-2xl font-semibold">{pendingOrders.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 p-6 rounded-lg shadow-sm flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 mr-4">
            <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p className="text-sm text-surface-500 dark:text-surface-400">Low Stock Items</p>
            <p className="text-2xl font-semibold">{lowStockItems.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 p-6 rounded-lg shadow-sm flex items-center">
          <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 mr-4">
            <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-surface-500 dark:text-surface-400">Today's Sales</p>
            <p className="text-2xl font-semibold">${salesData.series[0].data[salesData.series[0].data.length - 1]}</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-surface-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            Sales Last 7 Days
          </h2>
          <Chart 
            options={barChartOptions}
            series={salesData.series}
            type="bar"
            height={300}
          />
        </div>

        <div className="bg-white dark:bg-surface-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            Orders by Status
          </h2>
          <Chart 
            options={pieChartOptions}
            series={ordersByStatus.series}
            type="donut"
            height={300}
          />
        </div>
      </div>

      {/* Recent Orders and Low Stock Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-surface-800 p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Link to="/orders" className="text-blue-600 hover:text-blue-800 text-sm">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                {recentOrders.map((order) => (
                  <tr key={order.Id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link to={`/orders/${order.Id}`} className="text-blue-600 hover:text-blue-800">
                        {order.Name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{order.customer_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'Preparing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Ready' ? 'bg-green-100 text-green-800' :
                        order.status === 'Delivered' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">${order.total_amount}</td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-4 py-3 text-center text-surface-500">No recent orders</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Low Stock Items</h2>
            <Link to="/inventory" className="text-blue-600 hover:text-blue-800 text-sm">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Reorder Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                {lowStockItems.map((item) => (
                  <tr key={item.Id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link to={`/inventory/${item.Id}`} className="text-blue-600 hover:text-blue-800">
                        {item.Name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-red-600 font-medium">{item.quantity}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{item.reorder_level}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{item.unit}</td>
                  </tr>
                ))}
                {lowStockItems.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-4 py-3 text-center text-surface-500">No low stock items</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;