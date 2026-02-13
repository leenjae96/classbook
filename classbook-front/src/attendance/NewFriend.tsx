import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import type {StudentInfo} from "../constants/types.tsx";

const NewFriend = () => {
    const navigate = useNavigate();
    const [newFriends, setNewFriends] = useState<StudentInfo[]>([]);

    // 1. 날짜 선택
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString('en-CA'));

    useEffect(() => {
        // --- 가상의 서버 통신 로직 ---
        fetch('/api/attendances/newFriend')
            .then(res => {
                if (!res.ok) throw Error(`responseError! status : ${res.status}`)
                return res.json();
            })
            .then((data: StudentInfo[]) => {
                setNewFriends(data);
            })
            .catch(err => {
                // ★ 아직 서버가 없으니 에러가 나겠죠?
                // 테스트를 위해 여기서 임시 데이터를 넣어줍니다.
                console.log("서버 연결 실패(테스트모드): 데모" + err);
                // 학년에 따라 다른 반 개수 보여주기 (테스트용 로직)
                setNewFriends([]); // 그 외
            });
    }, [selectedDate]);
    return (
        <div className="content">
            <button className="go-back-btn" onPointerUp={() => navigate(-1)}>← 뒤로가기</button>
            <h3>새친구 목록</h3>
            개발중인 페이지입니다.

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

            <div className="student-list">
                {newFriends.map((studentInfo: StudentInfo) => (
                    <div key={studentInfo.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '10px'
                    }}
                    >
                        {/* 학생 버튼 */}
                        <button
                            style={{
                                flex: 1,
                                padding: '15px',
                                fontSize: '13px',
                                backgroundColor: '#e0e0e0',
                                color: 'black',
                                border: 'none',
                                borderRadius: '5px',
                                marginRight: '10px',
                                //(마우스의경우)올렸을때 손가락 모양으로 바뀜
                                cursor: 'pointer',
                                //버튼 내부 텍스트를 긁지 못하도록
                                userSelect: 'none',
                                WebkitUserSelect: 'none',
                                //버튼에 대해서 스크롤과 패닝만 가능(더블탭 기능 삭제)
                                touchAction: 'manipulation',
                                transition: 'background-color 0.3s',
                                minWidth: '90px'
                            }}
                        >
                            {studentInfo.name}
                        </button>

                    </div>
                ))}

            </div>
        </div>
    );
}

export default NewFriend;