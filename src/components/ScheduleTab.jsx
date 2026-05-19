// ── components/ScheduleTab.jsx ────────────────────────────────────
import { useMemo, useRef, useEffect } from 'react';
import { toPhDate, todayStr, isWeekend, isHoliday, fmtDur, OJT_START } from '../lib/utils.js';

export default function ScheduleTab({ schedule = [], sessions = [], absents = [] }) {
  const today    = todayStr();
  const todayRef = useRef(null);

  useEffect(() => {
    if (todayRef.current) todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [schedule]);

  const getEvent = row => row['Event/Notes'] || row['Event'] || row['Notes'] || row['Description'] || '';

  const sessMap = useMemo(() => {
    const m = {};
    sessions.forEach(s => { const d = toPhDate(s.actualTimeIn?.toDate?.() ?? s.actualTimeIn); if (d) m[d] = s; });
    return m;
  }, [sessions]);

  const absentMap = useMemo(() => {
    const m = {};
    absents.forEach(a => { m[a.date] = a; });
    return m;
  }, [absents]);

  const weeks = useMemo(() => {
    if (!schedule.length) return [];
    const groups = [];
    let current = [], currentWeek = -1;
    schedule.forEach(row => {
      const d = toPhDate(row['Date']);
      if (!d) { current.push(row); return; }
      const dt       = new Date(d + 'T12:00:00');
      const ojtStart = new Date(OJT_START + 'T00:00:00');
      const dow      = ojtStart.getDay();
      const startMon = new Date(ojtStart.getTime() - (dow === 0 ? 6 : dow - 1) * 86400000);
      const diff     = Math.floor((dt - startMon) / 86400000);
      const week     = Math.max(1, Math.floor(diff / 7) + 1);
      if (week !== currentWeek) {
        if (current.length) groups.push({ week: currentWeek, rows: current });
        current = [row]; currentWeek = week;
      } else { current.push(row); }
    });
    if (current.length) groups.push({ week: currentWeek, rows: current });
    return groups;
  }, [schedule]);

  if (!schedule.length) return (
    <div style={{ padding: '16px', animation: 'fadeUp 0.35s ease both' }}>
      <div style={{ fontSize: 21, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: 4 }}>Schedule</div>
      <div className="glass" style={{ padding: '56px 20px', textAlign: 'center', marginTop: 16 }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 12 }}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
        <div style={{ color: 'var(--text2)', fontSize: 14 }}>No schedule data yet.</div>
        <div style={{ color: 'var(--text3)', fontSize: 12, marginTop: 4 }}>Add schedule rows to Firestore → schedule/main → rows[]</div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '16px', animation: 'fadeUp 0.35s ease both' }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 21, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px' }}>Schedule</div>
        <div style={{ color: 'var(--text2)', fontSize: 12, marginTop: 2 }}>OJT · From Firestore</div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        {[['var(--teal)','Today'],['var(--green)','Attended'],['var(--amber)','Holiday'],['var(--red)','Absent'],['var(--sky)','Leave'],['var(--text3)','Rest / Done']].map(([c,l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: c, flexShrink: 0 }}/>
            <span style={{ fontSize: 10, color: 'var(--text2)' }}>{l}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {weeks.map(({ week, rows }) => {
          const hasToday = rows.some(r => toPhDate(r['Date']) === today);
          return (
            <div key={week}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: hasToday ? 'var(--teal)' : 'var(--text3)', fontFamily: 'var(--mono)' }}>
                  Week {week}
                </div>
                <div style={{ flex: 1, height: 1, background: 'var(--s-border)' }}/>
                {hasToday && <span className="chip" style={{ background: 'rgba(42,157,143,0.1)', color: 'var(--teal)', border: '1px solid rgba(42,157,143,0.25)' }}>Current</span>}
              </div>

              <div className="glass" style={{ overflow: 'hidden' }}>
                {rows.map((row, ri) => {
                  const d          = toPhDate(row['Date']);
                  const ev         = getEvent(row);
                  const isToday    = d === today;
                  const isPast     = d && d < today;
                  const isUpcoming = d && d > today;
                  const isWkd      = d ? isWeekend(d) : false;
                  const isHol_     = isHoliday(ev);
                  const sess       = d ? sessMap[d] : null;
                  const absent     = d ? absentMap[d] : null;

                  let dotColor = 'var(--text3)';
                  if (isToday)  dotColor = 'var(--teal)';
                  else if (sess)   dotColor = 'var(--green)';
                  else if (absent) dotColor = absent.type === 'leave' ? 'var(--sky)' : 'var(--red)';
                  else if (isHol_) dotColor = 'var(--amber)';

                  return (
                    <div key={ri} ref={isToday ? todayRef : null}
                      style={{ display: 'flex', alignItems: 'center', padding: '0', borderBottom: ri < rows.length - 1 ? '1px solid var(--s-border)' : 'none', background: isToday ? 'rgba(42,157,143,0.06)' : 'transparent', transition: 'background 0.2s' }}>

                      {/* Date col */}
                      <div style={{ padding: '10px 14px', minWidth: 72, flexShrink: 0, borderRight: '1px solid var(--s-border)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--mono)', color: isToday ? 'var(--teal)' : isWkd || isPast ? 'var(--text3)' : 'var(--text)' }}>
                          {d ? new Date(d + 'T12:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }) : '—'}
                        </div>
                        <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 1 }}>
                          {d ? new Date(d + 'T12:00:00').toLocaleDateString('en-PH', { weekday: 'short' }) : ''}
                        </div>
                      </div>

                      {/* Status dot */}
                      <div style={{ paddingLeft: 12, flexShrink: 0 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor }}/>
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, padding: '10px 12px', minWidth: 0 }}>
                        {ev ? (
                          <div style={{ fontSize: 12, color: isHol_ ? 'var(--amber)' : isWkd ? 'var(--text3)' : isPast ? 'var(--text2)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isHol_ ? 600 : 400 }}>
                            {ev}
                          </div>
                        ) : (
                          <div style={{ fontSize: 12, color: 'var(--text3)' }}>—</div>
                        )}
                        {sess && !isWkd && (
                          <div style={{ fontSize: 10, color: 'var(--green)', marginTop: 2 }}>
                            ✓ {fmtDur(sess.duration)} logged
                          </div>
                        )}
                        {absent && (
                          <div style={{ fontSize: 10, color: absent.type === 'leave' ? 'var(--sky)' : 'var(--red)', marginTop: 2 }}>
                            {absent.type === 'leave' ? 'On Leave' : 'Absent'} · {absent.reason}
                          </div>
                        )}
                      </div>

                      {/* Badge */}
                      <div style={{ padding: '10px 12px 10px 6px', flexShrink: 0 }}>
                        {isToday && <span className="chip" style={{ background: 'rgba(42,157,143,0.12)', color: 'var(--teal)', border: '1px solid rgba(42,157,143,0.3)' }}>Today</span>}
                        {!isToday && sess && <span className="chip" style={{ background: 'rgba(76,175,130,0.1)', color: 'var(--green)', border: '1px solid rgba(76,175,130,0.22)' }}>✓ Done</span>}
                        {!isToday && absent?.type === 'leave' && <span className="chip" style={{ background: 'rgba(91,188,214,0.08)', color: 'var(--sky)', border: '1px solid rgba(91,188,214,0.22)' }}>Leave</span>}
                        {!isToday && absent?.type !== 'leave' && absent && <span className="chip" style={{ background: 'rgba(224,85,85,0.08)', color: 'var(--red)', border: '1px solid rgba(224,85,85,0.22)' }}>Absent</span>}
                        {!isToday && !sess && !absent && isHol_ && <span className="chip" style={{ background: 'rgba(233,168,51,0.1)', color: 'var(--amber)', border: '1px solid rgba(233,168,51,0.25)' }}>Holiday</span>}
                        {!isToday && !sess && !absent && isWkd && <span className="chip" style={{ background: 'var(--surface2)', color: 'var(--text3)', border: '1px solid var(--s-border)' }}>Rest</span>}
                        {!isToday && !sess && !absent && isPast && !isWkd && !isHol_ && <span className="chip" style={{ background: 'rgba(224,85,85,0.06)', color: 'var(--red)', border: '1px solid rgba(224,85,85,0.15)' }}>Missed</span>}
                        {!isToday && isUpcoming && !isWkd && !isHol_ && <span className="chip" style={{ background: 'rgba(91,188,214,0.07)', color: 'var(--sky)', border: '1px solid rgba(91,188,214,0.2)' }}>Soon</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
