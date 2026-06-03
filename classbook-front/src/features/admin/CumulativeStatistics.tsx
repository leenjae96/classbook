import {useEffect, useState, useMemo, useRef} from 'react';
import { apiFetch } from "../../hooks/api.ts";
import { getMostRecentSunday } from "../../util/dateUtils.tsx";
import BackButton from "../../components/common/BackButton.tsx";
import styles from './CumulativeStatistics.module.css';
import * as XLSX from 'xlsx-js-style';

interface StudentAttendanceSummary {
    status: number;
    grade: number | null;
    classNo: string | null;
    name: string;
    attendances: string[];
    registeredAt: string | null;  // "MM/dd" — 첫 등록일
    promotedAt: string | null;    // "MM/dd" — 등반일 (registeredAt 과 같으면 등반 이력 없음)
}

interface CumulativeSheet {
    headerDates: string[];
    students: StudentAttendanceSummary[];
}

interface TeacherAttendanceSummary {
    classroom: string;
    name: string;
    attendances: string[];
}

interface TeacherCumulativeSheet {
    headerDates: string[];
    teachers: TeacherAttendanceSummary[];
}

type Tab = 'student' | 'newFriend' | 'specialClass' | 'teacher';

interface ProcessedStudent extends StudentAttendanceSummary {
    rowSpans: {
        grade: number;
        classNo: number;
    };
}

// rowSpan 계산 helper (이미 status로 필터된 배열을 받음)
const buildRowSpans = (students: StudentAttendanceSummary[]): ProcessedStudent[] => {
    const result: ProcessedStudent[] = students.map(s => ({
        ...s,
        rowSpans: { grade: 1, classNo: 1 }
    }));
    for (let i = 0; i < students.length; i++) {
        // 학년 병합
        if (i === 0 || students[i].grade !== students[i - 1].grade) {
            let span = 1;
            for (let j = i + 1; j < students.length && students[j].grade === students[i].grade; j++) {
                span++;
                result[j].rowSpans.grade = 0;
            }
            result[i].rowSpans.grade = span;
        }
        // 반 병합 (같은 학년 내)
        if (i === 0 || students[i].grade !== students[i - 1].grade || students[i].classNo !== students[i - 1].classNo) {
            let span = 1;
            for (let j = i + 1; j < students.length && students[j].grade === students[i].grade && students[j].classNo === students[i].classNo; j++) {
                span++;
                result[j].rowSpans.classNo = 0;
            }
            result[i].rowSpans.classNo = span;
        }
    }
    return result;
};

