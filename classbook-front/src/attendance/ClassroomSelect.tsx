import {generatePath, useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import type {ClassroomSummary} from "../constants/types.tsx";
import {paths} from "../constants/paths.tsx";

const ClassroomSelect = () => {
    const navigate = useNavigate();
    const [classrooms, setClassrooms] = useState<ClassroomSummary[]>([]);
    const {grade} = useParams<{ grade: string }>();

    useEffect(() => {
        // LEE: axios로 추후 변경?
        fetch(`/api/attendances/classroom?grade=${grade}`)
            .then(res => res.json()) // 서버가 준 JSON을 해석
            .then(data => {
                // 성공하면 서버 데이터를 넣음
                setClassrooms(data);
            })
            .catch(err => {
                console.log("서버 연결 실패(테스트모드): 데모" + err);
                // 학년에 따라 다른 반 개수 보여주기 (테스트용 로직)
                setClassrooms([]); // 그 외
            });
    }, [grade]);

    return (
        <div className="content">
            <button className="go-back-btn" onPointerUp={() => navigate(-1)}>← 뒤로가기</button>
            <h3>{grade == '0' ? `1부` : `${grade}학년`} - 반 선택</h3>
            {classrooms.map((classroom) => (
                <button key={classroom.id} className="menu-btn"
                        onPointerUp={() => navigate(generatePath(paths.classroomSheet.url, {
                            grade: classroom.grade.toString(),
                            classNo: classroom.classNo
                        }))}>
                    {grade === '0' ?
                        (classroom.classNo === '1' ? '남자' : '여자')
                        : `${classroom.classNo}`}반
                    ({classroom.teacherName} 쌤)
                </button>
            ))}
        </div>
    );
};

export default ClassroomSelect;