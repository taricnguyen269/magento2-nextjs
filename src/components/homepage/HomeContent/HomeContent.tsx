import { FC, useContext } from "react";
import { HomeContext } from "@/context";
import { RichContent } from "@/components";
import styles from "./homeContent.module.css";

export interface HomeContentProps {}

export const HomeContent: FC<HomeContentProps> = () => {
  const { cmsPageContent } = useContext(HomeContext);

  return (
    <div className={`${styles.root} home-page`}>
      {cmsPageContent?.content && (
        <RichContent html={cmsPageContent.content} />
      )}
    </div>
  );
};
