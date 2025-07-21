import React from 'react';
import { useForm } from 'react-hook-form';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import style from './CreateGroup.module.css';

function CreateGroup() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [user] = useAuthState(auth);

    const onSubmit = async (data) => {
        if (!user) {
            alert('로그인이 필요해요!');
            return;
        }

        try {
            await addDoc(collection(db, 'groups'), {
                ...data,
                creatorId: user.uid,
                members: [user.uid],
                createdAt: serverTimestamp(),
            });
            alert('모임이 성공적으로 생성됐어요!');
        } catch (error) {
            console.error('모임 생성 실패:', error);
        }
    };

    return (
        <div className={style.formContainer}>
            <h2 className={style.subHeading}>우리만의 모임을 시작해볼까요?</h2>
            <h2 className={style.mainHeading}>모임 만들기</h2>

            <form onSubmit={handleSubmit(onSubmit)} className={style.form}>
                <input
                    {...register('title', { required: true })}
                    placeholder="모임 제목"
                    className={style.input}
                />
                {errors.title && <p className={style.error}>제목은 필수에요</p>}

                <textarea
                    {...register('description', { required: true })}
                    placeholder="모임 설명"
                    className={style.textarea}
                />
                {errors.description && <p className={style.error}>설명도 필수에요</p>}

                <input
                    type="number"
                    {...register('maxMembers', {
                        required: true,
                        min: 2,
                    })}
                    placeholder="최대 인원 수"
                    className={style.input}
                />
                {errors.maxMembers && (
                    <p className={style.error}>2명 이상 입력해주세요</p>
                )}

                <button type="submit" className={style.button}>
                    모임 생성
                </button>
            </form>
        </div>
    );
}

export default CreateGroup;
