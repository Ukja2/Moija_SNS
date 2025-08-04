import React, { useEffect, useState, useCallback, useRef } from 'react';
import { db, auth } from '../../../firebase.js';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  doc,
  getDoc,
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import PostItem from './PostItem.jsx';
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
  const [userLocation, setUserLocation] = useState('');
  const [lastDoc, setLastDoc] = useState(null);
  const loaderRef = useRef(null);

  // 사용자 위치 우선 로딩
  useEffect(() => {
    if (!user) return;
    const fetchLocation = async () => {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const loc = userSnap.data().location;
        setUserLocation(loc);
      }
    };
    fetchLocation();
  }, [user]);

  // 첫 게시물 출력
  useEffect(() => {
    if (!userLocation) return;

    const fetchPosts = async () => {
      try {
        const q = query(
          collection(db, 'posts'),
          where('location', '==', userLocation),
          orderBy('createdAt', 'desc'),
          limit(3)
        );

        const snapshot = await getDocs(q);
        const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setAllPosts(posts);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      } catch (err) {
        console.error('게시물 불러오기 실패:', err.message);
      }
    };

    fetchPosts();
  }, [userLocation]);

  // 추가 게시물 출력
  const loadMore = useCallback(async () => {
    if (!lastDoc || !userLocation) {
      return;
    }

    try {
      const q = query(
        collection(db, 'posts'),
        where('location', '==', userLocation),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(3)
      );

      const snapshot = await getDocs(q);
      const nextPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setAllPosts(prev => {
        const merged = [...prev, ...nextPosts];
        const unique = merged.filter(
          (post, index, self) => index === self.findIndex(p => p.id === post.id)
        );
        return unique;
      });

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
    } catch (err) {
      console.error('추가 게시물 불러오기 실패:', err.message);
    }
  }, [lastDoc, userLocation]);

  // 스크롤 옵저버 설정
  useEffect(() => {
    if (!userLocation) return; 

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [loadMore, userLocation]);

  // 카테고리 필터링
  const filteredPosts =
    selectedCategory === '전체'
      ? allPosts
      : allPosts.filter(post => post.category === selectedCategory);

  return (
    <div className={style.feedWrapper}>
      <div className={style.locationText}>
        현재 나의 위치는? <strong>{userLocation}</strong> !
      </div>

      <div className={style.categoryBar}>
        {categoryList.map(cat => (
          <button
            key={cat}
            className={`${style.categoryBtn} ${selectedCategory === cat ? style.active : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredPosts.length === 0 ? (
        <p className={style.emptyText}>게시글이 없어요!</p>
      ) : (
        filteredPosts.map(post => (
          <PostItem key={post.id} post={post} />
        ))
      )}

      <div ref={loaderRef}></div>
    </div>
  );
}

export default PostList;
