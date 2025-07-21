import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Components/Login-page/Login.jsx';
import Signup from './Components/Signup-page/Signup.jsx';
import WritePost from './Components/main-page/WirtePost/WritePost.jsx';
import HomePage from './Components/main-page/HomePage/Homepage.jsx';
import DetailPost from './Components/main-page/DetailPost/DetailPost.jsx';
import Calendar from './Components/Calendar-page/Calendar.jsx';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home/write" element={<WritePost />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/post/:id" element={<DetailPost />} />
        <Route path="/home/calendar" element={<Calendar />} />
      </Routes>
    </Router>
  );
}

export default App;
