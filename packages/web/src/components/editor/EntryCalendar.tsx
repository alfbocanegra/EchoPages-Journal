import React, { useState } from 'react';
import type { Entry } from './EntryList';

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function getHeatColor(count: number, max: number) {
  if (count === 0) return 'transparent';
  // 1-5+ entries: scale from #b3e5fc to #0288d1
  const colors = ['#b3e5fc', '#4fc3f7', '#29b6f6', '#039be5', '#0288d1'];
  if (max <= 1) return colors[0];
  if (count >= 5) return colors[4];
  return colors[Math.min(count - 1, 4)];
}

const CalendarDayCell: React.FC<{
  day: number;
  dateStr: string;
  count: number;
  maxCount: number;
  hasEntry: boolean;
  onClick: (date: string) => void;
}> = ({ day, dateStr, count, maxCount, hasEntry, onClick }) => (
  <td style={{ padding: 4, textAlign: 'center' }}>
    <button
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: getHeatColor(count, maxCount),
        border: hasEntry ? '2px solid #0288d1' : '1px solid #ccc',
        color: hasEntry ? '#0288d1' : '#222',
        fontWeight: hasEntry ? 600 : 400,
        cursor: 'pointer',
        outline: 'none',
        position: 'relative',
      }}
      onClick={() => onClick(dateStr)}
      aria-label={`Show entries for ${dateStr}`}
      title={hasEntry ? `${count} entr${count === 1 ? 'y' : 'ies'}` : undefined}
    >
      {day}
    </button>
  </td>
);

export const EntryCalendar: React.FC<{
  entries: Entry[];
  onDateSelect: (date: string) => void;
  initialYear?: number;
  initialMonth?: number;
}> = ({ entries, onDateSelect, initialYear, initialMonth }) => {
  const today = new Date();
  const [year, setYear] = useState(initialYear ?? today.getFullYear());
  const [month, setMonth] = useState(initialMonth ?? today.getMonth());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = new Date(year, month, 1).getDay();
  // Count entries per day
  const entryCount: Record<string, number> = {};
  entries.forEach(e => {
    const d = e.date.slice(0, 10);
    if (d.startsWith(`${year}-${pad(month + 1)}`)) {
      entryCount[d] = (entryCount[d] || 0) + 1;
    }
  });
  const maxCount = Math.max(1, ...Object.values(entryCount));

  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) weeks.push([...week, ...Array(7 - week.length).fill(null)]);

  const handlePrev = () => {
    if (month === 0) {
      setYear(y => y - 1);
      setMonth(11);
    } else {
      setMonth(m => m - 1);
    }
  };
  const handleNext = () => {
    if (month === 11) {
      setYear(y => y + 1);
      setMonth(0);
    } else {
      setMonth(m => m + 1);
    }
  };

  return (
    <div style={{ marginBottom: 24, maxWidth: 340 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <button onClick={handlePrev} aria-label="Previous month">
          ◀
        </button>
        <span style={{ fontWeight: 600 }}>
          {today.toLocaleString('default', { month: 'long' })} {year}
        </span>
        <button onClick={handleNext} aria-label="Next month">
          ▶
        </button>
      </div>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          background: '#f8f8f8',
          borderRadius: 8,
        }}
      >
        <thead>
          <tr style={{ fontSize: 13, color: '#888' }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <th key={d}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((w, i) => (
            <tr key={i}>
              {w.map((d, j) => {
                if (!d) return <td key={j} />;
                const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
                const count = entryCount[dateStr] || 0;
                const hasEntry = count > 0;
                return (
                  <CalendarDayCell
                    key={j}
                    day={d}
                    dateStr={dateStr}
                    count={count}
                    maxCount={maxCount}
                    hasEntry={hasEntry}
                    onClick={onDateSelect}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
