const SideCard = ({
  img,
  title,
  artist,
  styles,
  active,
}: {
  img: string;
  title: string;
  artist: string;
  active?: boolean;
  styles?: React.CSSProperties;
}) => {
  return (
    <div
      style={styles}
      className={`flex basis-1/4 flex-row items-center gap-2 cursor-pointer rounded-md p-2 ${active ? "bg-gray-700" : ""}`}
    >
      <img className="rounded" src={img} alt="Album" width={50} height={50} />
      <div className="flex flex-col text-left gap-2">
        <p className={`font-bold text-sm ${active ? "text-green-600" : ""}`}>
          {title}
        </p>
        <p className="text-xs">{artist}</p>
      </div>
    </div>
  );
};

export default SideCard;
