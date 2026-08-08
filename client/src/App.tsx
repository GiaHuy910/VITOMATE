import React, { Children, Suspense } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

const appRoutes: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
      },
    ],
  },
];

const router = createBrowserRouter([
  { element: <Outlet />, children: appRoutes },
]);

const App = () => {
  return (
    <Suspense>
      <RouterProvider router={router} />;
    </Suspense>
  );
};

export default App;
