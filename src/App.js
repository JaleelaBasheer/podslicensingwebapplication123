import './App.css';
import Dashboard from './components/Dashboard';
import { Route, Routes, useNavigate } from 'react-router-dom';
import LoginPage from './components/Login';

function App() {
  return (
    <div>
      <Routes>
        <Route  path="/" element={<Dashboard/>} />
      </Routes>
    </div>
  );
}

export default App;
