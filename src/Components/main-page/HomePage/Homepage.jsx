import React from 'react';
import PostList from '../PostList/PostList'; 
import BottomNav from '../ButtonNav/BottomNav'; 

function HomePage() {
  return (
    <div>
      <PostList />
      <BottomNav />
    </div>
  );
}

export default HomePage;
