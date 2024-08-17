import Header from "../components/Header/Header.tsx";
import Footer from "../components/Footer/Footer.tsx";
import Sidebar from "../components/Sidebar.tsx";
import MainContent from "../components/MainContent.tsx";
import ExpandContent from "../components/ExpandContent.tsx";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";

const Dashboard = () => {
  const { accessToken } = useAuth();
  if (!accessToken) {
    return <Navigate to="/login" />;
  }
  return (
    <div data-testid="dashboard-element">
      <Header />
      <div className="flex flex-row gap-2 px-2">
        <Sidebar />
        <MainContent />
        <ExpandContent />
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
