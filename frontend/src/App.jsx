
import './App.css'
import { Routes, Route } from 'react-router-dom'
import RegisterForm from './pages/auth/register/RegisterPages'
import LoginForm from './pages/auth/login/LoginPage'
import Home from "./pages/public/Home/Home"
import Admin from "./pages/dashboard/admin/Admin"
import Customer from "./pages/dashboard/customer/Customer"
import CreateShipping from './pages/dashboard/admin/form_response/pages/CreateShipping'

function App() {


  return (

    <Routes>
      <Route path="/" element={<Home />} />
      <Route path='/register' element={<RegisterForm />} />
      <Route path='/login' element={<LoginForm />} />
      <Route path='/dashboard/admin' element={<Admin />} />
      <Route path='/dashboard/customer' element={<Customer />} />
      <Route path='/create/shipping' element={<CreateShipping />} />
    </Routes>


  )
}

export default App
