import React from 'react';
import { useForm } from 'react-hook-form';
import { db, auth } from '../../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import styles from './WritePost.module.css';

function WritePost() {
  const [user] = useAuthState(auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const categoryList = ['잡담', '동네소식', '같이해요', '질문', '나눔'];

  const onSubmit = async (data) => {
    try {
      await addDoc(collection(db, 'posts'), {
        title: data.title,
        content: data.content,
        category: data.category,
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
