import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "@/api/axios";

interface GetShipsParams {
    page?: number;
    limit?: number;
    search?: string;
}

// GET SHIPS WITH PAGINATION AND SEARCH
export const getShips = createAsyncThunk("ship/getShips", async ({ page, limit, search }: GetShipsParams, { rejectWithValue }) => {
    try {
        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (limit) params.append('limit', limit.toString());
        if (search) params.append('search', search);

        const response = await api.get(`/ship?${params.toString()}`);
        return response.data; // { ships, shipsCount, page, limit, totalPages }
    } catch (error: any) {
        return rejectWithValue(error.response?.data || { message: "An error occurred while fetching ships" });
    }
}
)

// CREATE SHIP
export const createShip = createAsyncThunk("ship/createShip", async (ship: any, { rejectWithValue }) => {
    try {
        const response = await api.post("/ship", ship);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data || { message: "Bilinmeyen hata" });
    }
})

// UPDATE SHIP
export const updateShip = createAsyncThunk("ship/updateShip", async (payload: { id: string; data: any }, { rejectWithValue }) => {
    try {
        const { id, data } = payload;
        const response = await api.put(`/ship/${id}`, data);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data || { message: "Bilinmeyen hata" });
    }
})

// DELETE SHIP (SOFT)
export const deleteShip = createAsyncThunk("ship/deleteShip", async (id: string, { rejectWithValue }) => {
    try {
        const response = await api.delete(`/ship/${id}`);
        return { id, ...response.data }; // ID'yi de döndürüyoruz
    } catch (error: any) {
        return rejectWithValue(error.response?.data || { message: "Bilinmeyen hata" });
    }
})

interface ShipState {
    ships: any[];
    ship: any | null;
    loading: boolean;
    error: string | null;
    page: number;
    limit: number;
    totalShips: number;
    totalPages: number;
    searchQuery: string;
    createLoading: boolean;
    updateLoading: boolean;
    deleteLoading: boolean;
}

const initialState: ShipState = {
    ships: [],
    ship: null,
    loading: false,
    error: null,
    page: 1,
    limit: 10,
    totalShips: 0,
    totalPages: 1,
    searchQuery: '',
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
}

export const shipSlice = createSlice({
    name: "ship",
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
        resetShipState: () => initialState,
        addShipOptimistic: (state, action) => {
            const newShip = { ...action.payload, id: `temp-${Date.now()}` };
            state.ships.unshift(newShip);
            state.totalShips += 1;
        },
        updateShipOptimistic: (state, action) => {
            const index = state.ships.findIndex(s => s.id === action.payload.id);
            if (index !== -1) {
                state.ships[index] = { ...state.ships[index], ...action.payload };
            }
        },
        removeShipOptimistic: (state, action) => {
            state.ships = state.ships.filter(s => s.id !== action.payload);
            state.totalShips -= 1;
        },
    },
    extraReducers: (builder) => {
        // GET SHIPS
        builder.addCase(getShips.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        builder.addCase(getShips.fulfilled, (state, action) => {
            state.loading = false;
            state.ships = action.payload.ships;
            state.totalShips = action.payload.shipsCount;

            if (action.payload.page !== undefined) state.page = action.payload.page;
            if (action.payload.limit !== undefined) state.limit = action.payload.limit;
            if (action.payload.totalPages !== undefined) state.totalPages = action.payload.totalPages;

            state.error = null;
        })
        builder.addCase(getShips.rejected, (state, action) => {
            state.loading = false;
            state.error = (action.payload as any)?.message || "Bilinmeyen hata";
        })

        // CREATE SHIP
        builder.addCase(createShip.pending, (state) => {
            state.createLoading = true;
            state.error = null;
        })
        builder.addCase(createShip.fulfilled, (state, action) => {
            state.createLoading = false;

            // Optimistic update yapıldıysa temp ID'li öğeyi kaldır ve gerçek veriyi ekle
            const tempIndex = state.ships.findIndex(s => s.id && s.id.toString().startsWith('temp-'));
            if (tempIndex !== -1) {
                state.ships[tempIndex] = action.payload;
            } else {
                // Eğer optimistic update yapılmadıysa direkt ekle
                state.ships.unshift(action.payload);
                state.totalShips += 1;
            }

            state.error = null;
        })
        builder.addCase(createShip.rejected, (state, action) => {
            state.createLoading = false;
            state.error = (action.payload as any)?.message || "Bilinmeyen hata";

            // Optimistic update başarısızsa temp öğeyi kaldır
            state.ships = state.ships.filter(s => !s.id || !s.id.toString().startsWith('temp-'));
            state.totalShips -= 1;
        })

        // UPDATE SHIP
        builder.addCase(updateShip.pending, (state) => {
            state.updateLoading = true;
            state.error = null;
        })
        builder.addCase(updateShip.fulfilled, (state, action) => {
            state.updateLoading = false;

            // State'teki müşteriyi güncelle
            const index = state.ships.findIndex(s => s.id === action.payload.id);
            if (index !== -1) {
                state.ships[index] = action.payload;
            }

            state.error = null;
        })
        builder.addCase(updateShip.rejected, (state, action) => {
            state.updateLoading = false;
            state.error = (action.payload as any)?.message || "Bilinmeyen hata";
        })

        // DELETE SHIP
        builder.addCase(deleteShip.pending, (state) => {
            state.deleteLoading = true;
            state.error = null;
        })
        builder.addCase(deleteShip.fulfilled, (state, action) => {
            state.deleteLoading = false;

            // Müşteriyi listeden kaldır
            state.ships = state.ships.filter(s => s.id !== action.payload.id);
            state.totalShips -= 1;

            // Eğer sayfa boş kaldıysa ve birinci sayfa değilse, önceki sayfaya git
            if (state.ships.length === 0 && state.page > 1) {
                state.page -= 1;
            }

            state.error = null;
        })
        builder.addCase(deleteShip.rejected, (state, action) => {
            state.deleteLoading = false;
            state.error = (action.payload as any)?.message || "Bilinmeyen hata";
        })
    }
});

export default shipSlice.reducer;
export const { clearError, setPage, setLimit, setSearchQuery, resetShipState, addShipOptimistic, updateShipOptimistic, removeShipOptimistic } = shipSlice.actions;






