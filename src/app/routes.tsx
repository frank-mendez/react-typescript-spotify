import { createBrowserRouter } from "react-router-dom";
import { getRoutes } from "./routeDefinitions";

export const router = createBrowserRouter(getRoutes());
