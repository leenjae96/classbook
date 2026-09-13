import {useNavigate} from "react-router-dom";
import BackButton from "../../components/common/BackButton.tsx";
import {paths} from "../../constants/paths.tsx";

// 게시판 메인: 생일자 확인 / 새친구·등반 / 주금새(예정)
const BoardPage = () => {
    const navigate = useNavigate();

    return (
        <div className="content">
            <BackButton/>
            <h4>게시판</h4>
            <div className="selection-grid">
                <button
                    className="selection-card"
                    onClick={() => navigate(paths.birthday.url)}
                >
                    생일자 확인
                </button>
                <button
                    className="selection-card"
                    onClick={() => navigate(paths.newFriendWeekly.url)}
                >
                    새친구/등반
                </button>
                <button
                    className="selection-card"
                    disabled
                    style={{opacity: 0.5, cursor: 'not-allowed'}}
                >
                    주금새(예정)
                </button>
            </div>
        </div>
    );
};

export default BoardPage;
