import { useContentStore } from "../stores/useContentStore.ts";
import { MainContent as MC } from "../data-objects/enum";
import Profile from "../pages/Profile.tsx";
import Settings from "../pages/Settings.tsx";

const MainContent = () => {
  const { currentContent } = useContentStore();
  return (
    <div
      data-testid="main-content-element"
      className="card bg-base-300 my-10 basis-3/4 shadow-xl max-h-screen overflow-y-auto"
    >
      {currentContent === MC.PROFILE && <Profile />}
      {currentContent === MC.SETTINGS && <Settings />}
    </div>
  );
};

export default MainContent;
