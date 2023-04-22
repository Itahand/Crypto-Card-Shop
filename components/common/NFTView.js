import Image from "next/image";
import { getRarityColor } from "../../lib/utils";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getNftMetadataViews } from "../../flow/scripts";
import { isValidFlowAddress } from "../../lib/utils";

export default function NFTView(props) {
  const router = useRouter();
  const { account } = router.query;
  const { display } = props;
  const rarityColor = getRarityColor(
    display.rarity ? display.rarity.toLowerCase() : null
  );

  const [metadataError, setMetadataError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  console.log(metadata);

  const nameWords = display.name.split(" ");
  const playerName = nameWords[0] + " " + nameWords[1];

  useEffect(() => {
    if (account && isValidFlowAddress(account)) {
      getNftMetadataViews(account, "MomentCollection", display.tokenID)
        .then((metadataViews) => {
          setMetadata(metadataViews);
        })
        .catch((e) => {
          console.error(e, "ERROR");
          if (typeof e == "object") {
            if (e.errorMessage.includes("NFT does not exist")) {
              setMetadataError("NFT not found");
            } else if (e.errorMessage.includes("Get Collection Failed")) {
              setMetadataError("No Collection Found");
            } else {
              setMetadataError("Get metadata failed");
            }
          } else {
            setMetadataError("Get metadata failed");
          }
        });
    }
  }, [account]);

  const getTraitsView = (metadata) => {
    const traits = metadata.traits && metadata.traits.traits;
    if (!traits || traits.length == 0) return null;
    return (
      <>
        <label className="px-3 max-h-12 break-words overflow-hidden text-ellipsis font-flow font-semibold text-xs text-black">
          {playerName}
        </label>

        <label className="px-3 font-flow font-medium text-xs text-gray-400">
          {`Play Type: ${metadata.traits.traits[10].value}`}
        </label>
        <label className="px-3 font-flow font-medium text-xs text-gray-400">
          {`${metadata.editions.infoList[0].name}`}
        </label>
        <label className="px-3 font-flow font-medium text-xs text-gray-400">
          {`Serial: #${metadata.editions.infoList[0].number}`}
        </label>
      </>
    );
  };

  return (
    <div
      className={`w-36 h-60 bg-white rounded-2xl flex flex-col gap-y-1 pb-2 justify-between items-center shrink-0 overflow-hidden shadow-md ring-1 ring-black ring-opacity-5`}
    >
      <div className="flex justify-center w-full rounded-t-2xl aspect-square bg-drizzle-ultralight relative overflow-hidden">
        {
          <video autoPlay loop>
            {metadata ? (
              <source src={metadata.medias.items[1].file.url} />
            ) : (
              <></>
            )}
          </video>
        }
        {display.rarity ? (
          <div
            className={`absolute top-2 px-2 ${rarityColor} rounded-full font-flow font-medium text-xs`}
          >
            {`${display.rarity}`.toUpperCase()}
          </div>
        ) : null}
      </div>

      {metadata ? getTraitsView(metadata) : <>Loading METADATA</>}
    </div>
  );
}
