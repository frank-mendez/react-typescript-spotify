// TODO: Rebuild with shadcn/ui in Task 14

const MainControls = () => {
  return (
    <div className="flex basis-1/2 flex-col gap-2">
      <div className="flex flex-row gap-2 m-auto mb-5">
        <button className="btn btn-circle btn-ghost bg-base-100">Shuffle</button>
        <button className="btn btn-circle btn-ghost bg-base-100">Prev</button>
        <button className="btn btn-circle btn-ghost bg-base-100">Play</button>
        <button className="btn btn-circle btn-ghost bg-base-100">Next</button>
        <button className="btn btn-circle btn-ghost bg-base-100">Repeat</button>
      </div>
      <div className="flex flex-row gap-2 items-center m-auto">
        <p className="text-xs">1:50</p>
        <progress
          className="progress w-[400px]"
          value={50}
          max="100"
        ></progress>
        <p className="text-xs">3:00</p>
      </div>
    </div>
  );
};

export default MainControls;
