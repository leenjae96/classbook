import {useEffect, useState, useMemo, useRef} from 'react';
import { apiFetch } from "../../hooks/api.ts";
import { getMostRecentSunday } from "../../util/dateUtils.tsx";
import BackButton from "../../components/common/BackButton.tsx";
import styles from './CumulativeStatistics.module.css';
import * as XLSX from 'xlsx-js-style';

interface StudentAttendanceSummary {
    status: number;
    grade: number;
    classNo: string;
    name: string;
    attendances: string[];
}

interface CumSheet {
    headerDates: string[];
    students: StudentAttendanceSummary[];
}

// 병합 정보가 추가된 확장 타입
interface ProcessedStudent extends StudentAttendanceSummary {
    rowSpans: {
        category: number;
        grade: number;
        classNo: number;
    };
}

const CumulativeStatistics = () => {
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [sheetData, setSheetData] = useState<CumSheet | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const tableRef = useRef<HTMLTableElement>(null);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const startDate = `${selectedYear}-01-01`;
            const currentYear = new Date().getFullYear();
            const endDate = selectedYear === currentYear ? getMostRecentSunday() : `${selectedYear}-12-31`;

            const data: CumSheet = await apiFetch(`/api/administrator/cumulative-stats?startDate=${startDate}&endDate=${endDate}`);
            setSheetData(data);
        } catch (error) {
            console.error("누적 통계 로드 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [selectedYear]);

    // ✨ 텍스트 축약 (폭을 줄이기 위해 한/두 글자로 단축)
    const getStatusText = (status: number) => {
        if (status === 0) return '새친구';
        if (status === 3) return '별분';
        return ''; // 일반 학생은 공백 유지 (공간 절약)
    };
    const getGradeText = (grade: number) => grade === 0 ? '1부' : `${grade}`; // "1학년" -> "1"
    const getClassText = (grade: number, classNo: string) => {
        if (grade === 0) return classNo === '0' ? '여' : '남'; // "여자반" -> "여"
        return `${classNo}`; // "1반" -> "1"
    };

    // 2. 엑셀 다운로드 실행 함수
    const handleDownloadExcel = () => {
        if (!tableRef.current) return;

        // 목표 2: 파일명으로 사용할 endDate 계산
        const currentYear = new Date().getFullYear();
        const endDate = selectedYear === currentYear ? getMostRecentSunday() : `${selectedYear}-12-31`;

        // 목표 1: raw: true 옵션을 주어 엑셀이 날짜를 맘대로 2001년으로 변환하지 못하게 함
        const wb = XLSX.utils.table_to_book(tableRef.current, { sheet: "출석통계", raw: true });

        // 방금 만들어진 시트 가져오기
        const ws = wb.Sheets["출석통계"];

        // 목표 3: 시트 안의 모든 셀(칸)을 돌면서 상하좌우 가운데 정렬 적용
        for (const key in ws) {
            if (key.startsWith('!')) continue; // !ref, !merges 같은 엑셀 내부 설정값은 건너뜀

            if (ws[key]) {
                ws[key].s = {
                    alignment: {
                        vertical: "center",   // 상하 가운데
                        horizontal: "center"  // 좌우 가운데
                    }
                };
            }
        }

        XLSX.writeFile(wb, `${endDate}_출석누적통계.xlsx`);
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
                    <h4>출석 누적 통계</h4>
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
                ) : !sheetData ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>데이터가 없습니다.</div>
                ) : (
                    /* ✨ 꼬여있던 중첩 태그들을 제거하고 깔끔하게 1개의 wrapper와 1개의 table만 남겼습니다! */
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
                )}
            </div>
        </div>
    );
};

export default CumulativeStatistics;