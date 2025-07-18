import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../../api/axios';

export const setAccessToken = (token: string) => {
    localStorage.setItem("accessToken", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export const removeAccessToken = () => {
    localStorage.removeItem("accessToken");
    delete api.defaults.headers.common["Authorization"];
}

// LOGIN 
export const login = createAsyncThunk("auth/login", async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
        const response = await api.post("/auth/login", credentials);
        setAccessToken(response.data.accessToken);
        return response.data; // Access token, user(dto), expiresAt dönüyor.
    } catch (error: any) {
        return rejectWithValue(error.response?.data || { message: "Bilinmeyen hata" });
    }
})

// LOGOUT 
export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
    try {
        await api.post("/auth/logout");
        removeAccessToken();
        return;
    } catch (error: any) {
        removeAccessToken();
        return rejectWithValue(error.response?.data || { message: "Bilinmeyen hata" });
    }
})

// CURRENT_USER
export const currentUser = createAsyncThunk("auth/currentUser", async (_, { rejectWithValue }) => {
    try {
        const response = await api.get("/auth/current-user");
        return response.data; // User(dto) dönüyor.
    } catch (error: any) {
        return rejectWithValue(error.response?.data || { message: "Bilinmeyen hata" });
    }
})

// Backendden gelen UserDto
interface User {
    id: number;
    photo?: string;
    firstName: string;
    lastName: string;
    email: string;
    roles: { id: number; name: string }[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    phone: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    isInitialized: boolean;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    isInitialized: false,
}

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(login.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        builder.addCase(login.fulfilled, (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.error = null;
            // state.user = action.payload.user;
            state.isInitialized = true;
        })
        builder.addCase(login.rejected, (state, action) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.error = (action.payload as any)?.message || "Giriş başarısız";
        })
        builder.addCase(logout.fulfilled, (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.loading = false;
            state.error = null;
            state.isInitialized = false;
        })
        builder.addCase(logout.rejected, (state, action) => {
            state.loading = false;
            state.error = (action.payload as any)?.message || "Çıkış başarısız";
            state.user = null;
            state.isAuthenticated = false;
        })
        builder.addCase(logout.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        builder.addCase(currentUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        builder.addCase(currentUser.fulfilled, (state, action) => {
            state.user = action.payload;
            state.loading = false;
            state.isAuthenticated = true;
            state.error = null;
            state.isInitialized = true;
        })
        builder.addCase(currentUser.rejected, (state, action) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.error = null;
            state.isInitialized = true;
        })
    }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
