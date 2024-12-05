import { Navigate, createBrowserRouter } from "react-router-dom";

import { Applayout } from "./components/layouts/AppLayout";

import NoMatch from "./pages/NoMatch";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import React from "react";
export const token = localStorage.getItem("access_token");
const basename = "/";

export const router = createBrowserRouter([
    {
        path: "/",
        element: token? <Applayout /> : <Navigate to="/login" />,
        children: [
            {
                path: "",
                element: <Dashboard />,
            },
              
        ],
    },
    {
        path: "*",
        element: <NoMatch />,
    },
    {
        path: "login",
        element: <Login />,
    },
    {
        path: "forgotPassword",
        element: <ForgotPassword />,
    },
   
], {
    basename: basename,
    future: {
        v7_partialHydration: true, // Enable partial hydration for React Router v7
      },
})
