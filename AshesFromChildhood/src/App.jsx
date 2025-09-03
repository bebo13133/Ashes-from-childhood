import { Routes, Route } from 'react-router-dom'
import './App.css'
import AshesLanding from './components/AshesLanding/AshesLanding'
import { AuthProvider } from './components/contexts/userContext'

function App() {
  return (
   <AuthProvider>
      <Routes>
        <Route path="/" element={<AshesLanding />} />
      </Routes>
    </AuthProvider>
  )
}

export default App