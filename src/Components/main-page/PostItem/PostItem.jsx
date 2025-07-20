import React from 'react';
import { db, auth } from '../../../firebase';
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import style from './PostItem.module.css';

import { FaUserCircle, FaHeart } from 'react-icons/fa';
import { FiHeart, FiMessageCircle, FiSend } from 'react-icons/fi';

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

function PostItem({ post, refetch }) {
  const [user] = useAuthState(auth);
  const liked = post.likes?.includes(user?.uid);

  const handleLike = async () => {
    if (!user) return;
    const postRef = doc(db, 'posts', post.id);
    try {
      await updateDoc(postRef, {
        likes: liked ? arrayRemove(user.uid) : arrayUnion(user.uid),
      });
      if (refetch) refetch();
    } catch (err) {
      console.error('좋아요 처리 실패:', err);
    }
  };

  const handleComment = () => {
    window.location.href = `/post/${post.id}`;
  };

  const handleShare = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url)
      .then(() => alert('📋 공유 링크가 복사됐어요!'))
      .catch((err) => console.error('공유 실패:', err));
  };

  return (
    <div className={style.card}>
      {/* 프로필 영역 */}
      <div className={style.profile}>
        <FaUserCircle className={style.profileIcon} />
        <div>
          <span className={style.nickname}>{post.nickname}</span>
          <span className={style.location}>
            {post.location} · {formatTime(post.createdAt)}
          </span>
        </div>
      </div>

      {/* 내용 */}
      <div className={style.content}>
        {post.content}
        <div className={style.tags}>
          {post.tags?.map((tag, idx) => (
            <span key={idx}>#{tag}</span>
          ))}
        </div>
      </div>

      {/* 좋아요, 댓글, 공유 */}
      <div className={style.actions}>
        <button onClick={handleLike}>
          {liked ? (
            <FaHeart className={`${style.heartIcon} ${style.icon}`} />
          ) : (
            <FiHeart className={`${style.heartIcon} ${style.outline} ${style.icon}`} />
          )}
        </button>
        <button onClick={handleComment}>
          <FiMessageCircle className={style.icon} />
        </button>
        <button onClick={handleShare}>
          <FiSend className={style.icon} />
        </button>
      </div>

      <p className={style.likes}>이웃 {post.likes?.length || 0}명이 좋아합니다</p>

      <div className={style.comments}>
        댓글 {post.commentCount || 0}개 모두 보기
      </div>
    </div>
  );
}

export default PostItem;
