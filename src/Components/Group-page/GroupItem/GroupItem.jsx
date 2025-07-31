import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserFriends } from 'react-icons/fa';
import style from './GroupItem.module.css';


function GroupItem({ group, user }) {
  const navigate = useNavigate();

  const isJoined = group.members?.includes(user?.uid);
  const isCreator = group.creatorId === user?.uid;

  const handleApplyClick = () => {
    navigate(`/home/group/apply/${group.id}`);
  };

  return (
    <div className={style.card}>
      <h3 className={style.title}>{group.title}</h3>
      <p className={style.description}>{group.description}</p>
      <p className={style.date}>일정: {group.date} | 장소: {group.meetingplace} </p>
      <p className={style.members}>
        <FaUserFriends className={style.icon} /> {group.members?.length || 0}명 참여중
      </p>



      {isJoined || isCreator ? (
        <button className={style.joinedBtn}>
          참여중
        </button>



      ) : (
        <button className={style.applyBtn} onClick={handleApplyClick}>신청하기</button>
      )}
    </div>
  );
}

export default GroupItem;