const CumulativeStatistics = () => {
    const [activeTab, setActiveTab] = useState<Tab>('student');
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [sheetData, setSheetData] = useState<CumulativeSheet | null>(null);
    const [teacherSheetData, setTeacherSheetData] = useState<TeacherCumulativeSheet | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const tableRef = useRef<HTMLTableElement>(null);

    const getDateRange = () => {
        const startDate = `${selectedYear}-01-01`;
        const currentYear = new Date().getFullYear();
        const endDate = selectedYear === currentYear ? getMostRecentSunday() : `${selectedYear}-12-31`;
        return { startDate, endDate };
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            const { startDate, endDate } = getDateRange();
            const data: CumulativeSheet = await apiFetch(`/api/administrator/cumulative-stats?startDate=${startDate}&endDate=${endDate}`);
            setSheetData(data);
        } catch (error) {
            console.error("학생 누적 통계 로드 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeacherStats = async () => {
        setLoading(true);
        try {
            const { startDate, endDate } = getDateRange();
            const data: TeacherCumulativeSheet = await apiFetch(`/api/administrator/teacher-cumulative-stats?startDate=${startDate}&endDate=${endDate}`);
            setTeacherSheetData(data);
        } catch (error) {
            console.error("선생님 출석 통계 로드 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'teacher') fetchTeacherStats();
        else fetchStats();
    }, [selectedYear, activeTab]);

    const getGradeText = (grade: number | null) => {
        if (grade === null) return '-';
        return grade === 0 ? '1부' : `${grade}`;
    };
    const getClassText = (grade: number | null, classNo: string | null) => {
        if (grade === null || classNo === null) return '-';
        if (grade === 0) return classNo === '0' ? '여' : '남';
        return `${classNo}`;
    };

    // 탭별 필터링 & rowSpan 계산
    const processedRegularStudents = useMemo(() =>
        buildRowSpans(sheetData?.students.filter(s => s.status === 1) ?? []), [sheetData]);
    const processedNewFriends = useMemo(() =>
        // status=0(현재 새친구) + status=1이면서 registeredAt≠promotedAt (등반 이력 있는 학생)
        buildRowSpans(sheetData?.students.filter(s =>
            s.status === 0 ||
            (s.status === 1 && s.registeredAt !== null && s.registeredAt !== s.promotedAt)
        ) ?? []), [sheetData]);
    const specialClassStudents = useMemo(() =>
        sheetData?.students.filter(s => s.status === 3) ?? [], [sheetData]);

    const handleDownloadExcel = () => {
        if (!tableRef.current) return;
        const { endDate } = getDateRange();
        const tabNames: Record<Tab, string> = {
            student: '일반학생출석통계',
            newFriend: '새친구출석통계',
            specialClass: '별분반출석통계',
            teacher: '선생님출석통계'
        };
        const sheetName = tabNames[activeTab];
        const wb = XLSX.utils.table_to_book(tableRef.current, { sheet: sheetName, raw: true });
        const ws = wb.Sheets[sheetName];
        for (const key in ws) {
            if (key.startsWith('!')) continue;
            if (ws[key]) {
                ws[key].s = { alignment: { vertical: "center", horizontal: "center" } };
            }
        }
        XLSX.writeFile(wb, `${endDate}_${sheetName}.xlsx`);
    };

    // 일반학생/새친구 공통 행 렌더링 (학년/반/이름 3개 틀고정)
    const renderStudentRows = (processed: ProcessedStudent[], headerDates: string[], showPromotedLabel = false) =>
        processed.map((student, idx) => (
            <tr key={`${student.grade}-${student.classNo}-${student.name}-${idx}`}>
                {student.rowSpans.grade > 0 && (
                    <td className={styles.stickyGrade} rowSpan={student.rowSpans.grade}>
                        {getGradeText(student.grade)}
                    </td>
                )}
                {student.rowSpans.classNo > 0 && (
                    <td className={styles.stickyClassNo} rowSpan={student.rowSpans.classNo}>
                        {getClassText(student.grade, student.classNo)}
                    </td>
                )}
                <td className={styles.stickyStudentName} style={{ fontWeight: '500' }}>
                    {student.name}
                    {showPromotedLabel && student.status === 1 && (
                        <span style={{ fontSize: '10px', color: '#adb5bd', marginLeft: '4px' }}>(등반)</span>
                    )}
                    {student.status === 0 && student.attendances.length >= 3 && (
                        <span style={{ fontSize: '10px', color: '#e65100', background: '#fff3e0', padding: '1px 5px', borderRadius: '8px', marginLeft: '4px' }}>🎉등반!</span>
                    )}
                </td>
                {headerDates.map(date => {
                    const isPresent = student.attendances.includes(date);
                    return (
                        <td key={date} className={isPresent ? styles.present : styles.absent}>
                            {isPresent ? 'O' : ''}
                        </td>
                    );
                })}
            </tr>
        ));

    const renderContent = () => {
        if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>데이터를 불러오는 중...</div>;

        // 선생님 탭
        if (activeTab === 'teacher') {
            if (!teacherSheetData) return <div style={{ textAlign: 'center', padding: '50px' }}>데이터가 없습니다.</div>;
            return (
                <div className={styles.tableWrapper}>
                    <table ref={tableRef} className={styles.statsTable}>
                        <thead>
                        <tr>
                            <th className={styles.stickyTeacherClassroom}>학년반</th>
                            <th className={styles.stickyTeacherName}>이름</th>
                            {teacherSheetData.headerDates.map(date => <th key={date}>{date}</th>)}
                        </tr>
                        </thead>
                        <tbody>
                        {teacherSheetData.teachers.map((teacher, idx) => (
                            <tr key={`${teacher.classroom}-${teacher.name}-${idx}`}>
                                <td className={styles.stickyTeacherClassroom}>{teacher.classroom}</td>
                                <td className={styles.stickyTeacherName} style={{ fontWeight: '500' }}>{teacher.name}</td>
                                {teacherSheetData.headerDates.map(date => {
                                    const isPresent = teacher.attendances.includes(date);
                                    return <td key={date} className={isPresent ? styles.present : styles.absent}>{isPresent ? 'O' : ''}</td>;
                                })}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        // 학생 관련 탭 — sheetData 필요
        if (!sheetData) return <div style={{ textAlign: 'center', padding: '50px' }}>데이터가 없습니다.</div>;

        // 별분반 탭 (학년/반 컬럼 없음, 이름만 틀고정)
        if (activeTab === 'specialClass') {
            return (
                <div className={styles.tableWrapper}>
                    <table ref={tableRef} className={styles.statsTable}>
                        <thead>
                        <tr>
                            <th className={styles.stickySpecialName}>이름</th>
                            {sheetData.headerDates.map(date => <th key={date}>{date}</th>)}
                        </tr>
                        </thead>
                        <tbody>
                        {specialClassStudents.map((student, idx) => (
                            <tr key={`${student.name}-${idx}`}>
                                <td className={styles.stickySpecialName} style={{ fontWeight: '500' }}>{student.name}</td>
                                {sheetData.headerDates.map(date => {
                                    const isPresent = student.attendances.includes(date);
                                    return <td key={date} className={isPresent ? styles.present : styles.absent}>{isPresent ? 'O' : ''}</td>;
                                })}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        // 일반학생 / 새친구 탭 (학년/반/이름 3개 틀고정)
        const isNewFriendTab = activeTab === 'newFriend';
        const processed = isNewFriendTab ? processedNewFriends : processedRegularStudents;
        return (
            <div className={styles.tableWrapper}>
                <table ref={tableRef} className={styles.statsTable}>
                    <thead>
                    <tr>
                        <th className={styles.stickyGrade}>학년</th>
                        <th className={styles.stickyClassNo}>반</th>
                        <th className={styles.stickyStudentName}>이름</th>
                        {sheetData.headerDates.map(date => <th key={date}>{date}</th>)}
                    </tr>
                    </thead>
                    <tbody>
                    {renderStudentRows(processed, sheetData.headerDates, isNewFriendTab)}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="content">
            <BackButton />
            <div className={styles.container}>
                <div className={styles.headerControls}>
                    <div className={styles.tabGroup}>
                        <button className={`${styles.tabBtn} ${activeTab === 'student' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('student')}>일반학생</button>
                        <button className={`${styles.tabBtn} ${activeTab === 'newFriend' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('newFriend')}>새친구</button>
                        <button className={`${styles.tabBtn} ${activeTab === 'specialClass' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('specialClass')}>별분반</button>
                        <button className={`${styles.tabBtn} ${activeTab === 'teacher' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('teacher')}>선생님출석</button>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            style={{ padding: '6px 10px', borderRadius: '5px', border: '1px solid #ccc' }}
                        >
                            <option value={new Date().getFullYear()}>{new Date().getFullYear()}년</option>
                            <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}년</option>
                        </select>
                        <button onClick={handleDownloadExcel} className={styles.excelBtn}>
                            📥 엑셀 다운로드
                        </button>
                    </div>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default CumulativeStatistics;
