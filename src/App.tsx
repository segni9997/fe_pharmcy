
import { Route, Routes } from 'react-router-dom'
import HomePage from './home'
import { Dashboard } from './components/dashboard'
import { ProtectedRoute } from './components/ProtectedRoute';

import { MedicineManagement } from './components/medicine-management';
import { POSSystem } from './components/pos-system';
import { UserManagement } from './components/user-management';

function App() {

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pos" element={<POSSystem />} />
        <Route path="/medicines" element={<MedicineManagement />} />
        <Route path="/users" element={<UserManagement />} />
      </Route>
    </Routes>
  );
}

export default App
