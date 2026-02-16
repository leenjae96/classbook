import {useCallback, useEffect, useState} from 'react';
import type {Sheet, StudentCheck, TeacherCheck} from "../constants/types.tsx";
import {useNavigate} from "react-router-dom";

// API 호출 함수가 prop으로 들어오거나, URL이 들어오도록 설계
interface UseAttendanceProps {
    apiEndpoint: string; // 예: `/api/attendances/sheet?grade=1...`
    initialDate?: string;
}

export const useAttendance = ({apiEndpoint, initialDate}: UseAttendanceProps) => {
    const navigate = useNavigate();

    const [selectedDate, setSelectedDate] = useState<string>(initialDate || new Date().toLocaleDateString('en-CA'));
    const [loading, setLoading] = useState(false);
    const [studentChecks, setStudentChecks] = useState<StudentCheck[]>([]);
    const [teacherCheck, setTeacherCheck] = useState<TeacherCheck>();

    // 1. 데이터 가져오기
    useEffect(() => {
        if (!apiEndpoint) return;

        setLoading(true);
        // query param에 date가 포함되어 있다고 가정하거나, 여기서 붙여줌
        const urlWithDate = apiEndpoint.includes('date=')
            ? apiEndpoint
            : `${apiEndpoint}${apiEndpoint.includes('?') ? '&' : '?'}date=${selectedDate}`;
        fetch(urlWithDate)
            .then(res => {
                if (!res.ok) throw Error(`responseError! status : ${res.status}`);
                return res.json();
            })
            .then((data: Sheet) => {
                setStudentChecks(data.studentChecks || []);
                setTeacherCheck(data.teacherCheck || undefined);
            })
            .catch(err => {
                console.error("Fetch error:", err);
            })
            .finally(() => setLoading(false));
    }, [apiEndpoint, selectedDate]);

    // 2. 출석 상태 토글
    const toggleStatus = useCallback((id: number) => {
        setStudentChecks(prev => prev.map(s =>
            s.id === id ? {...s, status: !s.status} : s
        ));
    }, []);

    // 3. 코멘트 수정
    const updateComment = useCallback((id: number, comment: string) => {
        setStudentChecks(prev => prev.map(s =>
            s.id === id ? {...s, comments: comment} : s
        ));
    }, []);

    const handleWorshipChange = (worship: number) => {
        setTeacherCheck(prev => {
            if (!prev) return prev;
            return {...prev, worship: worship}
        });
    }

    const handleOtnChange = (otn: number) => {
        setTeacherCheck(prev => {
            if (!prev) return prev;
            return {...prev, otn: otn === 1}
        })
    }

    const handleDawnPrayChange = (dawnPray: number) => {
        setTeacherCheck(prev => {
            if (!prev) return prev;
            return {...prev, dawnPray: dawnPray}
        })
    }

    const handleTeacherCommentsChange = (comments: string) => {
        setTeacherCheck(prev => {
            if (!prev) return prev;
            return {...prev, comments: comments}
        })
    }

    // 4. 제출 (서버로 POST)
    const submitAttendance = useCallback(async () => {
        if (new Date(selectedDate).getDay() !== 0) {
            alert('일요일만 출석 제출이 가능해요.');
            return;
        }
        if (teacherCheck?.worship === -1) {
            alert('선생님 예배 여부를 선택해주세요.');
            return;
        }

        // 일요일 체크 로직 등은 여기서 하거나 컴포넌트에서 수행
        try {
            await fetch(`/api/attendances/sheet?date=${selectedDate}`, { // 엔드포인트는 상황에 맞게 조정 필요
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    studentChecks: studentChecks,
                    teacherCheck: {
                        ...teacherCheck,
                        dawnPray: teacherCheck?.dawnPray ?? 0
                    }
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
    }, [apiEndpoint, selectedDate, studentChecks, teacherCheck]);

    return {
        selectedDate,
        setSelectedDate,
        studentChecks,
        teacherCheck,
        toggleStatus,
        handleStudentCommentsChange: updateComment,
        submitAttendance,
        handleWorshipChange,
        handleOtnChange,
        handleDawnPrayChange,
        handleTeacherCommentsChange,
        loading
    };
};