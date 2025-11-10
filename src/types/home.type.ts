import { CommonFetchType, PageInfo, Product } from "@/types";

export interface HomeInitialState extends CommonFetchType {
  sub_title: string;
  description: string;
  title: string;
  banner_image: string;
}

export interface TopSalesProduct {
  items: Product[];
  total_count: number;
  page_info: PageInfo;
}
export interface NewArrivalsSalesProduct {
  items: Product[];
  total_count: number;
  page_info: PageInfo;
}
export interface HotSalesProduct {
  items: Product[];
  total_count: number;
  page_info: PageInfo;
}

export interface categoryList {
  uid: string;
  name: string;
  children?: Menu[];
}

export interface Menu {
  uid: string;
  include_in_menu?: number;
  name: string;
  position?: number;
  url_path?: string;
  children?: Menu[];
  path?: string[];
  isActive?: boolean;
}

export interface HeaderAPIResponse {
  categoryList: categoryList[];
}
export interface FooterAPIResponse {
  getFooterContent: Menu[];
}
