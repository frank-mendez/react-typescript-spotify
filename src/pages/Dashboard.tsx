import Header from "../components/Header/Header.tsx";
import Footer from "../components/Footer/Footer.tsx";
import Sidebar from "../components/Sidebar.tsx";
import MainContent from "../components/MainContent.tsx";
import ExpandContent from "../components/ExpandContent.tsx";

const Dashboard = () => {
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
