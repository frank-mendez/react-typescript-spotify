const SideCard = () => {
  return (
    <div className="flex basis-1/4 flex-row items-center gap-2">
      <img
        className="rounded"
        src="https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.webp"
        alt="Album"
        width={50}
        height={50}
      />
      <div className="flex flex-col">
        <p className="font-bold text-xs">Title</p>
        <p className="text-xs">Artist</p>
      </div>
    </div>
  );
};

export default SideCard;
