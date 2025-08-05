import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '../../../firebase';
import { FaUserCircle, FaHeart } from 'react-icons/fa';
import { FiMessageCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import styles from './Myposts.module.css';

import { FiArrowLeft } from 'react-icons/fi';

function Myposts() {
    const [posts, setPosts] = useState([]);
    const [user] = useAuthState(auth);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyPosts = async () => {
            if (!user) return;

            try {
                const q = query(
                    collection(db, 'posts'),
                    where('uid', '==', user.uid),
                    orderBy('createdAt', 'desc')
                );

                const querySnapshot = await getDocs(q);
                const myPosts = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setPosts(myPosts);
            } catch (error) {
                console.error('내 게시글 불러오기 실패:', error);
            }
        };

        fetchMyPosts();
    }, [user]);

    function formatTime(createdAt) {
        if (!createdAt) return '';
        const now = new Date();
        const postDate = createdAt.toDate();

        const diffMs = now - postDate;
        const diffMin = Math.floor(diffMs / (1000 * 60));
        const diffHour = Math.floor(diffMin / 60);

        if (diffMin < 1) return '방금 전';
        if (diffMin < 60) return `${diffMin}분 전`;
        if (diffHour < 24) return `${diffHour}시간 전`;

        const yy = String(postDate.getFullYear()).slice(2);
        const mm = String(postDate.getMonth() + 1).padStart(2, '0');
        const dd = String(postDate.getDate()).padStart(2, '0');
        return `${yy}.${mm}.${dd}`;
    }

    const handleBack = () => {
        navigate(-1);
    };


    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.backButton} onClick={handleBack}>
                    <FiArrowLeft className={styles.backIcon} />
                    <span className={styles.backText}>내가 작성한 게시물</span>
                </div>
            </div>
            
            {posts.length > 0 ? (
                posts.map((post) => (
                    <div key={post.id} className={styles.card} onClick={() => navigate(`/post/${post.id}`)} >
                        <div className={styles.profile}>
                            <FaUserCircle className={styles.profileIcon} />
                            <div>
                                <span className={styles.nickname}>{post.nickname || '익명'}</span>
                                <span className={styles.location}>{post.location} · {formatTime(post.createdAt)}</span>
                            </div>
                        </div>

                        <div className={styles.content}>{post.content}</div>

                        <div className={styles.actions}>
                            <span className={styles.iconText}>
                                <FaHeart className={styles.heartIcon} /> {post.likes?.length || 0}
                            </span>
                            <span className={styles.iconText}>
                                <FiMessageCircle className={styles.commentIcon} /> {post.commentCount || 0}
                            </span>
                        </div>
                    </div>
                ))
            ) : (
                <p className={styles.empty}>작성한 게시물이 없습니다.</p>
            )}
        </div>
    );
}

export default Myposts;
