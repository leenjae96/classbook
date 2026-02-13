import {generatePath, useNavigate} from "react-router-dom";
import {paths} from "../constants/paths.tsx";

const WorshipTeamSelect = () => {
    const navigate = useNavigate();
    const classes: string[] = ['싱어', '악기', '워십', '엔지니어'];

    return (
        <div className="content">
            <button className="go-back-btn" onPointerUp={() => navigate(-1)}>← 뒤로가기</button>
            <h3>팀 선택</h3>
            {classes.map((teamName) => (
                <button key={teamName} className="menu-btn"
                        onPointerUp={() => navigate(generatePath(paths.worshipTeamSheet.url, {teamName: teamName}))}>
                    {teamName}
                </button>
            ))}
        </div>
    );
};

export default WorshipTeamSelect;