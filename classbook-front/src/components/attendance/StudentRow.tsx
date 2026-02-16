import { useRef, useState } from 'react';
import type {StudentCheck} from '../../constants/types';
import * as React from "react";

interface Props {
    studentCheck: StudentCheck;
    onToggle: (id: number) => void;
    onCommentChange: (id: number, comment: string) => void;
    // 새친구 페이지 등을 위해 우측에 추가 버튼 등을 넣을 수 있게 함
    renderRightAction?: (student: StudentCheck) => React.ReactNode;
}

export const StudentRow = ({ studentCheck, onToggle, onCommentChange, renderRightAction }: Props) => {
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
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', position: 'relative' }}>
            {/* 학생 버튼 */}
            <button
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                style={{
                    flex: 1,
                    padding: '15px',
                    fontSize: '13px',
                    backgroundColor: studentCheck.status ? '#4caf50' : '#e0e0e0',
                    color: studentCheck.status ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '5px',
                    marginRight: '10px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    touchAction: 'manipulation',
                    transition: 'background-color 0.3s',
                    minWidth: '90px'
                }}
                onPointerLeave={handlePointerLeave}
            >
                {studentCheck.studentName}
            </button>

            {/* 코멘츠 입력 */}
            <input
                type="text"
                placeholder="결석 사유 및 심방 내용"
                value={studentCheck.comments || ''}
                onChange={(e) => onCommentChange(studentCheck.id, e.target.value)}
                style={{ width: '50%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginRight: '5px' }}
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