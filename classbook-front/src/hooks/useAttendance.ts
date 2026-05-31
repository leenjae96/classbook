import {useCallback, useEffect, useState} from 'react';
import type {Sheet, StudentAttendance, TeacherAttendance, TeacherReport} from "../constants/types.tsx";
import {useNavigate} from "react-router-dom";
import {apiFetch} from "./api.ts";

// API 호출 함수가 prop으로 들어오거나, URL이 들어오도록 설계
interface UseAttendanceProps {
    apiEndpoint: string;
    initialDate?: string;
}

export const useAttendance = ({apiEndpoint, initialDate}: UseAttendanceProps) => {
    const navigate = useNavigate();

    const [selectedDate, setSelectedDate] = useState<string>(initialDate || new Date().toLocaleDateString('en-CA'));
    const [loading, setLoading] = useState(false);
    const [studentAttendances, setStudentAttendances] = useState<StudentAttendance[]>([]);
    const [teacherReport, setTeacherReport] = useState<TeacherReport>();
    const [teacherAttendances, setTeacherAttendances] = useState<TeacherAttendance[]>([]);
    // 1. 데이터 가져오기
    useEffect(() => {
        if (!apiEndpoint) return;

        setLoading(true);
        const urlWithDate = apiEndpoint.includes('date=')
            ? apiEndpoint
            : `${apiEndpoint}${apiEndpoint.includes('?') ? '&' : '?'}date=${selectedDate}`;
        apiFetch(urlWithDate)
            .then((data: Sheet) => {
                setStudentAttendances(data.studentAttendances || []);
                setTeacherReport(data.teacherReport || undefined);
                setTeacherAttendances(data.teacherAttendances || []);
            })
            .catch(err => {
                console.error("Fetch error:", err);
            })
            .finally(() => setLoading(false));
    }, [apiEndpoint, selectedDate]);

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
        if (teacherReport?.worship === -1) {
            alert('선생님 예배 여부를 선택해주세요.');
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
            alert('제출되었습니다!');
            navigate(-1);
            return true;
        } catch (e) {
            console.error(e);
            alert('제출 실패');
            return false;
        }
    }, [apiEndpoint, selectedDate, studentAttendances, teacherReport, teacherAttendances]);

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
        loading
    };
};