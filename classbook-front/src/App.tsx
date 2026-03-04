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
import Layout from "./components/layout/Layout.tsx";
import AdminCategorySelect from "./features/administrator/AdminCategorySelect.tsx";


const Home = () => {
    const navigate = useNavigate();
    return (
        <div className="content">
            <h2>메인 메뉴</h2>
            <button className="menu-btn" onPointerUp={() => navigate(paths.attendanceCategorySelect.url)}>출석 교사보고서</button>
            <button className="menu-btn" onPointerUp={() => navigate(paths.noticeCategorySelect.url)}>공지</button>
            <button className="menu-btn" onPointerUp={() => navigate(paths.statistics.url)}>출석 통계</button>
            <hr style={{margin: '10px 0 20px 0'}}/>
            <button className="menu-btn" onPointerUp={() => navigate(paths.administrator.url)}>관리자</button>
        </div>
    );
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
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
                    <Route path={paths.administrator.url} element={<AdminCategorySelect/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;