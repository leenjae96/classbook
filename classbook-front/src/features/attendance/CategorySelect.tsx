import {generatePath, useNavigate} from "react-router-dom";
import {paths} from "../../constants/paths.tsx";
import BackButton from "../../components/common/BackButton.tsx";

const CategorySelect = () => {
    const navigate = useNavigate();
    const categories: number[] = [1, 2, 3, 0];

    return (
        <div className="content">
            <BackButton/>
            <h4>주일 출석</h4>
            {/* 여기서부터 새로 만든 반응형 그리드와 카드를 사용해 */}
            <div className="selection-grid">
                {categories.map((grade) => (
                    <button
                        key={grade}
                        className="selection-card"
                        onPointerUp={() => navigate(generatePath(paths.classroomSelect.url, { grade: grade.toString() }))}
                    >
                        {grade === 0 ? '1부 예배' : `${grade}학년`}
                    </button>
                ))}
                <button
                    className="selection-card"
                    onPointerUp={() => navigate(paths.administrativeTeacherSelect.url)}
                >
                    반목 외 교사
                </button>
                <button
                    className="selection-card"
                    onPointerUp={() => navigate(paths.newfriend.url)}
                >
                    새친구🌱
                </button>
            </div>

            <h4>토요일 출석</h4>
            <div className="selection-grid">
                <button
                    className="selection-card"
                    onPointerUp={() => navigate(paths.worshipTeamSelect.url)}
                >
                    찬양팀🎵
                </button>
            </div>
        </div>
    );
};

export default CategorySelect;