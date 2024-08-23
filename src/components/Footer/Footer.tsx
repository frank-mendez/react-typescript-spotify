import SideCard from "./SideCard.tsx";
import SideControls from "./SideControls.tsx";
import MainControls from "./MainControls.tsx";

const Footer = () => {
  return (
    <footer
      data-testid="footer-element"
      className="footer footer-center bg-base-200 text-base-content p-4"
    >
      <div className="flex flex-row justify-between w-full">
        <SideCard />
        <MainControls />
        <SideControls />
      </div>
    </footer>
  );
};

export default Footer;
