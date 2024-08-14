import { useAuth } from "../context/AuthContext.tsx";
import { Navigate } from "react-router-dom";

const Dashboard = () => {
  const { accessToken } = useAuth();
  if (!accessToken) {
    return <Navigate to="/login" />;
  }
  return <h1>Dashboard</h1>;
};

export default Dashboard;
