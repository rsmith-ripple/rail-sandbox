import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import CustomerList from './pages/CustomerList';
import CustomerDetail from './pages/CustomerDetail';
import AccountDetail from './pages/AccountDetail';
import OnRamp from './pages/OnRamp';
import OffRamp from './pages/OffRamp';

export default function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/accounts/:id" element={<AccountDetail />} />
          <Route path="/on-ramp" element={<OnRamp />} />
          <Route path="/off-ramp" element={<OffRamp />} />
        </Routes>
      </main>
    </div>
  );
}
