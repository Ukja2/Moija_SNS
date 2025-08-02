import React, { useState, useEffect } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isToday,
} from 'date-fns';
import { db } from '../../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import BottomNav from '../common/BottomNav';
import styles from './Calendar.module.css';

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date()); // 현재 보고 있는 달
  const [groupMap, setGroupMap] = useState({});               // 날짜별 모임 정보
  const [selectedDate, setSelectedDate] = useState(null);     // 클릭한 날짜

  useEffect(() => {
    const fetchGroups = async () => {
      const snapshot = await getDocs(collection(db, 'groups'));
      const map = {}; // 날짜별로 데이터 정리할 객체

      snapshot.forEach((doc) => {
        const group = doc.data();      
        const dateKey = group.date;    // 날짜 키 

        // 날짜가 처음 나오면 배열 만들기
        if (!map[dateKey]) {
          map[dateKey] = [];
        }

        map[dateKey].push(group); // 해당 날짜에 모임 추가
      });

      setGroupMap(map);
    };

    fetchGroups();
  }, []);

  // 달력 셀 렌더링
  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd');
        const fullDate = format(day, 'yyyy-MM-dd');

        const isCurrentMonth = isSameMonth(day, monthStart);
        const today = isToday(day);
        const hasEvent = groupMap[fullDate]?.length > 0;

        days.push(
          <div
            key={fullDate}
            className={`${styles.calendarCell} 
                        ${!isCurrentMonth ? styles.notCurrentMonth : ''} 
                        ${today ? styles.today : ''} 
                        ${hasEvent ? styles.hasEvent : ''}`}
            onClick={() => setSelectedDate(fullDate)} // 클릭 시 날짜 선택
          >
            <div className={styles.dateNumber}>{formattedDate}</div>
          </div>
        );

        day = addDays(day, 1);
      }

      rows.push(
        <div key={day} className={styles.calendarRow}>
          {days}
        </div>
      );
      days = [];
    }

    return <div>{rows}</div>;
  };

  const days = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className={styles.calendarWrapper}>
      <div className={styles.calendarHeader}>
        {/* 이전 달 버튼 */}
        <button
          className={styles.navButton}
          onClick={() => setCurrentDate(prev => subMonths(prev, 1))}
        ></button>

        <h3 className={styles.currentMonth}>
          {format(currentDate, 'yyyy년 M월')}
        </h3>

        {/* 다음 달 버튼 */}
        <button
          className={styles.navButton}
          onClick={() => setCurrentDate(prev => addMonths(prev, 1))}
        ></button>
      </div>

      {/* 요일 표시 */}
      <div className={styles.daysRow}>
        {days.map(day => (
          <div key={day} className={styles.dayName}>{day}</div>
        ))}
      </div>

      {/* 달력 렌더링 */}
      {renderCells()}

      {/* 날짜 클릭 시 모임 정보 표시 */}
      {selectedDate && (
        <div className={styles.selectedInfo}>
          <h4>{selectedDate} 모임 </h4>
          {(groupMap[selectedDate] || []).length > 0 ? (
            <div className={styles.groupList}>
              {(groupMap[selectedDate] || []).map((group, index) => (
                <div key={index} className={styles.groupItem}>
                  <p><strong>장소:</strong> {group.meetingplace || "정보 없음"}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>이날은 모임이 없어요..</p>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
}

export default Calendar;
