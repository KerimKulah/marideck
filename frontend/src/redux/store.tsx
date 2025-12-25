import { configureStore } from '@reduxjs/toolkit'
import { authSlice } from './slices/authSlice';
import { customerSlice } from './slices/customerSlice';
import { shipSlice } from './slices/shipSlice';
import { operationSlice } from './slices/operationSlice';
import { userSlice } from './slices/userSlice';
import { taskSlice } from './slices/taskSlice';
import documentReducer from './slices/documentSlice';

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        customer: customerSlice.reducer,
        ship: shipSlice.reducer,
        operation: operationSlice.reducer,
        user: userSlice.reducer,
        task: taskSlice.reducer,
        document: documentReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

