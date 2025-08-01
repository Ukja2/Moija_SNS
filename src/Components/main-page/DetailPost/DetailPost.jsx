import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../../../firebase';
import {
    doc,
    getDoc,
    collection,
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    getDocs,
    deleteDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    increment
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FaUserCircle, FaPaperPlane, FaHeart, FaShare, FaTrashAlt } from 'react-icons/fa';
import styles from './DetailPost.module.css';

function formatTime(createdAt) {
    if (!createdAt) return '';
    const now = new Date();
    const postDate = createdAt.toDate();
    const diffMs = now - postDate;
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;
    if (diffDay < 7) return `${diffDay}일 전`;

    const yy = String(postDate.getFullYear()).slice(2);
    const mm = String(postDate.getMonth() + 1).padStart(2, '0');
    const dd = String(postDate.getDate()).padStart(2, '0');
    return `${yy}.${mm}.${dd}`;
}

function DetailPost() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user] = useAuthState(auth);
    const [post, setPost] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [focusedInput, setFocusedInput] = useState(false);
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const postRef = doc(db, 'posts', id);
                const postSnap = await getDoc(postRef);
                if (postSnap.exists()) {
                    const postData = { id: postSnap.id, ...postSnap.data() };
                    setPost(postData);
                    setLiked(postData.likes?.includes(user?.uid));
                }
            } catch (error) {
                console.error('게시글 불러오기 실패:', error);
            }
        };
        fetchPost();
    }, [id, user]);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const q = query(collection(db, 'posts', id, 'comments'), orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(q);
                const fetched = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setComments(fetched);
            } catch (error) {
                console.error('댓글 불러오기 실패:', error);
            }
        };
        fetchComments();
    }, [id]);

    const handleDeletePost = async () => {
        if (!window.confirm('정말 이 게시글을 삭제할까요?')) return;
        try {
            await deleteDoc(doc(db, 'posts', id));
            alert('게시글이 삭제되었습니다.');
            navigate('/home');
        } catch (error) {
            console.error('게시글 삭제 실패:', error);
        }
    };

    const handleAddComment = async () => {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const nickname = userSnap.exists() ? userSnap.data().nickname : '익명';

        if (!user || commentText.trim() === '' || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const commentRef = collection(db, 'posts', id, 'comments');
            const postRef = doc(db, 'posts', id);

            await addDoc(commentRef, {
                text: commentText.trim(),
                createdAt: serverTimestamp(),
                uid: user.uid,
                nickname
            });

            await updateDoc(postRef, {
                commentCount: increment(1),
            });

            setCommentText('');

            const snapshot = await getDocs(query(commentRef, orderBy('createdAt', 'desc')));
            const updated = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setComments(updated);
        } catch (error) {
            console.error('댓글 추가 실패:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const postRef = doc(db, 'posts', id);
            await deleteDoc(doc(db, 'posts', id, 'comments', commentId));
            await updateDoc(postRef, {
                commentCount: increment(-1),
            });
            setComments((prev) => prev.filter((c) => c.id !== commentId));
        } catch (error) {
            console.error('댓글 삭제 실패:', error);
        }
    };

    const toggleLike = async () => {
        if (!user) return;
        const postRef = doc(db, 'posts', id);
        try {
            await updateDoc(postRef, {
                likes: liked ? arrayRemove(user.uid) : arrayUnion(user.uid),
            });
            setLiked(!liked);
            setPost((prev) => ({
                ...prev,
                likes: liked
                    ? prev.likes?.filter((uid) => uid !== user.uid)
                    : [...(prev.likes || []), user.uid],
            }));
        } catch (error) {
            console.error('좋아요 처리 실패:', error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddComment();
        }
    };

    if (!post) {
        return (
            <div className={styles.loadingWrapper}>
                <div className={styles.loadingSpinner}></div>
                <p className={styles.loadingText}>게시글 불러오는 중...</p>
            </div>
        );
    }

    return (
        <>
            <div className={styles.postContentArea}>
                <div className={styles.headerRow}>
                    <FaUserCircle className={styles.avatarIcon} />
                    <div>
                        <div className={styles.nickname}>{post.nickname}</div>
                        <div className={styles.timestamp}>{formatTime(post.createdAt)}</div>
                    </div>
                    {user?.uid === post.uid && ( // 게시글 작성자만 삭제 버튼 보이기
                        <button onClick={handleDeletePost} className={styles.deleteBtn}>
                            <FaTrashAlt /> 삭제
                        </button>
                    )}
                </div>

                <p className={styles.postContent}>{post.content}</p>

                <div className={styles.interactionRow}>
                    <div className={styles.iconBtn} onClick={toggleLike}>
                        <FaHeart color={liked ? '#ff4c4c' : '#ccc'} />
                        <span style={{ marginLeft: 8 }}>{post.likes?.length || 0}</span>
                    </div>
                    <div className={styles.iconBtn}><FaShare /></div>
                </div>
            </div>

            <div className={styles.commentSection}>
                <h3 className={styles.commentTitle}>댓글 {comments.length}</h3>

                <div className={`${styles.commentInput} ${focusedInput ? styles.focused : ''}`}>
                    <FaUserCircle className={styles.commentAvatar} />
                    <textarea
                        value={commentText}
                        placeholder="댓글을 남겨보세요..."
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onFocus={() => setFocusedInput(true)}
                        onBlur={() => setFocusedInput(false)}
                        className={styles.textarea}
                        rows={1}
                        disabled={!user}
                    />
                    <button
                        onClick={handleAddComment}
                        disabled={!user || commentText.trim() === '' || isSubmitting}
                        className={styles.sendButton}
                    >
                        {isSubmitting ? '...' : <FaPaperPlane />}
                    </button>
                </div>

                <div className={styles.commentsList}>
                    {comments.length === 0 ? (
                        <p className={styles.noComments}>첫 댓글을 남겨보세요!</p>
                    ) : (
                        comments.map((comment) => (
                            <div className={styles.commentItem}>
                                <FaUserCircle className={styles.commentAvatar} />
                                <div style={{ flex: 1 }}>
                                    <div className={styles.commentHeader}>
                                        <div className={styles.commentNickname}>{comment.nickname}</div>
                                        {user?.uid === comment.uid && (
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => handleDeleteComment(comment.id)}
                                            >
                                                <FaTrashAlt />
                                            </button>
                                        )}
                                    </div>
                                    <div className={styles.commentTime}>{formatTime(comment.createdAt)}</div>
                                    <div className={styles.commentText}>{comment.text}</div>
                                </div>
                            </div>


                        ))
                    )}
                </div>
            </div>
        </>
    );
}

export default DetailPost;
