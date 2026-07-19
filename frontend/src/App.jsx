import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import { PermissionProvider } from './context/PermissionContext'
import RegisterForm from './pages/auth/register/RegisterPages'
import LoginForm from './pages/auth/login/LoginPage'
import Home from "./pages/public/Home/Home"
import ProductDetail from "./pages/public/Home/components/detail/ProductDetail"
import BundleDetail from "./pages/public/Home/components/bundles/BundleDetail"
import Checkout from "./pages/public/Checkout/Checkout"
import CheckoutResponse from "./pages/public/Checkout/CheckoutResponse"
import TrackOrder from "./pages/public/TrackOrder/TrackOrder"
import Returns from "./pages/public/Returns/Returns"
import FAQ from "./pages/public/FAQ/FAQ"
import Admin from "./pages/dashboard/admin/Admin"
import Customer from "./pages/dashboard/customer/Customer"
import CreateShipping from './pages/dashboard/admin/form_response/pages/CreateShipping'
import ShippingList from './pages/dashboard/admin/form_response/pages/ListShipping'
import CategoryList from './pages/dashboard/admin/category/pages/ListCategory'
import AttributeList from './pages/dashboard/admin/attribute/pages/ListAttribute'
import AttributeValueList from './pages/dashboard/admin/attribute-value/pages/ListAttributeValue'
import BrandList from './pages/dashboard/admin/brand/page/ListBrand'
import ProductList from './pages/dashboard/admin/product/pages/ListProduct'
import ProductVariantList from './pages/dashboard/admin/product-variant/pages/ListProductVariant'
import OrderList from './pages/dashboard/admin/order/pages/OrderList'
import ShipmentList from './pages/dashboard/admin/shipment/pages/ListShipment'
import ReturnList from './pages/dashboard/admin/return/pages/ListReturn'
import ReportsPage from './pages/dashboard/admin/reports/pages/ReportsPage'
import ListUser from './pages/dashboard/admin/user/pages/ListUser'
import ListPermission from './pages/dashboard/admin/permission/pages/ListPermission'
import ListBanner from './pages/dashboard/admin/banner/page/ListBanner'
import ListDiscountCode from './pages/dashboard/admin/discount-code/page/ListDiscountCode'
import ListProductBundle from './pages/dashboard/admin/product-bundle/page/ListProductBundle'
import ListPromotion from './pages/dashboard/admin/promotion/page/ListPromotion'
import ListPurchaseGift from './pages/dashboard/admin/purchase-gift/page/ListPurchaseGift'
import ListPaymentMethod from './pages/dashboard/admin/payment-method/pages/ListPaymentMethod'
import AdminHome from './pages/dashboard/admin/home/AdminHome'
import ProtectedRoute from './components/ProtectedRoute'
import PublicLayout from './components/layouts/PublicLayout'
import ScrollToTop from './components/ScrollToTop'

function App() {
  return (
    <PermissionProvider>
      <ScrollToTop />
      <Routes>
        {/* Rutas públicas — scrollbar rosa */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/producto/:slug" element={<ProductDetail />} />
          <Route path="/combo/:slug" element={<BundleDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/respuesta" element={<CheckoutResponse />} />
          <Route path="/pedido" element={<TrackOrder />} />
          <Route path="/devoluciones" element={<Returns />} />
          <Route path="/preguntas-frecuentes" element={<FAQ />} />
        </Route>
        {/* Registro deshabilitado a propósito — se redirige a /login. No se
          elimina la ruta ni el componente por si se reactiva más adelante:
          <Route path="/register" element={<RegisterForm />} /> */}
        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/create/shipping" element={<CreateShipping />} />

        {/* Panel de administración — requiere sesión con rol admin */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <Admin />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="list/category" element={<CategoryList />} />
          <Route path="list/shipping" element={<ShippingList />} />
          <Route path="list/attibute" element={<AttributeList />} />
          <Route path="list/attibute-value" element={<AttributeValueList />} />
          <Route path="list/brand" element={<BrandList />} />
          <Route path="list/product" element={<ProductList />} />
          <Route path="list/product-variant" element={<ProductVariantList />} />
          <Route path="list/order" element={<OrderList />} />
          <Route path="list/shipment" element={<ShipmentList />} />
          <Route path="list/return" element={<ReturnList />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="list/users" element={<ListUser />} />
          <Route path="list/permissions" element={<ListPermission />} />
          <Route path="list/banner" element={<ListBanner />} />
          <Route path="list/discount-codes" element={<ListDiscountCode />} />
          <Route path="list/product-bundle" element={<ListProductBundle />} />
          <Route path="list/promotions" element={<ListPromotion />} />
          <Route path="list/purchase-gifts" element={<ListPurchaseGift />} />
          <Route path="list/payment-methods" element={<ListPaymentMethod />} />
        </Route>

        {/* Panel de cliente */}
        <Route path="/dashboard/customer" element={<Customer />} />
      </Routes>
    </PermissionProvider>
  )
}

export default App
