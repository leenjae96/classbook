import * as XLSX from 'xlsx-js-style';
import { apiFetch } from '../hooks/api.ts';

export interface StudentExportRow {
    id: number;
    teacherName: string | null;
    grade: number | null;
    classNo: string | null;
    name: string;
    school: string | null;
    gender: boolean | null;
    evangelist: string | null;
    birthday: string | null;      // yyyy-MM-dd
    phone: string | null;
    parentPhone: string | null;
    address: string | null;
    remark: string | null;
    registeredAt: string | null;  // yyyy-MM-dd
    status: number;
    attendanceGrade: string;      // A/B/C/D
}

const genderLabel = (g: boolean | null): string => (g === true ? '남' : g === false ? '여' : '');

// 학년 표기: 별분 → '별분', 1부(0) → '1부', 그 외 → '2-5'
const gradeClassLabel = (grade: number | null, classNo: string | null, status: number): string => {
    if (status === 3) return '별분';
    if (grade === null || grade === undefined) return '';
    if (grade === 0) return '1부';
    return classNo ? `${grade}-${classNo}` : `${grade}`;
};

const ymd = (d: string | null): string => (d ? d : '');
const md = (d: string | null): string => {
    if (!d) return '';
    const p = d.split('-');
    return p.length === 3 ? `${Number(p[1])}/${Number(p[2])}` : d;
};

const HEADER_STYLE = { font: { bold: true }, alignment: { horizontal: 'center', vertical: 'center' } } as const;
const TITLE_STYLE = { font: { bold: true, sz: 12 } } as const;

const styleRow = (ws: XLSX.WorkSheet, rowIdx: number, colCount: number, style: object) => {
    for (let c = 0; c < colCount; c++) {
        const ref = XLSX.utils.encode_cell({ r: rowIdx, c });
        if (ws[ref]) ws[ref].s = style;
    }
};

const today = () => new Date().toLocaleDateString('en-CA'); // yyyy-MM-dd

// 전체 인적사항 다운로드
export const downloadAllStudents = (rows: StudentExportRow[]) => {
    const total = rows.length;
    const sepCount = rows.filter(r => r.status === 3).length;

    const header = ['번호', '학년', '담당쌤', '이름', '학교', '성', '전도자', '생년월일', '연락처', '부모님', '주소', '특이사항', '출석'];
    const summary = ['별분반', sepCount, '출석인원', total, '총 제적', `${total}명`];

    const aoa: (string | number)[][] = [summary, header];
    rows.forEach((r, i) => {
        aoa.push([
            i + 1,
            gradeClassLabel(r.grade, r.classNo, r.status),
            r.teacherName ?? '',
            r.name ?? '',
            r.school ?? '',
            genderLabel(r.gender),
            r.evangelist ?? '',
            ymd(r.birthday),
            r.phone ?? '',
            r.parentPhone ?? '',
            r.address ?? '',
            r.remark ?? '',
            r.attendanceGrade ?? '',
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = [6, 7, 9, 9, 8, 4, 9, 12, 14, 14, 30, 40, 6].map(w => ({ wch: w }));
    styleRow(ws, 0, header.length, TITLE_STYLE);
    styleRow(ws, 1, header.length, HEADER_STYLE);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '인적사항');
    XLSX.writeFile(wb, `전체_인적사항_${today()}.xlsx`);
};

// 새친구 인적사항 다운로드 (status=0, 등록일 포함 + ABCD)
export const downloadNewFriends = (rows: StudentExportRow[]) => {
    const news = rows.filter(r => r.status === 0);
    const count = news.length;

    const header = ['등록일', '학년/반', '담당쌤', '이름', '학교', '성별', '전도자', '생년월일', '연락처', '부모님', '주소', '특이사항', '출석'];
    const summary = ['새친구 등록', '', `${count}명`];

    const aoa: (string | number)[][] = [summary, header];
    news.forEach(r => {
        aoa.push([
            md(r.registeredAt),
            gradeClassLabel(r.grade, r.classNo, r.status),
            r.teacherName ?? '',
            r.name ?? '',
            r.school ?? '',
            genderLabel(r.gender),
            r.evangelist ?? '',
            ymd(r.birthday),
            r.phone ?? '',
            r.parentPhone ?? '',
            r.address ?? '',
            r.remark ?? '',
            r.attendanceGrade ?? '',
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = [7, 8, 9, 9, 8, 5, 9, 12, 14, 14, 30, 40, 6].map(w => ({ wch: w }));
    styleRow(ws, 0, header.length, TITLE_STYLE);
    styleRow(ws, 1, header.length, HEADER_STYLE);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '새친구');
    XLSX.writeFile(wb, `새친구_인적사항_${today()}.xlsx`);
};

// export 데이터 조회
export const fetchStudentExport = (): Promise<StudentExportRow[]> =>
    apiFetch('/api/administrator/students/export');
