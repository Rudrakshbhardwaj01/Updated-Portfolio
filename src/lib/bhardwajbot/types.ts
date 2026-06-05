export type PageContext = {
  pathname: string;
  pageType: "home" | "writings-index" | "writing" | "other";
  title?: string;
  slug?: string;
};
