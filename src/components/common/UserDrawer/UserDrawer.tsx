"use client";
import {
  Authentication,
  Avatar,
  Drawer,
  UserAccountDrawer,
} from "@/components";
import { useAppContext } from "@/context";
import { FC, Fragment, useEffect, useState } from "react";

export interface UserDrawerProps {}

export const UserDrawer: FC<UserDrawerProps> = () => {
  const { isAccountDrawerOpen, authToken, setIsAccountDrawerOpen } =
    useAppContext();
  
  // Use mounted state to prevent hydration mismatch
  // On server and initial client render, show default state (no authToken)
  // After hydration, update to actual authToken value
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Fragment>
      <button
        className="btn btn-ghost btn-circle text-white"
        onClick={() => setIsAccountDrawerOpen((prev) => !prev)}
      >
        <div tabIndex={0} role="button">
          <Avatar />
        </div>
      </button>

      <Drawer
        isOpen={isAccountDrawerOpen}
        setIsOpen={() => setIsAccountDrawerOpen((prev) => !prev)}
      >
        {/* Only show auth-dependent content after mount to prevent hydration mismatch */}
        {mounted && (
          <>
            <div className={authToken ? "block" : "hidden"}>
              <UserAccountDrawer />
            </div>
            <div className={authToken ? "hidden" : "block"}>
              <Authentication />
            </div>
          </>
        )}
        {/* Show default state during SSR and initial render */}
        {!mounted && (
          <div className="block">
            <Authentication />
          </div>
        )}
      </Drawer>
    </Fragment>
  );
};
