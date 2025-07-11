import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from '../../api/axios';



interface GetCustomersParams {
    page?: number;
    limit?: number;
    search?: string;
}

// GET CUSTOMERS WITH PAGINATION AND SEARCH
export const getCustomers = createAsyncThunk(
    "customer/getCustomers",
    async ({ page, limit, search }: GetCustomersParams, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();
            if (page) params.append('page', page.toString());
            if (limit) params.append('limit', limit.toString());
            if (search) params.append('search', search);

            const response = await api.get(`/customer?${params.toString()}`);
            return response.data; // { customers, customersCount, page, limit, totalPages }
        } catch (error: any) {
            return rejectWithValue(error.response?.data || { message: "An error occurred while fetching customers" });
        }
    }
)

// CREATE CUSTOMER 
export const createCustomer = createAsyncThunk("customer/createCustomer", async (customer: any, { rejectWithValue }) => {
    try {
        const response = await api.post("/customer", customer);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data || { message: "Bilinmeyen hata" });
    }
})

// UPDATE CUSTOMER
export const updateCustomer = createAsyncThunk("customer/updateCustomer", async (customer: any, { rejectWithValue }) => {
    try {
        const response = await api.put(`/customer/${customer.id}`, customer);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data || { message: "Bilinmeyen hata" });
    }
})

// DELETE CUSTOMER (SOFT)
export const deleteCustomer = createAsyncThunk("customer/deleteCustomer", async (id: string, { rejectWithValue }) => {
    try {
        const response = await api.delete(`/customer/${id}`);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data || { message: "Bilinmeyen hata" });
    }
})

interface CustomerState {
    customers: any[];
    customer: any | null;
    loading: boolean;
    error: string | null;
    page: number;
    limit: number;
    totalCustomers: number;
    totalPages: number;
    searchQuery: string;
}

const initialState: CustomerState = {
    customers: [],
    customer: null,
    loading: false,
    error: null,
    page: 1,
    limit: 5,
    totalCustomers: 0,
    totalPages: 1,
    searchQuery: '',
};

export const customerSlice = createSlice({
    name: "customer",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setPage: (state, action: PayloadAction<number>) => {
            state.page = action.payload;
        },
        setLimit: (state, action: PayloadAction<number>) => {
            state.limit = action.payload;
            state.page = 1;
        },
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
            state.page = 1;
        },
        resetCustomerState: () => initialState,
    },
    extraReducers: (builder) => {
        builder.addCase(getCustomers.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        builder.addCase(getCustomers.fulfilled, (state, action) => {
            state.loading = false;
            state.customers = action.payload.customers;
            state.totalCustomers = action.payload.customersCount;

            // Only update pagination if they were provided in the request
            if (action.payload.page !== undefined) state.page = action.payload.page;
            if (action.payload.limit !== undefined) state.limit = action.payload.limit;
            if (action.payload.totalPages !== undefined) state.totalPages = action.payload.totalPages;

            state.error = null;
        })
        builder.addCase(getCustomers.rejected, (state, action) => {
            state.loading = false;
            state.error = (action.payload as any)?.message || "Bilinmeyen hata";
        })
        builder.addCase(createCustomer.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        builder.addCase(createCustomer.fulfilled, (state, action) => {
            state.loading = false;
            state.customers.unshift(action.payload);
            state.error = null;
        })
        builder.addCase(createCustomer.rejected, (state, action) => {
            state.loading = false;
            state.error = (action.payload as any)?.message || "Bilinmeyen hata";
        })
        builder.addCase(updateCustomer.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        builder.addCase(updateCustomer.fulfilled, (state, action) => {
            state.loading = false;
            state.customers = state.customers.map((customer) => customer.id === action.payload.id ? action.payload : customer);
            state.error = null;
        })
        builder.addCase(updateCustomer.rejected, (state, action) => {
            state.loading = false;
            state.error = (action.payload as any)?.message || "Bilinmeyen hata";
        })
        builder.addCase(deleteCustomer.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        builder.addCase(deleteCustomer.fulfilled, (state, action) => {
            state.loading = false;
            state.customers = state.customers.filter((customer) => customer.id !== action.payload.id);
            state.error = null;
        })
        builder.addCase(deleteCustomer.rejected, (state, action) => {
            state.loading = false;
            state.error = (action.payload as any)?.message || "Bilinmeyen hata";
        })
    }
});

export default customerSlice.reducer;
export const { clearError, setPage, setLimit, setSearchQuery, resetCustomerState } = customerSlice.actions;

