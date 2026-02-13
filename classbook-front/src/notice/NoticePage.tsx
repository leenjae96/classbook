import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import type {BirthdayResponse, StudentBirthday, TeacherBirthday} from "../constants/types.tsx";

const NoticePage = () => {
    const navigate = useNavigate();
    const [birthdayResponse, setBirthdayResponse] = useState<BirthdayResponse>()

    useEffect(() => {
        // --- 가상의 서버 통신 로직 ---
        fetch(`/api/notice/birthday?month=2`)
            .then(res => res.json()) // 서버가 준 JSON을 해석
            .then(data => {
                // 성공하면 서버 데이터를 넣음

                console.log("서버에서 온 데이터:", data);
                setBirthdayResponse(data);
                console.log("newFriend : ", birthdayResponse)
            })
            .catch(err => {
                // ★ 아직 서버가 없으니 에러가 나겠죠?
                // 테스트를 위해 여기서 임시 데이터를 넣어줍니다.
                console.log("서버 연결 실패(테스트모드): 데모" + err);
                // 학년에 따라 다른 반 개수 보여주기 (테스트용 로직)
            });
    }, []);
    return (
        <div className="content">
            <button className="go-back-btn" onPointerUp={() => navigate(-1)}>← 뒤로가기</button>
            <h3>생일</h3>
            개발중인 페이지입니다.

            <div>{birthdayResponse?.month}월</div>
            {birthdayResponse?.studentBirthdays.map((studentBirthday: StudentBirthday) => (
                <div>
                    {studentBirthday.grade === 0
                        ? `1부`
                        : `${studentBirthday.grade}`
                    }
                    -
                    {studentBirthday.grade === 0
                        ? ``
                        : `${studentBirthday.classNo}`
                    }
                    {studentBirthday.name} : {studentBirthday.birthday}
                </div>
            ))}
            {birthdayResponse?.teacherBirthdays.map((teacherBirthday: TeacherBirthday) => (
                <div>{teacherBirthday.name} : {teacherBirthday.birthday} {teacherBirthday.isLunar ? `(음력)` : ''}</div>
            ))}
        </div>
    );
};

export default NoticePage;