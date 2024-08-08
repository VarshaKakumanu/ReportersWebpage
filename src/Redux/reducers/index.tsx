import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import loginReducer from "./login";
import userDetailsReducer from "./userDetails";
import LoginDetailsReducer from "./logindata";
import LoginParamsReducer from "./Loginparam";

// Define persist config
const persistConfig = {
    key: 'root',
    storage,
    whitelist: [ 'userDetails','LoginDetailsReducer','loginParams'] // Add reducers you want to persist
};

// Combine multiple reducers into a single root reducer
const rootReducer = combineReducers({
    loggedIn: loginReducer, // Handles state related to user login
    userDetails: userDetailsReducer, // Handles state related to user details
    LoginDetailsReducer:LoginDetailsReducer,
    loginParams: LoginParamsReducer,
});

// Define a type for the entire state tree
export type RootState = ReturnType<typeof rootReducer>;

// Create a persisted reducer
const persistedReducer = persistReducer<RootState, any>(persistConfig, rootReducer as any);
export default persistedReducer; // Export the persisted reducer for use in the store