import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import menuItemsReducer from './menuItemsSlice';
import ordersReducer from './ordersSlice';
import inventoryReducer from './inventorySlice';

// Configure Redux store with all slices
const store = configureStore({
  reducer: {
    user: userReducer,
    menuItems: menuItemsReducer,
    orders: ordersReducer,
    inventory: inventoryReducer,
  },
});

export default store;