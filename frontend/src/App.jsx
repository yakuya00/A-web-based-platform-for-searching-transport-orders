import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import Freights from '@/pages/Freights';
import AddFreight from '@/pages/AddFreight';
import './App.css';
import Register from './pages/Register';
import MainLayout from '@/layouts/MainLayout';
import MyFreights from './pages/MyFreights';
import MyTeam from './pages/MyTeam';
import Fleet from './pages/Fleet';
import MyOffers from './pages/MyOffers';
import DriverApp from './pages/driver/DriverApp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Главная страница */}
          {/* <Route path="/" element={<Home />} /> */}

          {/* Страница логина */}
          <Route path="/login" element={<Login />} />

          <Route path="/registration" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* 2. Защищенные маршруты (доступны только после входа) */}
          <Route
            element={
              <ProtectedRoute requireUserPermission="ACCESS_WEB_DASHBOARD" />
            }
          >
            <Route element={<MainLayout />}>
              {/* Сюда кладем всё, что нужно спрятать */}
              <Route path="/" element={<Home />} />
              <Route path="/freights/search" element={<Freights />} />
              <Route path="/freights/add" element={<AddFreight />} />
              <Route path="/my-orders" element={<MyFreights />} />
              <Route path="/my-team" element={<MyTeam />} />
              <Route path="/fleet" element={<Fleet />} />
              <Route path="/my-offers" element={<MyOffers />} />
              {/* Потом добавишь сюда <Route path="/orders" ... /> */}
              {/* <Route path="/chat" ... /> */}
            </Route>
          </Route>
          <Route
            element={
              <ProtectedRoute requireUserPermission="ACCESS_DRIVER_APP" />
            }
          >
            <Route path="/driver" element={<DriverApp />} />
          </Route>

          {/* Можно добавить 404 */}
          <Route path="*" element={<div>Страница не найдена</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
