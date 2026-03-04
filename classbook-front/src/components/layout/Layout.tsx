// src/components/layout/Layout.tsx
import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { paths } from '../../constants/paths.tsx';

const Layout = () => {
    const [isPinned, setIsPinned] = useState(window.innerWidth > 600);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // ✨ 마우스 호버 상태를 React로 직접 제어 (새로 추가)
    const [isHovered, setIsHovered] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 600) {
                setIsMobileOpen(false);
            } else {
                setIsMobileOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        if (window.innerWidth <= 600) {
            setIsMobileOpen(!isMobileOpen);
        } else {
            setIsPinned(!isPinned);
            // ✨ 고정을 푸는 순간(닫힘 버튼 클릭), 강제로 호버 상태도 false로 만들어서 즉시 닫히게 함
            if (isPinned) {
                setIsHovered(false);
            }
        }
    };

    // ✨ 메뉴 클릭을 제어하는 통합 함수 (새로 추가)
    const handleMenuClick = (path: string) => {
        if (location.pathname === path) {
            // 1. 현재 페이지를 다시 클릭한 경우: 새로고침
            window.location.reload();
        } else {
            // 2. 다른 페이지인 경우: 이동
            navigate(path);
        }

        // 이동하거나 새로고침 할 때 모바일 사이드바는 무조건 닫음
        if (window.innerWidth <= 600) {
            setIsMobileOpen(false);
        }
    };

    return (
        <div className="layout-container">
            <div className={`sidebar-spacer ${isPinned ? 'pinned' : 'unpinned'}`} />

            {/* ✨ CSS :hover 대신 onMouseEnter, onMouseLeave 이벤트를 사용해서 클래스 부여 */}
            <aside
                className={`sidebar ${isPinned ? 'pinned' : 'unpinned'} ${!isPinned && isHovered ? 'hover-expanded' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="sidebar-header">
                    <h2 className="logo-text">주일학교 출석</h2>
                    <button className="toggle-btn" onClick={toggleSidebar}>
                        {isPinned && window.innerWidth > 600 ? '◂' : '☰'}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {/* ✨ onClick 이벤트를 handleMenuClick으로 모두 변경 */}
                    <button onClick={() => handleMenuClick('/')}>
                        <span className="icon">🏠</span>
                        <span className="menu-text">대시보드 홈</span>
                    </button>
                    <button onClick={() => handleMenuClick(paths.attendanceCategorySelect.url)}>
                        <span className="icon">📝</span>
                        <span className="menu-text">출석 교사보고서</span>
                    </button>
                    <button onClick={() => handleMenuClick(paths.noticeCategorySelect.url)}>
                        <span className="icon">📢</span>
                        <span className="menu-text">공지사항</span>
                    </button>
                    <button onClick={() => handleMenuClick(paths.statistics.url)}>
                        <span className="icon">📊</span>
                        <span className="menu-text">출석 통계</span>
                    </button>
                    <button onClick={() => handleMenuClick(paths.administrator.url)}>
                        <span className="icon">⚙️</span>
                        <span className="menu-text">관리자 메뉴</span>
                    </button>
                </nav>
            </aside>

            {isMobileOpen && <div className="mobile-overlay" onClick={() => setIsMobileOpen(false)} />}

            <main className="main-content">
                <header className="mobile-header">
                    <button className="toggle-btn" onClick={toggleSidebar}>☰</button>
                    <h2>주일학교 출석</h2>
                </header>

                <div className="page-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;