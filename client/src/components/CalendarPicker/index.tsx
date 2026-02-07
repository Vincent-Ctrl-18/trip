import { useState } from 'react';
import dayjs from 'dayjs';
import './style.css';

interface Props {
  value: string;
  minDate?: string;
  onSelect: (date: string) => void;
  onClose: () => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function CalendarPicker({ value, minDate, onSelect, onClose }: Props) {
  const [current, setCurrent] = useState(dayjs(value));
  const year = current.year();
  const month = current.month(); // 0-indexed

  const firstDay = dayjs(`${year}-${month + 1}-01`);
  const daysInMonth = firstDay.daysInMonth();
  const startWeekday = firstDay.day();

  const days: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const isDisabled = (day: number) => {
    if (!minDate) return false;
    const d = dayjs(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    return d.isBefore(dayjs(minDate), 'day');
  };

  const isSelected = (day: number) => {
    const d = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return d === value;
  };

  const handlePrev = () => setCurrent(current.subtract(1, 'month'));
  const handleNext = () => setCurrent(current.add(1, 'month'));

  const handleClick = (day: number) => {
    if (isDisabled(day)) return;
    const d = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onSelect(d);
  };

  return (
    <div className="calendar-overlay" onClick={onClose}>
      <div className="calendar-modal" onClick={(e) => e.stopPropagation()}>
        <div className="calendar-header">
          <button className="cal-nav" onClick={handlePrev}>&lt;</button>
          <span className="cal-title">{year}年{month + 1}月</span>
          <button className="cal-nav" onClick={handleNext}>&gt;</button>
        </div>
        <div className="calendar-weekdays">
          {WEEKDAYS.map((w) => (
            <div key={w} className="weekday">{w}</div>
          ))}
        </div>
        <div className="calendar-days">
          {days.map((day, idx) => (
            <div
              key={idx}
              className={`day-cell ${day === null ? 'empty' : ''} ${day && isDisabled(day) ? 'disabled' : ''} ${day && isSelected(day) ? 'selected' : ''}`}
              onClick={() => day && handleClick(day)}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
