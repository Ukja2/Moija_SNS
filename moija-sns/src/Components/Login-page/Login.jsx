// src/components/Login-page/Login.jsx
import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import './Login.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // 로딩 상태 관리

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // 로그인 시작, 로딩 상태 활성화

        const auth = getAuth(); // Firebase 인증 객체


        try {
            // Firebase Authentication을 사용한 로그인
            const userCredential = await signInWithEmailAndPassword(auth, username, password);
            const user = userCredential.user; // 로그인한 사용자 정보
            console.log("로그인 성공:", user);

            // 로그인 성공 후 홈화면 이동 처리 코드 작성해야됨

        } catch (error) {

            alert("아이디 또는 비밀번호가 잘못되었습니다.");
        } finally {
            setLoading(false); // 로그인 후 로딩 상태 종료
        }

    };

    return (
        <div>
            <h2>다함께 모이자!</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="아이디"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">로그인</button>
                <div>
                    <p>아직 회원이 아니신가요?</p>
                    <button>회원가입</button>
                </div>
            </form>


        </div>
    );
}

export default Login;
