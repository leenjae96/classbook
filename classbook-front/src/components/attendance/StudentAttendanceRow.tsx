import { useRef, useState } from 'react';
import type {StudentAttendance} from '../../constants/types';
import * as React from "react";

interface Props {
    studentCheck: StudentAttendance;
    onToggle: (id: number) => void;
    onCommentChange: (id: number, comment: string) => void;
    // 새친구 페이지 등을 위해 우측에 추가 버튼 등을 넣을 수 있게 함
    renderRightAction?: (student: StudentAttendance) => React.ReactNode;
    // 현재 시트 날짜 (yyyy-MM-dd) — 오늘 출석 체크 시 누적/최근일 계산에 사용
    sheetDate?: string;
}

// yyyy-MM-dd → MM/dd
const toMMdd = (d: string) => {
    const parts = d.split('-');
    return parts.length === 3 ? `${parts[1]}/${parts[2]}` : d;
};

export const StudentAttendanceRow = ({ studentCheck, onToggle, onCommentChange, renderRightAction, sheetDate }: Props) => {
    const timerRef = useRef<number | null>(null);
    const isLongPress = useRef(false);
    const [showInfo, setShowInfo] = useState(false); // 로컬 팝업 상태

    // 롱프레스 핸들러
    const handlePointerDown = () => {
        isLongPress.current = false;
        timerRef.current = window.setTimeout(() => {
            isLongPress.current = true;
            setShowInfo(true); // 정보창 켜기
        }, 700);
    };

    const handlePointerUp = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current); // 타이머 취소
            timerRef.current = null;
        }
        setShowInfo(false); // 정보창 끄기
        // 롱프레스가 아니었을 때만 체크 토글
        if (!isLongPress.current) {
            onToggle(studentCheck.id);
        }
        // 상태 초기화
        isLongPress.current = false;
    };

    const handlePointerLeave = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setShowInfo(false);

        isLongPress.current = false;
    };

    return (
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', marginBottom: '10px', position: 'relative' }}>
            {/* 학생 버튼 */}
            <button
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                style={{
                    flexBasis: '30%',
                    minWidth: '90px',
                    maxWidth: '180px',
                    flexShrink: 0, // 90px 이하로 찌그러짐 방지
                    padding: '15px',
                    fontSize: '14px',
                    backgroundColor: studentCheck.status ? '#4caf50' : '#e0e0e0',
                    color: studentCheck.status ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '5px',
                    marginRight: '10px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    touchAction: 'manipulation',
                    transition: 'background-color 0.3s'
                }}
                onPointerLeave={handlePointerLeave}
            >
                {studentCheck.studentName}
                {/* 새친구 누적 출석 표시: (N회)MM/dd — 누적 3회 이상인 새친구만 */}
                {(() => {
                    if (studentCheck.studentStatus !== 0 || studentCheck.pastAttendanceCount === null) return null;
                    // 오늘(시트 날짜) 출석 체크돼 있으면 누적/최근일에 포함
                    const presentToday = !!studentCheck.status;
                    const count = studentCheck.pastAttendanceCount + (presentToday ? 1 : 0);
                    if (count < 3) return null;
                    const lastDate = presentToday && sheetDate
                        ? sheetDate
                        : studentCheck.pastAttendanceLastDate;
                    return (
                        <span style={{
                            display: 'block',
                            fontSize: '9px',
                            fontWeight: 'bold',
                            color: '#e65100',
                            marginTop: '2px',
                            lineHeight: 1
                        }}>({count}회){lastDate ? toMMdd(lastDate) : ''}</span>
                    );
                })()}
            </button>

            {/* 코멘츠 입력 */}
            <input
                type="text"
                placeholder="결석 사유 및 심방 내용"
                value={studentCheck.comments || ''}
                onChange={(e) => onCommentChange(studentCheck.id, e.target.value)}
                style={{flexGrow: '1', width: '0', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginRight: '5px' }}
            />

            {/* 우측 추가 액션 (새친구 수정 버튼 등) */}
            {renderRightAction && renderRightAction(studentCheck)}

            {/* 롱프레스 정보창 (간단히 구현) */}
            {showInfo && (
                <div style={{
                    position: 'absolute', top: '-40px', left: '10%',
                    background: 'rgba(0,0,0,0.8)', color: 'white', padding: '5px 10px', borderRadius: '4px', zIndex: 10
                }}>
                    {studentCheck.studentName} 상세정보...
                </div>
            )}
        </div>
    );
};