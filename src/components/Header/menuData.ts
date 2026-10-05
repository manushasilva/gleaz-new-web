import type { MenuItem } from "./types";

export const menuData: MenuItem[] = [
  {
    title: "Home",
    path: "/",
  },
  {
    title: "Shop",
    path: "/shop-with-sidebar?category=women",
  },
  {
    title: "Categories",
    submenu: [
      {
        title: "Women",
        path: "/shop-with-sidebar?category=women",
      },
      {
        title: "Men",
        path: "/shop-with-sidebar?category=men",
      },
      {
        title: "Accessories",
        path: "/shop-with-sidebar?category=accessories",
      },
    ],
  },
  {
    title: "Sale",
    path: "/shop-with-sidebar?category=women",
  },
  {
    title: "Products",
    path: "/shop-with-sidebar?category=men",
  },
  {
    title: "Top Deals",
    path: "/shop-with-sidebar?category=women",
  },
  {
    title: "Elements",
    path: "/shop-with-sidebar?category=accessories",
  },
];
