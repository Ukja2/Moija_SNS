import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { addressData } from '../../../data/addressData'; 
import { auth, db } from '../../../firebase';
import style from './Signup.module.css';

function Signup() {
    const navigate = useNavigate();
    // React Hook Form 라이브러리 폼 훅 사용
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    // 폼 제출 핸들러
    // Firebase Auth를 사용하여 사용자 등록 및 Firestore에 사용자 정보 저장
    const onSubmit = async (data) => {
        try {
            
            // Firebase Auth에 사용자 등록(인증용)
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                data.email,
                data.password
            );
            

            // Firestore에 사용자 정보 저장(데이터 저장용)
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                email: data.email,
                nickname: data.nickname,
                location: `${data.sido} ${data.sigungu}`,
                createdAt: new Date(),
            });
            

            alert('회원가입이 완료되었습니다!');
            setTimeout(() => {
                navigate('/');
            }, 300);
        } catch (error) {
            
            alert(`회원가입에 실패했습니다: ${error.message}`);
        }
    };

    // 선택된 시/도에 따라 시/군/구 옵션 동적 업데이트
    const selectedSido = watch('sido');

    return (
        <div className={style.signupPageWrapper}>



            <form onSubmit={handleSubmit(onSubmit)} className={style.signupForm}>
                <input
                    type="text"
                    placeholder="이메일 주소"
                    {...register('email', {
                        required: '이메일을 입력해주세요.',
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: '이메일 형식이 올바르지 않습니다.',
                        },
                    })}
                    className={style.inputField}
                />
                {/*왼쪽 값이 참일 때 */}
                {errors.email && <p className={style.error}>{errors.email.message}</p>}

                <input
                    type="password"
                    placeholder="비밀번호"
                    {...register('password', {
                        required: '비밀번호를 입력해주세요.',
                        minLength: {
                            value: 6,
                            message: '비밀번호는 6자 이상이어야 합니다.',
                        },
                    })}
                    className={style.inputField}
                />
                {errors.password && <p className={style.error}>{errors.password.message}</p>}

                <input
                    type="password"
                    placeholder="비밀번호 확인"
                    {...register('confirmPassword', {
                        required: '비밀번호 확인이 필요합니다.',
                        validate: (value) =>
                            value === watch('password') || '비밀번호가 일치하지 않습니다.',
                    })}
                    className={style.inputField}
                />
                {errors.confirmPassword && (
                    <p className={style.error}>{errors.confirmPassword.message}</p>
                )}

                <input
                    type="text"
                    placeholder="닉네임"
                    {...register('nickname', {
                        required: '닉네임을 입력해주세요.',
                    })}
                    className={style.inputField}
                />
                {errors.nickname && <p className={style.error}>{errors.nickname.message}</p>}

                <div className={style.locationSelect}>
                    <select
                        {...register('sido', {
                            required: '시/도를 선택해주세요.',
                        })}
                        className={style.selectBox}
                    >
                        <option value="">시/도 선택</option>
                        {Object.keys(addressData).map((region) => (
                            <option key={region} value={region}>
                                {region}
                            </option>
                        ))}
                    </select>

                    <select
                        {...register('sigungu', {
                            required: '시/군/구를 선택해주세요.',
                        })}
                        className={style.selectBox}
                        disabled={!selectedSido}
                    >
                        <option value="">시/군/구 선택</option>
                        {selectedSido &&
                            addressData[selectedSido].map((g) => (
                                <option key={g} value={g}>
                                    {g}
                                </option>
                            ))}
                    </select>
                </div>
                {(errors.sido || errors.sigungu) && (
                    <p className={style.error}>
                        {errors.sido?.message || errors.sigungu?.message}
                    </p>
                )}

                <button type="submit" className={style.submitButton}>
                    가입하기
                </button>
            </form>
        </div>
    );
}

export default Signup;
