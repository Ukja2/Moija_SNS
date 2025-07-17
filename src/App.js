import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Components/Login-page/Login.jsx';
import Signup from './Components/Signup-page/Signup.jsx';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
