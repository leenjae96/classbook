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
}

interface CumulativeSheet {
    headerDates: string[];
    students: StudentAttendanceSummary[];
}

interface TeacherAttendanceSummary {
    name: string;
    attendances: string[];
}

interface TeacherCumulativeSheet {
    headerDates: string[];
    teachers: TeacherAttendanceSummary[];
}

type Tab = 'student' | 'teacher';

// 병합 정보가 추가된 확장 타입 TODO: 왜만든거지?
interface ProcessedStudent extends StudentAttendanceSummary {
    rowSpans: {
        category: number;
        grade: number;
        classNo: number;
    };
}

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
        if (activeTab === 'student') fetchStats();
        else fetchTeacherStats();
    }, [selectedYear, activeTab]);

    // 텍스트 축약 (폭을 줄이기 위해 한/두 글자로 단축)
    const getStatusText = (status: number) => {
        if (status === 0) return '새친구';
        if (status === 3) return '별분';
        return ''; // 일반 학생은 공백 유지 (공간 절약)
    };
    const getGradeText = (grade: number | null) => {
        if (grade === null) return '-';
        return grade === 0 ? '1부' : `${grade}`;
    }
    const getClassText = (grade: number | null, classNo: string | null) => {
        if (grade === null || classNo === null) return '-';
        if (grade === 0) return classNo === '0' ? '여' : '남';
        return `${classNo}`;
    };

    const handleDownloadExcel = () => {
        if (!tableRef.current) return;
        const { endDate } = getDateRange();
        const sheetName = activeTab === 'student' ? '학생출석통계' : '선생님출석통계';
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

    // 셀 병합(rowspan)을 위한 데이터 전처리 로직
    const processedStudents = useMemo(() => {
        if (!sheetData) return [];
        const students = sheetData.students;
        const result: ProcessedStudent[] = students.map(s => ({
            ...s,
            rowSpans: { category: 1, grade: 1, classNo: 1 }
        }));

        for (let i = 0; i < students.length; i++) {
            // 1. 구분(Category) 병합 계산
            if (i === 0 || students[i].status !== students[i-1].status) {
                let span = 1;
                for (let j = i + 1; j < students.length && students[j].status === students[i].status; j++) {
                    span++;
                    result[j].rowSpans.category = 0; // 0이면 렌더링 안 함 (숨김 처리)
                }
                result[i].rowSpans.category = span;
            }

            // 2. 학년(Grade) 병합 계산 (같은 구분 내에서)
            if (i === 0 || students[i].status !== students[i-1].status || students[i].grade !== students[i-1].grade) {
                let span = 1;
                for (let j = i + 1; j < students.length && students[j].status === students[i].status && students[j].grade === students[i].grade; j++) {
                    span++;
                    result[j].rowSpans.grade = 0;
                }
                result[i].rowSpans.grade = span;
            }

            // 3. 반(Class) 병합 계산 (같은 구분, 같은 학년 내에서)
            if (i === 0 || students[i].status !== students[i-1].status || students[i].grade !== students[i-1].grade || students[i].classNo !== students[i-1].classNo) {
                let span = 1;
                for (let j = i + 1; j < students.length && students[j].status === students[i].status && students[j].grade === students[i].grade && students[j].classNo === students[i].classNo; j++) {
                    span++;
                    result[j].rowSpans.classNo = 0;
                }
                result[i].rowSpans.classNo = span;
            }
        }
        return result;
    }, [sheetData]);

    return (
        <div className="content">
            <BackButton />
            <div className={styles.container}>
                <div className={styles.headerControls}>
                    <div className={styles.tabGroup}>
                        <button
                            className={`${styles.tabBtn} ${activeTab === 'student' ? styles.tabBtnActive : ''}`}
                            onClick={() => setActiveTab('student')}
                        >학생누적</button>
                        <button
                            className={`${styles.tabBtn} ${activeTab === 'teacher' ? styles.tabBtnActive : ''}`}
                            onClick={() => setActiveTab('teacher')}
                        >선생님출석</button>
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

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>데이터를 불러오는 중...</div>
                ) : activeTab === 'student' ? (
                    !sheetData ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>데이터가 없습니다.</div>
                    ) : (
                        <div className={styles.tableWrapper}>
                            <table ref={tableRef} className={styles.statsTable}>
                                <thead>
                                <tr>
                                    <th className={styles.stickyCol1}>구분</th>
                                    <th className={styles.stickyCol2}>학년</th>
                                    <th className={styles.stickyCol3}>반</th>
                                    <th className={styles.stickyCol4}>이름</th>
                                    {sheetData.headerDates.map(date => (
                                        <th key={date}>{date}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {processedStudents.map((student, idx) => (
                                    <tr key={`${student.grade}-${student.classNo}-${student.name}-${idx}`}>
                                        {student.rowSpans.category > 0 && (
                                            <td className={styles.stickyCol1} rowSpan={student.rowSpans.category}>
                                                {getStatusText(student.status)}
                                            </td>
                                        )}
                                        {student.rowSpans.grade > 0 && (
                                            <td className={styles.stickyCol2} rowSpan={student.rowSpans.grade}>
                                                {getGradeText(student.grade)}
                                            </td>
                                        )}
                                        {student.rowSpans.classNo > 0 && (
                                            <td className={styles.stickyCol3} rowSpan={student.rowSpans.classNo}>
                                                {getClassText(student.grade, student.classNo)}
                                            </td>
                                        )}
                                        <td className={styles.stickyCol4} style={{ fontWeight: '500' }}>
                                            {student.name}
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
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                    !teacherSheetData ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>데이터가 없습니다.</div>
                    ) : (
                        <div className={styles.tableWrapper}>
                            <table ref={tableRef} className={styles.statsTable}>
                                <thead>
                                <tr>
                                    <th className={styles.stickyTeacherName}>이름</th>
                                    {teacherSheetData.headerDates.map(date => (
                                        <th key={date}>{date}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {teacherSheetData.teachers.map((teacher, idx) => (
                                    <tr key={`${teacher.name}-${idx}`}>
                                        <td className={styles.stickyTeacherName} style={{ fontWeight: '500' }}>
                                            {teacher.name}
                                        </td>
                                        {teacherSheetData.headerDates.map(date => {
                                            const isPresent = teacher.attendances.includes(date);
                                            return (
                                                <td key={date} className={isPresent ? styles.present : styles.absent}>
                                                    {isPresent ? 'O' : ''}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default CumulativeStatistics;