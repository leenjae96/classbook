import { useEffect, useState } from 'react';
import { apiFetch } from "../../hooks/api.ts";
import { getMostRecentSunday } from "../../util/dateUtils.tsx";
import styles from './ClassroomCumulativeStatisticsModal.module.css';

interface StudentAttendanceSummary {
    status: number;
    name: string;
    attendances: string[];
    registeredAt: string | null;
    promotedAt: string | null;
}

interface CumSheet {
    headerDates: string[];
    students: StudentAttendanceSummary[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const NewFriendCumulativeModal = ({ isOpen, onClose }: Props) => {
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [sheetData, setSheetData] = useState<CumSheet | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!isOpen) return;

        const fetchStats = async () => {
            setLoading(true);
            try {
                const startDate = `${selectedYear}-01-01`;
                const currentYear = new Date().getFullYear();
                const endDate = selectedYear === currentYear ? getMostRecentSunday() : `${selectedYear}-12-31`;

                const data: CumSheet = await apiFetch(
                    `/api/attendances/new-friend/cumulative-stats?startDate=${startDate}&endDate=${endDate}`
                );
                setSheetData(data);
            } catch (error) {
                console.error("새친구 누적 통계 로드 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [isOpen, selectedYear]);

    if (!isOpen) return null;

    // 현재 새친구 / 등반 완료 분리
    const activeNewFriends = sheetData?.students.filter(s => s.status === 0) || [];
    const promotedStudents = sheetData?.students.filter(s => s.status === 1) || [];

    const renderRows = (students: StudentAttendanceSummary[], showPromotedLabel = false) =>
        students.map((student, idx) => (
            <tr key={`${student.name}-${idx}`}>
                <td className={styles.stickyName}>
                    {student.name}
                    {showPromotedLabel && (
                        <span style={{ fontSize: '10px', color: '#adb5bd', marginLeft: '4px' }}>(등반)</span>
                    )}
                    {/* 새친구이고 3회 이상 출석 → 등반 필요 */}
                    {!showPromotedLabel && student.attendances.length >= 3 && (
                        <span style={{ fontSize: '10px', color: '#e65100', background: '#fff3e0', padding: '1px 5px', borderRadius: '8px', marginLeft: '4px' }}>🎉등반!</span>
                    )}
                </td>
                {sheetData!.headerDates.map(date => {
                    const isPresent = student.attendances.includes(date);
                    return (
                        <td key={date} className={isPresent ? styles.present : styles.absent}>
                            {isPresent ? 'O' : ''}
                        </td>
                    );
                })}
            </tr>
        ));

    return (
        <div className={styles.overlay}>
            <div className={styles.modalContent}>
                <div className={styles.header}>
                    <h3>🌱 새친구 누적 출석</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className={styles.selectBox}
                        >
                            <option value={new Date().getFullYear()}>{new Date().getFullYear()}년</option>
                            <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}년</option>
                        </select>
                        <button onClick={onClose} className={styles.closeBtn}>닫기</button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>데이터를 불러오는 중...</div>
                ) : !sheetData ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>데이터가 없습니다.</div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.statsTable}>
                            <thead>
                            <tr>
                                <th className={styles.stickyName}>이름</th>
                                {sheetData.headerDates.map(date => (
                                    <th key={date}>{date}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {/* 현재 새친구 */}
                            {renderRows(activeNewFriends)}

                            {/* 등반 완료 구분선 */}
                            {promotedStudents.length > 0 && (
                                <>
                                    <tr className={styles.dividerRow}>
                                        <td colSpan={sheetData.headerDates.length + 1}>
                                            🎉 등반 완료
                                        </td>
                                    </tr>
                                    {renderRows(promotedStudents, true)}
                                </>
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
