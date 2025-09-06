import { Routes, Route } from 'react-router-dom'
import './App.css'
import AshesLanding from './components/AshesLanding/AshesLanding'
import { AuthProvider } from './components/contexts/userContext'
import Footer from './components/Footer/Footer'
import { AdminGuard } from './components/Guards/AdminGuard'
import SySAdminLogin from './components/SySAdminLogin/SySAdminLogin'
import SySAdminRegister from './components/SySAdminRegister/SySAdminRegister'
import SySAdminCp from './components/SySAdminCp/SySAdminCp'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<AshesLanding />} />

        <Route path="/login-admin-sys" element={<SySAdminLogin />} />
        <Route path="/register-admin-sys" element={<SySAdminRegister />} />
        {/* <Route path="unauthorized" element={<Unauthorized />} /> */}
        {/* <Route path="404/*" element={<NotFound />} />
        <Route path="*" element={<NotFound />} /> */}
         <Route path="sys-panel" element={<SySAdminCp />} />
      </Routes>

      <Footer />

    </AuthProvider>
  )
}

export default App