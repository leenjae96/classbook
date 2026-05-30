import { useEffect, useState } from 'react';
import { apiFetch } from '../../hooks/api.ts';
import { getMostRecentSunday } from '../../util/dateUtils.tsx';
import BackButton from '../../components/common/BackButton.tsx';
import styles from './TeacherWeeklyReport.module.css';

interface TeacherWeeklyReportItem {
    name: string;
    date: string | null;
    worship: number | null;
    otn: boolean | null;
    dawnPray: number | null;
    comments: string | null;
}

const getWorshipText = (worship: number | null): string => {
    if (worship === null) return '-';
    if (worship === 0) return '미참석';
    return `${worship}부`;
};

const parseLocalDate = (dateStr: string): Date => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
};

const formatDate = (dateStr: string): string => {
    const [y, m, d] = dateStr.split('-');
    return `${y}.${m}.${d}`;
};

const addDays = (dateStr: string, days: number): string => {
    const date = parseLocalDate(dateStr);
    date.setDate(date.getDate() + days);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const TeacherWeeklyReport = () => {
    const [selectedDate, setSelectedDate] = useState<string>(getMostRecentSunday());
    const [reports, setReports] = useState<TeacherWeeklyReportItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const data: TeacherWeeklyReportItem[] = await apiFetch(`/api/administrator/teacher-weekly-report?date=${selectedDate}`);
            setReports(data);
        } catch (error) {
            console.error('선생님 주금새 로드 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [selectedDate]);

    const goPrev = () => setSelectedDate(prev => addDays(prev, -7));
    const goNext = () => {
        const next = addDays(selectedDate, 7);
        if (next <= getMostRecentSunday()) setSelectedDate(next);
    };

    const isLatest = selectedDate >= getMostRecentSunday();

    return (
        <div className="content">
            <BackButton />
            <div className={styles.container}>
                <div className={styles.headerControls}>
                    <h4>선생님 주금새</h4>
                    <div className={styles.dateNav}>
                        <button className={styles.navBtn} onClick={goPrev}>◀</button>
                        <span className={styles.dateLabel}>{formatDate(selectedDate)} (주일)</span>
                        <button className={styles.navBtn} onClick={goNext} disabled={isLatest}>▶</button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>데이터를 불러오는 중...</div>
                ) : reports.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>데이터가 없습니다.</div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.reportTable}>
                            <thead>
                            <tr>
                                <th className={styles.colName}>이름</th>
                                <th className={styles.colWorship}>예배</th>
                                <th className={styles.colOtn}>OTN</th>
                                <th className={styles.colDawn}>새벽기도</th>
                                <th className={styles.colComments}>코멘트</th>
                            </tr>
                            </thead>
                            <tbody>
                            {reports.map((item, idx) => {
                                const hasReport = item.date !== null;
                                return (
                                    <tr key={`${item.name}-${idx}`} className={!hasReport ? styles.noReport : ''}>
                                        <td className={styles.colName}>{item.name}</td>
                                        <td className={styles.colWorship}>{getWorshipText(item.worship)}</td>
                                        <td className={styles.colOtn}>
                                            {item.otn === null ? '-' : item.otn ? 'O' : 'X'}
                                        </td>
                                        <td className={styles.colDawn}>
                                            {item.dawnPray === null ? '-' : item.dawnPray}
                                        </td>
                                        <td className={styles.colComments}>{item.comments ?? ''}</td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherWeeklyReport;
