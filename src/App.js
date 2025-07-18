import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Components/Login-page/Login.jsx';
import Signup from './Components/Signup-page/Signup.jsx';
import WritePost from './Components/main-page/WirtePost/WritePost.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/Write" element={<WritePost />} />
      </Routes>
    </Router>
  );
}

export default App;
