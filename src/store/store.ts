import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authApi } from "./authApi";
import authReducer from "./authSlice";
import { userApi } from "./userApi";
import { medicineApi } from "./medicineApi";
import { unitApi } from "./unitApi";
import { refillApi } from "./refillApi";
export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [medicineApi.reducerPath]: medicineApi.reducer,
    [unitApi.reducerPath]: unitApi.reducer,
    [refillApi.reducerPath]: refillApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware).concat(userApi.middleware).concat(medicineApi.middleware).concat(unitApi.middleware).concat(refillApi.middleware),
});

// for TypeScript types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

setupListeners(store.dispatch);
