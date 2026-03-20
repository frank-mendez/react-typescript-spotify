import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "../context/AuthProvider";
import { router } from "./routes";

if (!import.meta.env.VITE_CLIENT_ID) {
  throw new Error("VITE_CLIENT_ID environment variable is required");
}
if (!import.meta.env.VITE_REDIRECT_URI) {
  throw new Error("VITE_REDIRECT_URI environment variable is required");
}

// Apply saved theme immediately to avoid flash of wrong theme
const savedTheme =
  localStorage.getItem("theme") ??
  (globalThis.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light");
document.documentElement.classList.add(savedTheme);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
