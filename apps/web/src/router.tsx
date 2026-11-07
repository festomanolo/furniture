import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import { AppShell } from "@/components/layout/AppShell";
import Home from "@/pages/Home";

const Explore = lazy(() => import("@/pages/Explore"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const SellerStore = lazy(() => import("@/pages/SellerStore"));
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Saved = lazy(() => import("@/pages/Saved"));
const Messages = lazy(() => import("@/pages/Messages"));
const Account = lazy(() => import("@/pages/Account"));
const CustomStudio = lazy(() => import("@/pages/CustomStudio"));
const Quotations = lazy(() => import("@/pages/Quotations"));
const OrdersList = lazy(() => import("@/pages/Orders").then((m) => ({ default: m.OrdersList })));
const OrderDetail = lazy(() => import("@/pages/Orders").then((m) => ({ default: m.OrderDetail })));
const Help = lazy(() => import("@/pages/Help"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/explore", element: <Explore mode="explore" /> },
      { path: "/category/:slug", element: <Explore mode="category" /> },
      { path: "/search", element: <Explore mode="search" /> },
      { path: "/product/:slug", element: <ProductDetail /> },
      { path: "/seller/:slug", element: <SellerStore /> },
      { path: "/custom-studio", element: <CustomStudio /> },
      { path: "/quotations", element: <Quotations /> },
      { path: "/cart", element: <Cart /> },
      { path: "/checkout", element: <Checkout /> },
      { path: "/orders", element: <OrdersList /> },
      { path: "/orders/:id", element: <OrderDetail /> },
      { path: "/saved", element: <Saved /> },
      { path: "/messages", element: <Messages /> },
      { path: "/account", element: <Account /> },
      { path: "/help/:topic", element: <Help /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
