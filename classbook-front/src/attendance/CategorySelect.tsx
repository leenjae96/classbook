import {generatePath, useNavigate} from "react-router-dom";
import {paths} from "../constants/paths.tsx";

const CategorySelect = () => {
    const navigate = useNavigate();
    const categories: number[] = [1, 2, 3, 0];

    return (
        <div className="content">
            <button className="go-back-btn" onClick={() => navigate(-1)}>← 뒤로가기</button>
            <h3>학년 선택</h3>
            {categories.map((grade) => (
                <button key={grade} className="menu-btn"
                        onPointerUp={() => navigate(generatePath(paths.classroomSelect.url, {grade: grade.toString()}))}>
                    {grade === 0 ? '1부' : `${grade}학년`}
                </button>
            ))}
            <div className="half-btn-group">
                <button key='new-friends' className="menu-btn"
                        onPointerUp={() => navigate(paths.administrativeTeacherSelect.url)}>
                    반목 외
                </button>

                <button key='new-friends' className="menu-btn"
                        onPointerUp={() => navigate(paths.newfriend.url)}>
                    새친구
                </button>
            </div>
            <button key='worshipTeam' className="menu-btn"
                    onPointerUp={() => navigate(paths.worshipTeamSelect.url)}>
                찬양팀
            </button>

        </div>
    );
};

export default CategorySelect;