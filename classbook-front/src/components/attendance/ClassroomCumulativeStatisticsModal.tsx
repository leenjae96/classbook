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
    grade: number;
    classNo: string;
}

export const ClassroomCumulativeStatisticsModal = ({ isOpen, onClose, grade, classNo }: Props) => {
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

                const data: CumSheet = await apiFetch(`/api/attendances/cumulative-stats?grade=${grade}&classNo=${classNo}&startDate=${startDate}&endDate=${endDate}`);
                setSheetData(data);
            } catch (error) {
                console.error("반 누적 통계 로드 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [isOpen, selectedYear, grade, classNo]);

    if (!isOpen) return null;

    // ✨ 학생 데이터 분리
    const normalStudents = sheetData?.students.filter(s => s.status !== 0) || [];
    const newStudents = sheetData?.students.filter(s => s.status === 0) || [];

    const getClassName = () => {
        if (grade === 0) return classNo === '0' ? '1부 여자반' : '1부 남자반';
        return `${grade}학년 ${classNo}반`;
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modalContent}>
                <div className={styles.header}>
                    <h3>{getClassName()} 출석 현황</h3>

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
                            {/* 1. 일반 학생 */}
                            {normalStudents.map((student, idx) => (
                                <tr key={`normal-${idx}`}>
                                    <td className={styles.stickyName}>{student.name}</td>
                                    {sheetData.headerDates.map(date => {
                                        const isPresent = student.attendances.includes(date);
                                        return (
                                            <td key={date} className={isPresent ? styles.present : styles.absent}>
                                                {isPresent ? 'O' : ''}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}

                            {/* 2. 새친구 (있는 경우에만 구분선과 함께 출력) */}
                            {newStudents.length > 0 && (
                                <>
                                    <tr className={styles.dividerRow}>
                                        <td colSpan={sheetData.headerDates.length + 1}>
                                            🌱 새친구
                                        </td>
                                    </tr>
                                    {newStudents.map((student, idx) => (
                                        <tr key={`new-${idx}`}>
                                            <td className={styles.stickyName}>
                                                {student.name}
                                                {student.attendances.length >= 3 && (
                                                    <span style={{ fontSize: '10px', color: '#e65100', background: '#fff3e0', padding: '1px 5px', borderRadius: '8px', marginLeft: '4px' }}>🎉등반!</span>
                                                )}
                                            </td>
                                            {sheetData.headerDates.map(date => {
                                                const isPresent = student.attendances.includes(date);
                                                return (
                                                    <td key={date} className={isPresent ? styles.present : styles.absent}>
                                                        {isPresent ? 'O' : ''}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
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