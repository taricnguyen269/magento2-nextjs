"use client";
import { FC } from "react";
import { Newsletter } from "@/components";
import Link from "next/link";
import { Queries } from "@/utils/graphql";
import { useQuery } from "@apollo/client";
import { FooterAPIResponse } from "@/types";

export interface FooterProps {}

export const Footer: FC<FooterProps> = () => {
  const { GET_FOOTER_CONTENT } = Queries;

  const { data: footerData } = useQuery<FooterAPIResponse>(GET_FOOTER_CONTENT);

  const footerMenu = footerData?.getFooterContent;

  return (
    <footer className="footer p-10 bg-primary-500 text-base-content">
      <Link href={"/"}>
        <span className="text-white">ARIEL BATH</span>
        <span className="text-white">Copyright © 2025</span>
      </Link>
      <nav className="text-white">
        <header className="footer-title">Categories</header>
        {footerMenu?.map((route, i) => (
          <Link key={i} href={`/${route.url}`} className="link link-hover">
            {route?.title}
          </Link>
        ))}
      </nav>
      <Newsletter />
    </footer>
  );
};
