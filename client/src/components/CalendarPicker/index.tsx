import { useState } from 'react';
import { useT, formatCalendarTitle } from '../../i18n';
import dayjs from 'dayjs';
import './style.css';

interface Props {
  value: string;
  minDate?: string;
  onSelect: (date: string) => void;
  onClose: () => void;
}

export default function CalendarPicker({ value, minDate, onSelect, onClose }: Props) {
  const { tArray, lang } = useT();
  const weekdays = tArray('calendar.weekdays');

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

  const isToday = (day: number) => {
    const d = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return d === dayjs().format('YYYY-MM-DD');
  };

  const handlePrev = () => setCurrent(current.subtract(1, 'month'));
  const handleNext = () => setCurrent(current.add(1, 'month'));

  const handleClick = (day: number) => {
    if (isDisabled(day)) return;
    const d = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onSelect(d);
  };

  return (
    <div className="cal-overlay" onClick={onClose}>
      <div className="cal-modal" onClick={(e) => e.stopPropagation()}>
        {/* Handle bar */}
        <div className="cal-handle">
          <div className="cal-handle-bar" />
        </div>

        {/* Header */}
        <div className="cal-header">
          <button className="cal-nav-btn" onClick={handlePrev}>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <span className="cal-title">{formatCalendarTitle(year, month, lang)}</span>
          <button className="cal-nav-btn" onClick={handleNext}>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        {/* Weekdays */}
        <div className="cal-weekdays">
          {weekdays.map((w) => (
            <div key={w} className="cal-weekday">{w}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="cal-days">
          {days.map((day, idx) => (
            <div
              key={idx}
              className={`cal-day ${day === null ? 'empty' : ''} ${day && isDisabled(day) ? 'disabled' : ''} ${day && isSelected(day) ? 'selected' : ''} ${day && isToday(day) ? 'today' : ''}`}
              onClick={() => day && handleClick(day)}
            >
              {day}
              {day && isToday(day) && !isSelected(day) && <span className="cal-today-dot" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
