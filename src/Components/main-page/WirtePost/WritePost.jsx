import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { db, auth } from '../../../firebase';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../ButtonNav/BottomNav';
import styles from './WritePost.module.css';

function WritePost() {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      alert('로그인한 사용자만 글을 작성할 수 있어요!');
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const categoryList = [
    '일상/잡담',
    '질문/궁금',
    '추천/후기',
    '도움요청',
    '나눔/교환',
    '동네소식',
    '동네장터',
  ];

  const onSubmit = async (data) => {
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      let nickname = '익명';
      let location = '위치정보 없음';

      if (docSnap.exists()) {
        const userData = docSnap.data();
        location = userData.location || '위치정보 없음';
        nickname = userData.nickname || '익명';
      }

      await addDoc(collection(db, 'posts'), {
        content: data.content,
        category: data.category,
        location,
        author: user?.email || '익명',
        nickname,
        createdAt: serverTimestamp(),
      });

      alert('포스팅을 완료했습니다!');
      navigate('/home');
    } catch (err) {
      alert('글 작성 중 오류: ' + err.message);
    }
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>게시물 작성</h2>
      <p className={styles.tip}>
        💡 이웃들과 따뜻하게 소통할 수 있는 내용을 작성해주세요. <br />
        개인정보나 부적절한 내용은 피해 주세요.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.categoryBox}>
          <p className={styles.label}>카테고리</p>
          <div className={styles.categoryOptions}>
            {categoryList.map((cat) => (
              <label key={cat} className={styles.categoryTag}>
                <input
                  type="radio"
                  value={cat}
                  {...register('category', { required: '카테고리를 선택해주세요' })}
                />
                {cat}
              </label>
            ))}
          </div>
          {errors.category && <p className={styles.error}>{errors.category.message}</p>}
        </div>

        <div className={styles.textareaBox}>
          <textarea
            placeholder="이웃들과 나누고 싶은 이야기를 자유롭게 작성해주세요!"
            className={styles.textarea}
            {...register('content', { required: '내용을 입력해주세요' })}
            maxLength={1000}
          />
          {errors.content && <p className={styles.error}>{errors.content.message}</p>}
        </div>

        <button type="submit" className={styles.button}>
          작성 완료
        </button>
      </form>
      <BottomNav />
    </div>
  );
}

export default WritePost;
