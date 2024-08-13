import { createBrowserRouter } from "react-router-dom";
import Dashboard from "../pages/Dashboard.tsx";
import Callback from "../pages/Callback.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/callback",
    element: <Callback />,
  },
]);
