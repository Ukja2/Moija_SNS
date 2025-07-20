import React, { useEffect, useState, useCallback } from 'react';
import { db, auth } from '../../../firebase';
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import PostItem from '../PostItem/PostItem.jsx';
import style from './PostList.module.css';

const categoryList = [
  '전체',
  '일상/잡담',
  '질문/궁금',
  '추천/후기',
  '도움요청',
  '나눔/교환',
  '동네소식',
  '동네장터',
];

function PostList() {
  const [user] = useAuthState(auth);
  const [allPosts, setAllPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('전체');

  // 게시물 불러오기
  const fetchPosts = useCallback(async () => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const location = userSnap.data().location;
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        const filtered = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((post) => post.location === location);

        setAllPosts(filtered);
      } else {
        console.log('사용자 데이터가 없습니다.');
      }
    } catch (err) {
      console.error('게시물 불러오기 실패:', err.message);
    }
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // 선택된 카테고리에 따라 필터링
  const filteredPosts =
    selectedCategory === '전체'
      ? allPosts
      : allPosts.filter((post) => post.category === selectedCategory);

  return (
    <div className={style.feedWrapper}>
      {/* 🔹 카테고리 선택 바 */}
      <div className={style.categoryBar}>
        {categoryList.map((cat) => (
          <button
            key={cat}
            className={`${style.categoryBtn} ${
              selectedCategory === cat ? style.active : ''
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 🔹 게시글 목록 */}
      {filteredPosts.length === 0 ? (
        <p className={style.emptyText}>게시글이 없어요!</p>
      ) : (
        filteredPosts.map((post) => (
          <PostItem key={post.id} post={post} refetch={fetchPosts} />
        ))
      )}
    </div>
  );
}

export default PostList;
