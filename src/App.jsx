import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ScrollToHash from './components/ScrollToHash'
import HomePage from './pages/HomePage'
import PfpPage from './pages/PfpPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-svh bg-black text-zinc-100">
        <ScrollToHash />
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pfp" element={<PfpPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
