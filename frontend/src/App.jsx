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

/**
 * Hlavní vstupní bod aplikace (Router).
 * * Architektura routování:
 * 1. Veřejné (Public): Auth flow (Login, Register, Reset).
 * 2. Webové rozhraní: Chráněno MainLayoutem a oprávněním ACCESS_WEB_DASHBOARD.
 * - Specifické pro Odesílatele: CAN_ADD_FREIGHT (Sekce My Orders).
 * - Specifické pro Dopravce: CAN_SEE_FREIGHTS (Burza, Fleet, My Offers).
 * 3. Mobilní rozhraní: Chráněno ACCESS_DRIVER_APP (Sekce pro řidiče).
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* --- 1. VEŘEJNÉ CESTY (Bez nutnosti přihlášení) --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* --- 2. WEBOVÝ DASHBOARD (Pro dispečery a administrátory) --- */}
          <Route
            element={
              <ProtectedRoute requireUserPermission="ACCESS_WEB_DASHBOARD" />
            }
          >
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route
                element={
                  <ProtectedRoute requireCompanyPermission="CAN_ADD_FREIGHT" />
                }
              >
                <Route path="/my-orders" element={<MyFreights />} />
                <Route path="/freights/add" element={<AddFreight />} />
              </Route>
              <Route path="/my-team" element={<MyTeam />} />
              <Route
                element={
                  <ProtectedRoute requireCompanyPermission="CAN_SEE_FREIGHTS" />
                }
              >
                <Route path="/fleet" element={<Fleet />} />
                <Route path="/my-offers" element={<MyOffers />} />
                <Route path="/freights/search" element={<Freights />} />
              </Route>
            </Route>
          </Route>

          {/* --- 3. APLIKACE PRO ŘIDIČE (Izolované rozhraní) --- */}
          <Route
            element={
              <ProtectedRoute requireUserPermission="ACCESS_DRIVER_APP" />
            }
          >
            <Route path="/driver" element={<DriverApp />} />
          </Route>

          {/* --- 4. FALLBACK (404 Not Found) --- */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
                <div className="text-center">
                  <h1 className="text-6xl font-black text-blue-600">404</h1>
                  <p className="text-xl font-bold text-gray-900 mt-4">
                    Stránka nenalezena
                  </p>
                  <p className="text-gray-500 mt-2">
                    Omlouváme se, ale tato cesta v systému neexistuje.
                  </p>
                </div>
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
