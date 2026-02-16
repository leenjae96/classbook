import {BrowserRouter, Route, Routes, useNavigate} from "react-router-dom";
import {paths} from "./constants/paths.tsx";
import CategorySelect from "./features/attendance/CategorySelect.tsx";
import ClassroomSelect from "./features/attendance/ClassroomSelect.tsx";
import ClassroomSheet from "./features/attendance/ClassroomSheet.tsx";
import AdministrativeSelect from "./features/attendance/AdministrativeSelect.tsx";
import AdministrativeSheet from "./features/attendance/AdministrativeSheet.tsx";
import NewFriend from "./features/attendance/NewFriend.tsx";
import WorshipTeamSelect from "./features/attendance/WorshipTeamSelect.tsx";
import WorshipTeamSheet from "./features/attendance/WorshipTeamSheet.tsx";
import NoticePage from "./features/notice/NoticePage.tsx";
import StatisticsPage from "./features/statistics/StatisticsPage.tsx";
import './App.css';

const Home = () => {
    const navigate = useNavigate();
    return (
        <div className="content">
            <h2>메인 메뉴</h2>
            <button className="menu-btn" onPointerUp={() => navigate(paths.attendanceCategorySelect.url)}>출석 교사보고서</button>
            <button className="menu-btn" onPointerUp={() => navigate(paths.noticeCategorySelect.url)}>공지</button>
            <button className="menu-btn" onPointerUp={() => navigate(paths.statistics.url)}>출석 통계</button>
        </div>
    );
};

function App() {
    return (
        <div className="mobile-container">
            <BrowserRouter>
                <Routes>
                    <Route path={paths.root} element={<Home/>}/>

                    <Route path={paths.attendanceCategorySelect.url} element={<CategorySelect/>}/>
                    <Route path={paths.classroomSelect.url} element={<ClassroomSelect/>}/>
                    <Route path={paths.classroomSheet.url} element={<ClassroomSheet/>}/>
                    <Route path={paths.administrativeTeacherSelect.url} element={<AdministrativeSelect/>}/>
                    <Route path={paths.administrativeTeacherSheet.url} element={<AdministrativeSheet/>}/>
                    <Route path={paths.newfriend.url} element={<NewFriend/>}/>
                    <Route path={paths.worshipTeamSelect.url} element={<WorshipTeamSelect/>}/>
                    <Route path={paths.worshipTeamSheet.url} element={<WorshipTeamSheet/>}/>

                    <Route path={paths.noticeCategorySelect.url} element={<NoticePage/>}/>

                    <Route path={paths.statistics.url} element={<StatisticsPage/>}/>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;