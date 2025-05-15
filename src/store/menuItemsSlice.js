import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchMenuItems, getMenuItemById, createMenuItem, updateMenuItem, deleteMenuItem } from '../services/menuItemService';

// Async thunks for API operations
export const fetchAllMenuItems = createAsyncThunk(
  'menuItems/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await fetchMenuItems(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMenuItemById = createAsyncThunk(
  'menuItems/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getMenuItemById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
  totalCount: 0,
};

const menuItemsSlice = createSlice({
  name: 'menuItems',
  initialState,
  reducers: {
    clearSelectedItem: (state) => {
      state.selectedItem = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllMenuItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllMenuItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.totalCount = action.payload.totalCount || action.payload.data.length;
      })
      .addCase(fetchAllMenuItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch menu items';
      })
      .addCase(fetchMenuItemById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuItemById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchMenuItemById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch menu item';
      });
  },
});

export const { clearSelectedItem } = menuItemsSlice.actions;
export default menuItemsSlice.reducer;