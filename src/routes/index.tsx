import { createBrowserRouter, RouteObject } from "react-router-dom";
import Dashboard from "../pages/Dashboard.tsx";
import Login from "../pages/Login.tsx";
const routes: RouteObject[] = [
  {
    path: "/",
    element: <Dashboard />,
  },
  { path: "/login", element: <Login /> },
];

export const router = createBrowserRouter(routes);
