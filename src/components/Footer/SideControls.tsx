// TODO: Rebuild with shadcn/ui in Task 14

const SideControls = () => {
  return (
    <div className="basis-1/4 flex flex-row gap-1 items-center justify-end">
      <progress className="progress w-[100px]" value={50} max="100"></progress>
    </div>
  );
};

export default SideControls;
