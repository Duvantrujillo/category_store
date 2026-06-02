
import './App.css'
import { Routes, Route } from 'react-router-dom'
import RegisterForm from './pages/auth/register/RegisterPages'
import LoginForm from './pages/auth/login/LoginPage'
import Home from "./pages/public/Home/Home"
import Admin from "./pages/dashboard/admin/Admin"
import Customer from "./pages/dashboard/customer/Customer"
import CreateShipping from './pages/dashboard/admin/form_response/pages/CreateShipping'
import ShippingList from './pages/dashboard/admin/form_response/pages/ListShipping'
import CategoryList from './pages/dashboard/admin/category/pages/ListCategory'
import AttributeList from './pages/dashboard/admin/attribute/pages/ListAttribute'
import AttributeValueList from './pages/dashboard/admin/attribute-value/pages/ListAttributeValue'
import BrandList from './pages/dashboard/admin/brand/page/ListBrand'
import ProductList from './pages/dashboard/admin/product/pages/ListProduct'

function App() {


  return (

    <Routes>
      <Route path="/" element={<Home />} />
      <Route path='/register' element={<RegisterForm />} />
      <Route path='/login' element={<LoginForm />} />

      
      <Route path="/dashboard/admin" element={<Admin />}>
        <Route path="list/category" element={<CategoryList />} />
        <Route path="list/shipping" element={<ShippingList />} />
        <Route path="list/attibute" element={<AttributeList />} />
        <Route path="list/attibute-value" element={<AttributeValueList />} />
        <Route path="list/brand" element={<BrandList />} />
        <Route path="list/product" element={<ProductList />} />

      </Route>



      <Route path='/dashboard/customer' element={<Customer />} />
      <Route path='/create/shipping' element={<CreateShipping />} />
    </Routes>


  )
}

export default App
