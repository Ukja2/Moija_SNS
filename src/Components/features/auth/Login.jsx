import React, { useState, useEffect } from 'react'; // ✅ useEffect 추가
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'; // ✅ onAuthStateChanged 추가
import style from './Login.module.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 로그인 상태에서 login 페이지로 접근하면 즉시 홈으로
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/home', { replace: true });
      }
    });
    return () => unsub();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, username, password);
    } catch (error) {
      alert('아이디 또는 비밀번호가 잘못되었습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.pageWrapper}>
      <div className={style.logoWrapper}>
        <p className={style.logoSubtitle}>우리 동네, 익명으로 소통하는 공간</p>
        <h2 className={style.loginTitle}>다함께 모이자!</h2>
      </div>

      <form onSubmit={handleSubmit} className={style.loginForm}>
        <input
          type="text"
          placeholder="아이디 (이메일)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={style.inputField}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={style.inputField}
        />
        <button type="submit" className={style.submitButton} disabled={loading}>
          {loading ? '로딩 중...' : '로그인'}
        </button>
      </form>

      <div className={style.signupWrapper}>
        <p>아직 회원이 아니신가요?</p>
        <button
          type="button"
          className={style.signupButton}
          onClick={() => navigate('/signup')}
        >
          회원가입
        </button>
      </div>
    </div>
  );
}

export default Login;
