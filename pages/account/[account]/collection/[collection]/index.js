import { ArrowLeftIcon } from "@heroicons/react/outline";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import Layout from "../../../../../components/common/Layout";
import NFTListView from "../../../../../components/common/NFTListView";
import Spinner from "../../../../../components/common/Spinner";
import { bulkGetNftCatalog, getStoredItems } from "../../../../../flow/scripts";
import {
  basicNotificationContentState,
  nftCatalogState,
  showBasicNotificationState,
} from "../../../../../lib/atoms";
import {
  collectionsWithCatalogInfo,
  collectionsWithDisplayInfo,
  collectionsWithExtraData,
  getContractLink,
  getImageSrcFromMetadataViewsFile,
  isValidFlowAddress,
  isValidStoragePath,
} from "../../../../../lib/utils";
import publicConfig from "../../../../../publicConfig";
import Custom404 from "../../404";

export default function CollectionDetail(props) {
  const router = useRouter();
  const { account: account, collection: collectionPath } = router.query;

  const [, setShowBasicNotification] = useRecoilState(
    showBasicNotificationState
  );
  const [, setBasicNotificationContent] = useRecoilState(
    basicNotificationContentState
  );
  const [nftCatalog, setNftCatalog] = useRecoilState(nftCatalogState);
  const [collection, setCollection] = useState(null);
  const [collectionData, setCollectionData] = useState(null);
  const [collectionError, setCollectionError] = useState(null);
  const [needRelink, setNeedRelink] = useState(false);
  const [collectionDisplay, setCollectionDisplay] = useState(null);

  useEffect(() => {
    if (publicConfig.chainEnv === "emulator") {
      setNftCatalog({});
      return;
    }

    if (!nftCatalog) {
      bulkGetNftCatalog()
        .then((catalog) => {
          setNftCatalog(catalog);
        })
        .catch((e) => console.error(e));
    }
  }, []);

  useEffect(() => {
    if (account && isValidFlowAddress(account)) {
      getStoredItems(account, [collectionPath])
        .then((items) => {
          if (items.length == 0) {
            setCollectionError("No Collection Found");
          } else if (!items[0].isNFTCollection) {
            setCollectionError("Not NFT Collection");
          } else {
            setCollectionData(items);
          }
        })
        .catch((e) => console.error(e));
    }
  }, [account]);

  useEffect(() => {
    if (collectionData && collectionData.length > 0) {
      const newCollections = collectionsWithExtraData(
        collectionsWithDisplayInfo(collectionData)
      );
      const tempCollection = newCollections[0];
      const sortedIDs = tempCollection.tokenIDs
        .map((a) => BigInt(a))
        .sort((a, b) => {
          if (b - a > 0) {
            return 1;
          } else if (b - a == 0) {
            return 0;
          } else if (b - a < 0) {
            return -1;
          }
        });
      tempCollection.tokenIDs = sortedIDs;
      setCollection(tempCollection);
    }
  }, [collectionData]);

  useEffect(() => {
    if (nftCatalog && collection && !collection.addedCatalogInfo) {
      const newCollections = collectionsWithCatalogInfo(
        [collection],
        nftCatalog
      );
      setCollection(newCollections[0]);
    }
  }, [nftCatalog, collection]);

  if (!account) {
    return <div className="h-screen"></div>;
  }

  if (account && isValidFlowAddress(account)) {
    if (!collectionPath) {
      return <Custom404 title={"Collection not found 1"} />;
    }
  } else {
    return <Custom404 title={"Account may not exist"} />;
  }

  if (collectionError) {
    return <Custom404 title={collectionError} />;
  }

  const showCollection = () => {
    if (!collection) {
      return (
        <div className="flex w-full mt-10 h-[200px] justify-center">
          <Spinner />
        </div>
      );
    } else {
      console.log(account, collection);
      return (
        <>
          {collection.tokenIDs.length > 0 ? (
            <div className="h-screen">
              <NFTListView
                collection={collection}
                setNeedRelink={setNeedRelink}
                setCollectionDisplay={setCollectionDisplay}
              />
            </div>
          ) : (
            <div className="flex mt-10 h-[70px] text-gray-400 text-base justify-center">
              Nothing found
            </div>
          )}
        </>
      );
    }
  };

  const getBasicInfoView = () => {
    let imageSrc = "/token_placeholder.png";
    let name = collectionPath;
    let description = null;
    let linkSource = null;
    if (
      collection &&
      collection.addedCatalogInfo &&
      collection.collectionIdentifier
    ) {
      imageSrc = getImageSrcFromMetadataViewsFile(
        collection.squareImage ? collection.squareImage.file : null
      );
      name = collection.name ? collection.name : collection.contractName;
      description = collection.description;
      linkSource = collection;
    } else if (collectionDisplay) {
      imageSrc = getImageSrcFromMetadataViewsFile(
        collectionDisplay.squareImage
          ? collectionDisplay.squareImage.file
          : null
      );
      name = collectionDisplay.name;
      description = collectionDisplay.description;
      linkSource = collectionDisplay;
    }

    return (
      <div className="p-2 w-[calc(min(100vw,80rem)-160px)] sm:w-[calc(min(100vw,80rem)-192px)] overflow-auto">
        <div className="w-[1070px] flex gap-x-10 justify-between items-center">
          <div className="flex gap-x-3 items-center">
            <div className="h-[64px] w-[64px] shrink-0 relative rounded-full ring-1 ring-drizzle">
              <Image
                src={imageSrc}
                alt=""
                fill
                sizes="5vw"
                className="object-contain rounded-full"
              />
            </div>
            <div className="flex flex-col gap-y-1">
              <h1 className="shrink-0 text-xl sm:text-2xl font-bold text-gray-900">
                NBA Top Shot
              </h1>
              <div
                className="cursor-pointer text-black text-xs mb-1 underline decoration-1 decoration-drizzle"
                onClick={() => {
                  router.push(
                    {
                      pathname: `/account/[account]/storage/[storage]`,
                      query: { account: account, storage: collectionPath },
                    },
                    undefined,
                    { shallow: true, scroll: false }
                  );
                }}
              ></div>
            </div>
          </div>
        </div>
        <div className="px-1 py-2 w-[1070px]">{description}</div>
      </div>
    );
  };

  return (
    <div className="container mx-auto max-w-7xl min-w-[380px] px-2">
      <Layout>
        <div className="flex flex-col gap-y-3">
          <button
            className="mb-2 self-start"
            onClick={() => {
              router.push(
                {
                  pathname: "/account/[account]/collection",
                  query: { account: account },
                },
                undefined,
                { shallow: true, scroll: false }
              );
            }}
          >
            <div className="flex gap-x-2 text-drizzle items-center">
              <ArrowLeftIcon className="h-5 w-5" />
              <label className="cursor-pointer">Collections</label>
            </div>
          </button>

          {getBasicInfoView()}

          <div className="w-[calc(min(100vw,80rem)-160px)] sm:w-[calc(min(100vw,80rem)-192px)] overflow-auto">
            {showCollection()}
          </div>
        </div>
      </Layout>
    </div>
  );
}
