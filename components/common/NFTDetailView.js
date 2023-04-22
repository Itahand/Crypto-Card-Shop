import { useRouter } from "next/router";
import { useRecoilState } from "recoil";
import {
  basicNotificationContentState,
  showBasicNotificationState,
} from "../../lib/atoms";
import {
  getImageSrcFromMetadataViewsFile,
  getRarityColor,
} from "../../lib/utils";
import Product from "../Product";
import data from "../../data.json";

export default function NFTDetailView(props) {
  const router = useRouter();
  const { collection: collectionPath, token_id: tokenID } = router.query;
  console.log(tokenID);
  const [, setShowBasicNotification] = useRecoilState(
    showBasicNotificationState
  );
  const [, setBasicNotificationContent] = useRecoilState(
    basicNotificationContentState
  );

  const { metadata } = props;

  const getDisplayView = (metadata) => {
    const display = metadata.display;
    if (!display) return null;
    const collectionDisplay = metadata.collectionDisplay;
    const serial = metadata.serial;
    const rarity = metadata.rarity;
    let rarityColor = null;
    if (rarity && rarity.description) {
      rarityColor = getRarityColor(rarity.description.toLowerCase());
    }
    const externalURL = metadata.externalURL;
    const imageSrc = getImageSrcFromMetadataViewsFile(display.thumbnail);
    return (
      <div className="w-full pb-4 pt-2 px-2 flex justify-center gap-x-5">
        <div
          className="m-auto w-96 shrink-0 shadow-md aspect-square flex 
          justify-center rounded-2xl bg-white relative overflow-hidden ring-1 
        ring-black ring-opacity-5"
          id="metaVideo"
        >
          <video autoPlay loop>
            <source src={metadata.medias.items[1].file.url} />
          </video>
        </div>
        <div className="w-full flex flex-col gap-y-2 justify-between">
          <div className="flex flex-col gap-y-2 items-start">
            {collectionDisplay ? (
              <label className="font-semibold text-gray-500">
                NBA Top Shot
              </label>
            ) : null}
            <div className="w-full flex gap-x-3 justify-between items-center">
              <label className="font-bold text-black text-3xl">
                {display.name} Player full name
              </label>
            </div>
            <div className="flex gap-x-1">
              {rarity && rarity.description ? (
                <label
                  className={`font-bold text-xs px-2 py-1 leading-5 rounded-full ${rarityColor}`}
                >{`${rarity.description.toUpperCase()}`}</label>
              ) : null}
              {serial ? (
                <label
                  className={`font-bold text-xs px-2 py-1 leading-5 rounded-full bg-yellow-100 text-yellow-800`}
                >{`Serial: #${serial.number}`}</label>
              ) : null}
            </div>

            <label className="text-black text-base">
              {display.description}
            </label>
            {/* getTraitsView(metadata) */}
          </div>
          {externalURL ? (
            <div className="font-semibold">
              {`View on `}
              <a
                href={externalURL.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-bold decoration-drizzle decoration-2"
              >
                {new URL(externalURL.url).hostname}
              </a>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`w-full flex flex-col gap-y-1 pb-2 justify-between shrink-0 overflow-hidden`}
    >
      {!metadata || Object.keys(metadata).length == 0 ? (
        <div className="w-full flex flex-col mt-10 h-[70px] text-gray-400 text-base justify-center items-center">
          <label>{`${collectionPath} #${tokenID}`}</label>
          <label>{`No metadata found`}</label>
        </div>
      ) : (
        <>
          {getDisplayView(metadata)}
          <div className="min-w-min flex">
            {data.map((product) => (
              <Product product={product} key={product.id} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
