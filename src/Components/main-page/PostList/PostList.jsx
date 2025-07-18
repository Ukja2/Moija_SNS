import React, { useEffect, useState } from 'react';
import { db, auth } from '../../../firebase';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

function PostList() {
    const [user] = useAuthState(auth);
    const [userLocation, setUserLocation] = useState('');
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchUserLocationAndPosts = async () => {
            if (!user) return;

            try {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const location = userSnap.data().location;
                    setUserLocation(location);

                    // posts에서 location이 같은 글만 출력
                    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
                    const snapshot = await getDocs(q);

                    const filteredPosts = snapshot.docs
                        // 문서 데이터와 문서 ID가 분리되어 있기 때문에 매핑처리
                        .map((doc) => ({ id: doc.id, ...doc.data() }))
                        .filter((post) => post.location === location); // ← 같은 동네만 필터링

                    setPosts(filteredPosts);
                } else {
                    console.log('사용자 문서가 없습니다');
                }
            } catch (err) {
                console.error('게시물 불러오기 실패:', err.message);
            }
        };

        fetchUserLocationAndPosts();
    }, [user]);

    return (
        <div>
            <h2> 🏠 우리동네 동네 게시글 ({userLocation})</h2>
            {posts.length === 0 ? (
                <p>게시글이 없어요!</p>
            ) : (
                posts.map((post) => (
                    <div key={post.id} style={{ border: '1px solid #ddd', margin: '20px', padding: '10px' }}>
                        <h3>{post.title}</h3>
                        <p>카테고리: {post.category}</p>
                        <p>{post.content}</p>
                        <small>작성자: {post.nickname}</small>
                    </div>
                ))
            )}
        </div>
    );
}

export default PostList;
