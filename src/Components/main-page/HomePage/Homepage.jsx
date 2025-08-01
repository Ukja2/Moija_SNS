import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../firebase';
import { Navigate } from 'react-router-dom';
import PostList from '../PostList/PostList'; 
import BottomNav from '../ButtonNav/BottomNav'; 

function HomePage() {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div>로딩 중...</div>;
  if (!user) return <Navigate to="/" replace />; 

  return (
    <div>
      <PostList />
      <BottomNav />
    </div>
  );
}

export default HomePage;
