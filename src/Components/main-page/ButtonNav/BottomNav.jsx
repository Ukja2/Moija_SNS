import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AiFillHome, AiOutlinePlusCircle } from 'react-icons/ai';
import { MdGroups } from 'react-icons/md';
import { RiCalendarLine } from 'react-icons/ri';
import { CgProfile } from 'react-icons/cg';
import styles from './BottomNav.module.css';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: <AiFillHome />, path: '/home', label: '홈' },
    { icon: <MdGroups />, path: '/home/group', label: '모임' },
    { icon: <AiOutlinePlusCircle />, path: '/home/write', label: '글쓰기' },
    { icon: <RiCalendarLine />, path: '/home/calendar', label: '캘린더' },
    { icon: <CgProfile />, path: '/home/profile', label: '프로필' },
  ];

  return (
    <nav className={styles.navbar}>
      {menuItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`${styles.navItem} ${
            location.pathname === item.path ? styles.active : ''
          }`}
        >
          {item.icon}
        </button>
      ))}
    </nav>
  );
}

export default BottomNav;
