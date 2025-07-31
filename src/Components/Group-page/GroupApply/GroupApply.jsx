import React from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { AiOutlineArrowLeft } from 'react-icons/ai'; 
import styles from './GroupApply.module.css';

function GroupApply() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    if (!user) return alert('로그인이 필요합니다!');
    
    try {
      await addDoc(collection(db, 'applications'), {
        groupId,
        userId: user.uid,
        ...data,
        createdAt: serverTimestamp(),
      });
      alert('신청이 완료되었어요!');
      navigate('/home/group');
    } catch (err) {
      console.error('신청 실패:', err.message);
    }
  };

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        <AiOutlineArrowLeft size={24} />
      </button>

      <h2 className={styles.title}>
        자신을 <strong className={styles.userIntro}>소개</strong>해주세요!
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <label>
          <input
            type="text"
            {...register('intro', { required: '자기소개는 필수에요!' })}
            className={styles.input}
          />
          {errors.intro && <p className={styles.error}>{errors.intro.message}</p>}
        </label>

        <button type="submit" className={styles.submitBtn}>신청하기</button>
      </form>
    </div>
  );
}

export default GroupApply;
