import { Suspense } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import type { RouteObject } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import DashBoard from "./pages/dashboard";
import WorkSpace from "./pages/WorkSpace";
import SignPage from "./pages/signPages/SignPage";
import Profile from "./pages/userUtilityPages/Profile";
import Setting from "./pages/userUtilityPages/Setting";
import CreateRepo from "./pages/CreateRepo";
import Repository from "./pages/Repository";

const appRoutes: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/dashboard",
        element: <DashBoard />,
        children: [
          {
            index: true,
            element: <DashBoard />,
          },
          {
            path: ":id",
            element: <Repository />,
          },
        ],
      },
      {
        path: "/sign",
        element: <SignPage />,
      },
      {
        path: "/workspace",
        element: <WorkSpace />,
      },
      {
        path: "/setting",
        element: <Setting />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/create",
        element: <CreateRepo />,
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
      <RouterProvider router={router} />
    </Suspense>
  );
};

export default App;
