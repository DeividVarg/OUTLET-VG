import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("products", "routes/products.tsx"),
  route("categories", "routes/categories.tsx"),
  layout("components/ProtectedRoute.tsx", [route("admin", "routes/admin.tsx")]),
  route("*", "routes/404.tsx"),
  route("product/:id", "routes/productsByCategory.tsx"),
  route("product/productDetail/:id", "routes/productsById.tsx"),
  route("register", "routes/Register.tsx"),
  route("forgot-password", "routes/forgot-password.tsx"),
  route("reset-password", "routes/reset-password.tsx"),
  route("cart", "routes/cart.tsx"),
  route("purchase", "routes/purchase.tsx"),
  route("purchase/success", "routes/purchases.succses.tsx"),
  route("purchase/direct", "routes/purchase.direct.tsx"),
  route("purchase/mypurchases", "routes/mypurchases.tsx"),
  route("purchase/failed", "routes/purchase.failed.tsx"),
] satisfies RouteConfig;
