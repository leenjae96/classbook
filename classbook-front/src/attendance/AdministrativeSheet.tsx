import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import type {Sheet, TeacherCheck} from "../constants/types.tsx";

const AdministrativeSheet = () => {
    const navigate = useNavigate();
    const {teacherId} = useParams();
    const [teacherCheck, setTeacherCheck] = useState<TeacherCheck>();
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString('en-CA'));
    const isSunday = new Date(selectedDate).getDay() == 0;

    useEffect(() => {
        // --- 가상의 서버 통신 로직 ---
        fetch(`/api/attendances/sheet?teacherId=${teacherId}&date=${selectedDate}`)
            .then(res => res.json()) // 서버가 준 JSON을 해석
            .then((data: Sheet) => {
                console.log("서버에서 온 데이터:", data);
                setTeacherCheck(data.teacherCheck);
            })
            .catch(err => {
                // ★ 아직 서버가 없으니 에러가 나겠죠?
                // 테스트를 위해 여기서 임시 데이터를 넣어줍니다.
                console.log("서버 연결 실패 : " + err);
            });
    }, []);


    const handleWorshipChange = (worship: number) => {
        setTeacherCheck(prev => {
            if (!prev) return prev;
            return {...prev, worship: worship}
        });
    }

    const handleOtnChange = (otn: boolean) => {
        setTeacherCheck(prev => {
            if (!prev) return prev;
            return {...prev, otn: otn}
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

    const handleSubmit = () => {
        if (new Date(selectedDate).getDay() !== 0) {
            alert('일요일만 제출이 가능해요.');
            return;
        }
        if (teacherCheck?.worship === -1) {
            alert('선생님 예배 여부를 선택해주세요.');
            return;
        }

        fetch(`/api/attendances/sheet?teacherId=${teacherId}&date=${selectedDate}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                studentChecks: null,
                teacherCheck: {
                    ...teacherCheck
                }
            }),
        })
            .then(res => console.log(res));
        alert('제출되었습니다!');
        navigate(-1);
    };

    return (
        <div className="content">
            <button className="go-back-btn" onPointerUp={() => navigate(-1)}>← 뒤로가기</button>
            <h3>선생님 출석</h3>

            {/* 1. 날짜 선택기 */}
            <div style={{
                marginBottom: '20px',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #ddd'
            }}>
                <label style={{marginRight: '10px', fontWeight: 'bold'}}>날짜:</label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{padding: '5px', fontSize: '15px', borderRadius: '4px', border: '1px solid #ccc'}}
                />
            </div>
            {/*{isSunday &&*/}
            {isSunday &&
                <div>
                    {/* 선생님 출석 */}
                    <div style={{marginBottom: '20px'}}>
                        <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>주일 예배 참석 <span
                            style={{color: 'red'}}>*</span></label>
                        <select
                            value={teacherCheck?.worship}
                            onChange={(e) => handleWorshipChange(Number(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '10px',
                                fontSize: '16px',
                                borderRadius: '5px',
                                border: '1px solid #ccc',
                            }}
                        >
                            <option value={-1} disabled hidden>선택하세요</option>
                            <option value={1}>1부</option>
                            <option value={2}>2부</option>
                            <option value={3}>3부</option>
                            <option value={4}>4부</option>
                            <option value={5}>5부</option>
                            <option value={6}>6부</option>
                            <option value={0}>안 드림</option>
                        </select>
                    </div>

                    {/* 2. OTN */}
                    <div style={{marginBottom: '20px'}}>
                        <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>OTN 참석</label>
                        <select
                            value={teacherCheck?.otn ? 1 : 0}
                            onChange={(e) => handleOtnChange(Boolean(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '10px',
                                fontSize: '16px',
                                borderRadius: '5px',
                                border: '1px solid #ccc'
                            }}
                        >
                            <option value={1}>참석</option>
                            <option value={0}>불참</option>
                        </select>
                    </div>

                    {/* 3. 새벽기도 */}
                    <div style={{marginBottom: '20px'}}>
                        <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>새벽기도 참석</label>
                        <select
                            value={teacherCheck?.dawnPray ?? -1}
                            onChange={(e) => handleDawnPrayChange(Number(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '10px',
                                fontSize: '16px',
                                borderRadius: '5px',
                                border: '1px solid #ccc'
                            }}
                        >
                            <option value={0}>0 회</option>
                            <option value={1}>1 회</option>
                            <option value={2}>2 회</option>
                            <option value={3}>3 회</option>
                            <option value={4}>4 회</option>
                            <option value={5}>5 회</option>
                        </select>
                    </div>

                    {/* 건의사항 */}
                    <textarea
                        placeholder="선생님 심방, 기도제목을 적어주세요."
                        style={{
                            width: '95%',
                            height: '80px',
                            marginBottom: '10px',
                            padding: '10px',
                            borderRadius: '5px'
                        }}
                        onChange={(e) => handleTeacherCommentsChange(e.target.value)}
                    />

                    <button
                        className="menu-btn"
                        onClick={handleSubmit}
                        style={{backgroundColor: '#28a745'}}
                    >
                        제출하기
                    </button>
                </div>}


            {/* 만약 일요일 아닐 때 안내 문구를 띄우고 싶다면 */}
            {isSunday && <div>(보고서는 주일에만 제출 가능합니다)</div>}
        </div>
    );
}

export default AdministrativeSheet