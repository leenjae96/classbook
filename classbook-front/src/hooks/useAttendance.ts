import {useCallback, useEffect, useState} from 'react';
import type {Sheet, StudentAttendance, TeacherAttendance, TeacherReport} from "../constants/types.tsx";
import {apiFetch} from "./api.ts";

// API 호출 함수가 prop으로 들어오거나, URL이 들어오도록 설계
interface UseAttendanceProps {
    apiEndpoint: string;
    initialDate?: string;
}

export const useAttendance = ({apiEndpoint, initialDate}: UseAttendanceProps) => {
    const [selectedDate, setSelectedDate] = useState<string>(initialDate || new Date().toLocaleDateString('en-CA'));
    const [loading, setLoading] = useState(false);
    const [studentAttendances, setStudentAttendances] = useState<StudentAttendance[]>([]);
    const [teacherReport, setTeacherReport] = useState<TeacherReport>();
    const [teacherAttendances, setTeacherAttendances] = useState<TeacherAttendance[]>([]);
    // 서버 시각 - 클라이언트 시각 보정값(ms). 저장 마감(14:00) 판단을 서버 기준으로 하기 위함.
    const [serverOffsetMs, setServerOffsetMs] = useState<number | null>(null);

    const buildSheetUrl = useCallback(() => (
        apiEndpoint.includes('date=')
            ? apiEndpoint
            : `${apiEndpoint}${apiEndpoint.includes('?') ? '&' : '?'}date=${selectedDate}`
    ), [apiEndpoint, selectedDate]);

    // 1. 데이터 가져오기
    useEffect(() => {
        if (!apiEndpoint) return;

        setLoading(true);
        apiFetch(buildSheetUrl())
            .then((data: Sheet) => {
                setStudentAttendances(data.studentAttendances || []);
                setTeacherReport(data.teacherReport || undefined);
                setTeacherAttendances(data.teacherAttendances || []);
                if (data.serverEpochMillis != null) {
                    setServerOffsetMs(data.serverEpochMillis - Date.now());
                }
            })
            .catch(err => {
                console.error("Fetch error:", err);
            })
            .finally(() => setLoading(false));
    }, [apiEndpoint, buildSheetUrl]);

    // 학생 명단만 다시 불러오기 (새친구 추가 직후 등).
    // 저장 전 체크한 출석/코멘트는 그대로 두고, 새로 생긴 학생만 명단에 합친다.
    const refreshStudents = useCallback(async () => {
        if (!apiEndpoint) return;
        try {
            const data: Sheet = await apiFetch(buildSheetUrl());
            setStudentAttendances(prev => {
                const local = new Map(prev.map(s => [s.id, s]));
                return (data.studentAttendances || []).map(s => {
                    const mine = local.get(s.id);
                    return mine ? {...s, status: mine.status, comments: mine.comments} : s;
                });
            });
        } catch (err) {
            console.error("명단 갱신 실패:", err);
        }
    }, [apiEndpoint, buildSheetUrl]);

    // 2. 출석 상태 토글
    const toggleStudentAttendance = useCallback((id: number) => {
        setStudentAttendances(prev => prev.map(s =>
            s.id === id ? {...s, status: !s.status} : s
        ));
    }, []);

    // 3. 코멘트 수정
    const updateStudentAttendanceComment = useCallback((id: number, comments: string) => {
        setStudentAttendances(prev => prev.map(s =>
            s.id === id ? {...s, comments: comments} : s
        ));
    }, []);

    const handleWorshipChange = (worship: number) => {
        setTeacherReport(prev => {
            if (!prev) return prev;
            return {...prev, worship: worship}
        });
    }

    const handleOtnChange = (otn: number) => {
        setTeacherReport(prev => {
            if (!prev) return prev;
            return {...prev, otn: otn === 1}
        })
    }

    const handleDawnPrayChange = (dawnPray: number) => {
        setTeacherReport(prev => {
            if (!prev) return prev;
            return {...prev, dawnPray: dawnPray}
        })
    }

    const handleTeacherReportCommentChange = (comments: string) => {
        setTeacherReport(prev => {
            if (!prev) return prev;
            return {...prev, comments: comments}
        })
    }

    const toggleTeacherAttendance = useCallback((id: number) => {
        setTeacherAttendances(prev => prev.map(s =>
            s.id === id ? {...s, status: !s.status} : s
        ));
    }, []);

    // 3. 코멘트 수정
    const updateTeacherAttendanceComment = useCallback((id: number, comment: string) => {
        setTeacherAttendances(prev => prev.map(s =>
            s.id === id ? {...s, comments: comment} : s
        ));
    }, []);

    // 4. 제출 (서버로 POST)
    const submitAttendance = useCallback(async () => {
        if (new Date(selectedDate).getDay() !== 0) {
            alert('일요일만 출석 제출이 가능해요.');
            return;
        }
        // 주금새(예배/금요/새벽)는 미입력이어도 저장 허용 — 1부 선생님이 2부 아이들 출석만 저장하는 경우가 있음
        // 서버 시각 기준 당일 14:00 마감 (선제 차단; 백엔드도 동일하게 검증)
        const cutoffMs = new Date(`${selectedDate}T14:00:00+09:00`).getTime();
        if (Date.now() + (serverOffsetMs ?? 0) >= cutoffMs) {
            alert('오후 2시가 지나 저장할 수 없습니다.');
            return;
        }

        try {
            await apiFetch(`/api/attendances/sheet?date=${selectedDate}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    studentAttendances: studentAttendances,
                    teacherReport: teacherReport ?? null,
                    teacherAttendances: teacherAttendances
                }),
            });
            alert('저장되었습니다!');
            // 현재 페이지를 새로고침해 저장된 최신 데이터로 다시 로드
            window.location.reload();
            return true;
        } catch (e) {
            console.error(e);
            alert(e instanceof Error && e.message ? e.message : '저장 실패');
            return false;
        }
    }, [apiEndpoint, selectedDate, studentAttendances, teacherReport, teacherAttendances, serverOffsetMs]);

    return {
        selectedDate,
        setSelectedDate,
        studentAttendances,
        toggleStudentAttendance,
        updateStudentAttendanceComment,
        teacherReport,
        handleWorshipChange,
        handleOtnChange,
        handleDawnPrayChange,
        handleTeacherReportCommentChange,
        submitAttendance,
        teacherAttendances,
        toggleTeacherAttendance,
        updateTeacherAttendanceComment,
        loading,
        serverOffsetMs,
        refreshStudents
    };
};