import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  route('login', 'routes/login.tsx'),
  route('products', 'routes/products.tsx'),
  route('categories', 'routes/categories.tsx'),
  route('admin', 'routes/admin.tsx'),
  route('*', 'routes/404.tsx'),
] satisfies RouteConfig
