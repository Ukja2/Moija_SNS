import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { db, auth } from '../../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';

import styles from './WritePost.module.css';


function WritePost() {


  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  // 로그인 안 했으면 로그인 페이지로 강제 이동
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

  const categoryList = ['잡담', '동네소식', '같이해요', '질문', '나눔'];

  const onSubmit = async (data) => {
    try {
      const docRef = doc(db, 'users', user.uid); // firebase에서 현재 사용자 UID로 문서 주소 가져오기
      const docSnap = await getDoc(docRef); // docRef로부터 실제 데이터를 할당, 서버 통신으로 비동기처리

      let location = '위치정보 없음';
      if (docSnap.exists()) {
        const userData = docSnap.data();
        location = userData.location;
      }

      await addDoc(collection(db, 'posts'), {
        title: data.title,
        content: data.content,
        category: data.category,
        location: location,
        author: user?.email || '익명',
        createdAt: serverTimestamp(),
      });

      alert('포스팅을 완료했습니다!');
    } catch (err) {
      alert('글 작성 중 오류가 발생했습니다: ' + err.message);
    }
  };


  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h2 className={styles.title}>글쓰기</h2>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <input
            type="text"
            placeholder="제목을 입력하세요"
            className={styles.input}
            {...register('title', {
              required: '제목을 입력해주세요',
            })}
          />
          {errors.title && <p className={styles.error}>{errors.title.message}</p>}

          <select
            defaultValue=""
            {...register('category', { required: '카테고리를 선택해주세요' })}
            className={styles.select}
          >
            <option value="" disabled>
              카테고리를 선택해주세요
            </option>
            {categoryList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <p className={styles.error}>{errors.category.message}</p>}

          <textarea
            placeholder="내용을 입력하세요"
            className={styles.textarea}
            {...register('content', {
              required: '내용을 입력해주세요',
            })}
          />
          {errors.content && <p className={styles.error}>{errors.content.message}</p>}

          <button type="submit" className={styles.button}>
            작성 완료
          </button>
        </form>
      </div>
    </div>
  );
}

export default WritePost;
