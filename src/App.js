import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Components/features/auth/Login';
import Signup from './Components/features/auth/Signup';
import HomePage from './Components/features/common/Homepage';
import DetailPost from './Components/features/posts/DetailPost';
import WritePost from './Components/features/posts/WritePost';
import Calendar from './Components/features/calendar/Calendar';
import GroupPage from './Components/features/common/GroupPage';
import GroupApply from './Components/features/groups/GroupApply';
import CreateGroup from './Components/features/groups/CreateGroup';
import Profile from './Components/features/profile/Profile';
import NotificationPage from './Components/features/notifications/NotificationPage';
import MyPosts from './Components/features/posts/Myposts';
import MyGroups from './Components/features/groups/Mygroups';

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
        <Route path="/home/group" element={<GroupPage />} />
        <Route path="/home/group/apply/:groupId" element={<GroupApply />} />
        <Route path="/home/group/create" element={<CreateGroup />} />
        <Route path="/home/profile" element={<Profile />} />
        <Route path="/home/profile/notifications" element={<NotificationPage />} />
        <Route path="/home/profile/myposts" element={<MyPosts />} />
        <Route path="/home/profile/mygroups" element={<MyGroups />} />
      </Routes>
    </Router>
  );
}

export default App;
