// ── components/CalendarTab.jsx ────────────────────────────────────
import { useState, useMemo } from 'react';
import { toPhDate, todayStr, isWeekend, isHoliday, fmtDur, fmtTimeShort } from '../lib/utils.js';

const DAY_HEADERS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function CalendarTab({ sessions, schedule }) {
  const now = new Date();
  const [calYear,  setCalYear]  = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selDay,   setSelDay]   = useState(null);
  const today = todayStr();

  const sessMap = useMemo(() => {
    const m = {};
    sessions.forEach(s => {
      const raw = s.actualTimeIn?.toDate?.() ?? s.actualTimeIn;
      const d = toPhDate(raw);
      if (d) m[d] = s;
    });
    return m;
  }, [sessions]);

  const schedMap = useMemo(() => {
    const m = {};
    schedule.forEach(r => { const d = toPhDate(r['Date']); if (d) m[d] = r; });
    return m;
  }, [schedule]);

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const startDay    = new Date(calYear, calMonth, 1).getDay();
  const monthName   = new Date(calYear, calMonth, 1).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };

  const selDateStr = selDay ? `${calYear}-${String(calMonth + 1).padStart(2,'0')}-${String(selDay).padStart(2,'0')}` : null;
  const selSess    = selDateStr ? sessMap[selDateStr] : null;
  const selSched   = selDateStr ? schedMap[selDateStr] : null;
  const isHol      = selSched ? isHoliday(selSched['Event/Notes'] || selSched['Event'] || '') : false;

  return (
    <div style={{ padding: '16px', animation: 'fadeUp 0.35s ease both' }}>
      <div style={{ fontSize: 21, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: 16 }}>Calendar</div>

      <div className="glass" style={{ padding: '16px' }}>
        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <button className="tap" onClick={prevMonth} style={{ background: 'var(--surface2)', border: '1px solid var(--s-border)', borderRadius: 8, padding: '6px 10px', color: 'var(--text2)', cursor: 'pointer' }}>‹</button>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{monthName}</span>
          <button className="tap" onClick={nextMonth} style={{ background: 'var(--surface2)', border: '1px solid var(--s-border)', borderRadius: 8, padding: '6px 10px', color: 'var(--text2)', cursor: 'pointer' }}>›</button>
        </div>

        {/* Day headers */}
        <div className="cal-grid" style={{ marginBottom: 4 }}>
          {DAY_HEADERS.map((d, i) => (
            <div key={d} className={`cal-day-header ${i === 0 ? 'sun' : i === 6 ? 'sat' : ''}`}>{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="cal-grid">
          {Array.from({ length: startDay }, (_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const isToday   = dStr === today;
            const hasSess   = !!sessMap[dStr];
            const schedRow  = schedMap[dStr];
            const ev        = schedRow?.['Event/Notes'] || schedRow?.['Event'] || '';
            const dayOfWeek = new Date(dStr).getUTCDay();
            const isWkd     = dayOfWeek === 0 || dayOfWeek === 6;
            const isHol_    = isHoliday(ev);
            const isSel     = selDay === day;

            return (
              <div key={day}
                className={`cal-day ${isToday ? 'today' : ''} ${hasSess ? 'has-session' : ''} ${isWkd ? 'weekend' : ''} ${isHol_ ? 'holiday' : ''}`}
                onClick={() => setSelDay(selDay === day ? null : day)}
                style={{
                  cursor: 'pointer',
                  background: isSel && !isToday ? 'var(--surface2)' : undefined,
                  border: isSel && !isToday ? '1px solid var(--teal)' : undefined,
                }}>
                <span style={{ fontSize: 13, fontWeight: isToday ? 700 : 500 }}>{day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selDateStr && (
        <div className="glass" style={{ padding: '16px', marginTop: 12, animation: 'fadeUp 0.2s ease both' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
            {new Date(selDateStr + 'T12:00:00').toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          {isHol && <div style={{ color: 'var(--amber)', fontSize: 12, marginBottom: 8 }}>🎉 Holiday</div>}
          {selSched?.['Event/Notes'] && !isHol && <div style={{ color: 'var(--text2)', fontSize: 12, marginBottom: 8 }}>{selSched['Event/Notes']}</div>}
          {selSess ? (
            <div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                <span style={{ color: 'var(--text2)', fontSize: 12 }}>In: <span style={{ color: 'var(--amber)', fontFamily: 'var(--mono)' }}>{fmtTimeShort(selSess.actualTimeIn?.toDate?.() ?? selSess.actualTimeIn)}</span></span>
                <span style={{ color: 'var(--text2)', fontSize: 12 }}>Out: <span style={{ color: 'var(--amber)', fontFamily: 'var(--mono)' }}>{fmtTimeShort(selSess.actualTimeOut?.toDate?.() ?? selSess.actualTimeOut)}</span></span>
              </div>
              <div style={{ color: 'var(--teal)', fontSize: 13, fontWeight: 700 }}>{fmtDur(selSess.duration)} logged</div>
              {selSess.note && <div style={{ color: 'var(--text3)', fontSize: 11, marginTop: 6, fontStyle: 'italic' }}>{selSess.note}</div>}
            </div>
          ) : (
            <div style={{ color: 'var(--text3)', fontSize: 12 }}>No attendance recorded for this day.</div>
          )}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, marginTop: 12, flexWrap: 'wrap' }}>
        {[['var(--teal)','Today'],['var(--amber)','Has session'],['var(--amber)','Holiday (bg)'],['var(--text3)','Weekend']].map(([c,l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }}/>
            <span style={{ fontSize: 10, color: 'var(--text2)' }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
