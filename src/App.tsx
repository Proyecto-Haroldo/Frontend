import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Services from './pages/Services';
import Schedule from './pages/Schedule';
import Diagnostics from './pages/Diagnostics';
import Account from './pages/Account';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-warm-white flex flex-col md:flex-row font-geist">
        <Navbar />
        <main className="flex-1 p-4 md:p-8 md:ml-64 pt-20 md:pt-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/diagnostics" element={<Diagnostics />} />
            <Route path="/account" element={<Account />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;