import { useEffect, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import Layout from './components/layout/Layout.jsx';
import ProtectedRoute from './components/routing/ProtectedRoute.jsx';
import AdminRoute from './components/routing/AdminRoute.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';
import { fetchProducts } from './store/slices/productsSlice.js';
import { fetchCategories } from './store/slices/categoriesSlice.js';
import { restoreSession } from './store/slices/authSlice.js';

// The home page is part of the main bundle; every other page is loaded on demand
// (code splitting), which keeps the first download small.
import Home from './pages/Home.jsx';

const Products = lazy(() => import('./pages/Products.jsx'));
const ProductDetail = lazy(() => import('./pages/ProductDetail.jsx'));
const Cart = lazy(() => import('./pages/Cart.jsx'));
const Wishlist = lazy(() => import('./pages/Wishlist.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess.jsx'));
const Orders = lazy(() => import('./pages/Orders.jsx'));
const OrderDetail = lazy(() => import('./pages/OrderDetail.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard.jsx'));
const ManageProducts = lazy(() => import('./pages/admin/ManageProducts.jsx'));
const ManageCategories = lazy(() => import('./pages/admin/ManageCategories.jsx'));
const Inventory = lazy(() => import('./pages/admin/Inventory.jsx'));
const ManageOrders = lazy(() => import('./pages/admin/ManageOrders.jsx'));

function App() {
  const dispatch = useDispatch();

  // When the app starts: load the catalogue and ask the server who is logged in.
  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
    dispatch(restoreSession());
  }, [dispatch]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/order-success/:id" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ManageProducts />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="orders" element={<ManageOrders />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
