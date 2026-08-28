import { Suspense } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import type { RouteObject } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import DashBoard from "./pages/dashboard";
import WorkSpace from "./pages/WorkSpace";
import SignPage from "./pages/signPages/SignPage";
import Profile from "./pages/userUtilityPages/Profile";
import Setting from "./pages/userUtilityPages/Setting";
import CreateStatic from "./pages/create/CreateStatic";
import CreateWebService from "./pages/create/CreateWebService";
import Repository from "./pages/Repository";
import Account from "./components/settings/general/Account";
import Theme from "./components/settings/general/Theme";

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
        children: [
          {
            index: true,
            element: <Account />,
          },
          {
            path: "general/theme",
            element: <Theme />,
          },
          {
            path: "general/account",
            element: <Account />,
          },
        ],
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "static",
        element: <CreateStatic />,
      },
      {
        path: "webservice",
        element: <CreateWebService />,
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
