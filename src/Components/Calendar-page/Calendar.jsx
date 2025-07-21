import React, { useState } from 'react';
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
import BottomNav from '../main-page/ButtonNav/BottomNav';
import styles from './Calendar.module.css';

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const goToPrevMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const goToNextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));

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
        const isCurrentMonth = isSameMonth(day, monthStart);
        const today = isToday(day);

        days.push(
          <div
            key={day}
            className={`${styles.calendarCell} ${!isCurrentMonth ? styles.notCurrentMonth : ''} ${today ? styles.today : ''}`}
          >
            {formattedDate}
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
        <button onClick={goToPrevMonth} className={styles.navButton}></button>
        <h3 className={styles.currentMonth}>{format(currentDate, 'yyyy년 M월')}</h3>
        <button onClick={goToNextMonth} className={styles.navButton}></button>
      </div>

      <div className={styles.daysRow}>
        {days.map((day) => (
          <div key={day} className={styles.dayName}>
            {day}
          </div>
        ))}
      </div>

      {renderCells()}
      <BottomNav />
    </div>
  );
}

export default Calendar;
