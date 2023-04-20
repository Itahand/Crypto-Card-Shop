import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import * as fcl from "@onflow/fcl";
import config from "../flow/config.js";
import publicConfig from "../publicConfig.js";
import { useEffect, useState } from "react";

import { useRecoilState } from "recoil";
import {
  showBasicNotificationState,
  basicNotificationContentState,
} from "../lib/atoms.js";
import { LogoutIcon, ShoppingCartIcon } from "@heroicons/react/outline";

export default function NavigationBar() {
  const [, setShowBasicNotification] = useRecoilState(
    showBasicNotificationState
  );
  const [, setBasicNotificationContent] = useRecoilState(
    basicNotificationContentState
  );
  //
  const router = useRouter();
  const [user, setUser] = useState({ loggedIn: null });
  useEffect(() => fcl.currentUser.subscribe(setUser), []);

  useEffect(() => {
    const shouldDoConnectionJump =
      localStorage.getItem("shouldDoConnectionJump") || "YES";
    if ((user && user.loggedIn && shouldDoConnectionJump) == "YES") {
      localStorage.setItem("shouldDoConnectionJump", "NO");
      router.push(
        `/account/${user.addr}/collection/MomentCollection`,
        undefined,
        { shallow: true }
      );
    }
  }, [user]);

  useEffect(() => {
    window.addEventListener("message", async (d) => {
      if (
        (d.data.type === "FCL:VIEW:RESPONSE" &&
          d.data.status === "APPROVED" &&
          d.data.data.network &&
          d.data.data.network !== publicConfig.chainEnv) ||
        (d.data.type === "LILICO:NETWORK" &&
          typeof d.data.network === "string" &&
          d.data.network != publicConfig.chainEnv)
      ) {
        fcl.unauthenticate();
        setShowBasicNotification(true);
        setBasicNotificationContent({
          type: "exclamation",
          title: "WRONG NETWORK",
          detail: null,
        });
        await new Promise((r) => setTimeout(r, 2));
        localStorage.setItem("shouldDoConnectionJump", "YES");
      }
    });
  }, []);

  const AuthedState = () => {
    return (
      <div className="shrink truncate flex gap-x-2 items-center">
        <button
          className="cursor-pointer shrink truncate font-flow text-base
          text-black shadow-sm
          bg-drizzle rounded-full px-3 py-2 leading-5"
          onClick={() => {
            if (user && user.loggedIn) {
              router.push(
                `/account/${user.addr}/collection/MomentCollection`,
                undefined,
                {
                  shallow: true,
                }
              );
            }
          }}
        >
          {user && user.addr}
        </button>

        <button
          type="button"
          className="shrink-0 bg-drizzle rounded-full p-2"
          onClick={() => {
            fcl.unauthenticate();
            localStorage.setItem("shouldDoConnectionJump", "YES");
          }}
        >
          <LogoutIcon className="h-5 w-5 text-black" />
        </button>
      </div>
    );
  };

  const UnauthenticatedState = () => {
    return (
      <div>
        <button
          type="button"
          className="h-12 px-6 text-base rounded-2xl font-flow font-semibold shadow-sm text-black bg-drizzle hover:bg-drizzle-dark"
          onClick={fcl.logIn}
        >
          <label className="hidden sm:block">Connect Wallet</label>
          <label className="block sm:hidden">Connect</label>
        </button>
      </div>
    );
  };

  return (
    <div className="px-6 m-auto max-w-7xl min-w-[380px] relative gap-x-5 flex items-center justify-between bg-transparent h-20">
      <div className="flex items-center gap-x-1 sm:gap-x-2">
        <Link href="/">
          <label className="cursor-pointer font-flow font-bold text-2xl sm:text-3xl">
            Crypto Card Shop
          </label>
        </Link>
      </div>
      {user && user.loggedIn ? <AuthedState /> : <UnauthenticatedState />}
      <div className="relative cursor-pointer w-10 h-10">
        <Link href={"/cart"}>
          <div>
            <ShoppingCartIcon />
            <span className="absolute -top-2 -right-2 text-[13px] bg-red-600 h-[18px] w-[18px] rounded-full grid place-items-center text-white">
              0
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
