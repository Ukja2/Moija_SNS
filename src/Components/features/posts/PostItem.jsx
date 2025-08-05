import React, { useState } from 'react';
import { db, auth } from '../../../firebase';
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
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

function PostItem({ post }) {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const [localPost, setLocalPost] = useState(post);

  const liked = localPost.likes?.includes(user?.uid);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) return;

    const postRef = doc(db, 'posts', post.id);

    const updatedLikes = liked
      ? localPost.likes.filter(uid => uid !== user.uid)
      : [...(localPost.likes || []), user.uid];

    setLocalPost({ ...localPost, likes: updatedLikes });

    try {
      await updateDoc(postRef, {
        likes: liked ? arrayRemove(user.uid) : arrayUnion(user.uid),
      });
    } catch (err) {
      console.error('좋아요 처리 실패:', err);
    }
  };

  const handleComment = (e) => {
    e.stopPropagation();
    navigate(`/post/${post.id}`);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url)
      .then(() => alert('📋 공유 링크가 복사됐어요!'))
      .catch((err) => console.error('공유 실패:', err));
  };

  const handleCardClick = () => {
    navigate(`/post/${post.id}`);
  };

  return (
    <div className={style.card} onClick={handleCardClick}>
      {/* 프로필 영역 */}
      <div className={style.profile}>
        <FaUserCircle className={style.profileIcon} />
        <div>
          <span className={style.nickname}>{localPost.nickname}</span>
          <span className={style.location}>
            {localPost.location} · {formatTime(localPost.createdAt)}
          </span>
        </div>
      </div>

      {/* 게시물 내용 */}
      <div className={style.content}>
        {localPost.content}
        <div className={style.tags}>
          {localPost.tags?.map((tag, idx) => (
            <span key={idx}>#{tag}</span>
          ))}
        </div>
      </div>

      {/* 좋아요/댓글/공유 버튼 */}
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

      {/* 좋아요 수 */}
      <p className={style.likes}>
        이웃 {localPost.likes?.length || 0}명이 좋아합니다
      </p>

      {/* 댓글 수 */}
      <div className={style.comments}>
        댓글 {localPost.commentCount || 0}개 모두 보기
      </div>
    </div>
  );
}

export default PostItem;
