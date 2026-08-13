import React, { Children, Suspense } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import DashBoard from "./pages/DashBoard";
import SignPage from "./pages/signPages/SignPage";
import { AuthProvider } from "./contexts/AuthContext";

const appRoutes: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <DashBoard />,
      },
      {
        path: "/sign",
        element: <SignPage />,
      },
    ],
  },
];

const router = createBrowserRouter([
  { element: <Outlet />, children: appRoutes },
]);

const App = () => {
  return (
    <AuthProvider>
      {" "}
      <Suspense>
        <RouterProvider router={router} />;
      </Suspense>
    </AuthProvider>
  );
};

export default App;
