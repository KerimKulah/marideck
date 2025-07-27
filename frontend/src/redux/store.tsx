import { configureStore } from '@reduxjs/toolkit'
import { authSlice } from './slices/authSlice';
import { customerSlice } from './slices/customerSlice';
import { shipSlice } from './slices/shipSlice';
import { operationSlice } from './slices/operationSlice';

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        customer: customerSlice.reducer,
        ship: shipSlice.reducer,
        operation: operationSlice.reducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

