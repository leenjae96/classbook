const ATTENDANCE_BASE = 'attendance';
const NOTICE_BASE = 'notice';
const STATISTICS_BASE = 'statistics';

export const paths = {
    root: '/',
    // - 출석 페이지
    attendanceCategorySelect: {
        url: ATTENDANCE_BASE
    }
    ,
    classroomSelect: {
        url: `/${ATTENDANCE_BASE}/grade/:grade`,
        api: ``
    },
    classroomSheet: {
        url: `/${ATTENDANCE_BASE}/grade/:grade/class/:classNo`,
        api: ``
    },
    administrativeTeacherSelect: {
        url: `/${ATTENDANCE_BASE}/administrative`,
        api: ``
    },
    administrativeTeacherSheet: {
        url: `/${ATTENDANCE_BASE}/administrative/teacher/:teacherId`,
        api: ``
    },
    newfriend: {
        url: `/${ATTENDANCE_BASE}/new-friend`,
        api: ``
    },
    worshipTeamSelect: {
        url: `/${ATTENDANCE_BASE}/worship`,
        api: ``
    },
    worshipTeamSheet: {
        url: `/${ATTENDANCE_BASE}/worship/team/:teamName`,
        api: ``
    },

    // - 공지 (Notice) ---
    noticeCategorySelect: {
        url: NOTICE_BASE,
        api: ``
    },

    // - 통계 (Statistics) ---
    statistics: {
        url: STATISTICS_BASE,
        api: ``
    }, // "statistics"
} as const;