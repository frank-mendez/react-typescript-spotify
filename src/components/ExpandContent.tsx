const ExpandContent = () => {
  return (
    <div
      data-testid="expand-content-element"
      className="rounded-2xl my-10 bg-base-300 min-h-fit basis-1/8 p-4"
    >
      <div className="flex flex-col gap-4">
        <h1>Top 50 Global</h1>
        <img
          className="rounded"
          src="/assets/images/bruno.png"
          alt="Album"
          width={300}
          height={300}
        />
      </div>
    </div>
  );
};

export default ExpandContent;
