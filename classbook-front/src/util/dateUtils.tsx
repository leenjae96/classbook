// 날짜 관련 공통 로직을 모아두는 유틸 파일이야.

/**
 * 오늘을 기준으로 가장 최근의 일요일(주일) 날짜를 YYYY-MM-DD 형태로 반환.
 * 만약 오늘이 일요일이면 오늘 날짜를 반환.
 */
export const getMostRecentSunday = (): string => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0: 일, 1: 월, ... 6: 토
    // 오늘 날짜에서 요일 index만큼 빼면 가장 최근 일요일이 돼!
    const diff = today.getDate() - dayOfWeek;
    const sunday = new Date(today.setDate(diff));

    return sunday.toLocaleDateString('en-CA'); // 'YYYY-MM-DD' 포맷
};

export const getMostRecentSaturday = (): string => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0: 일, 1: 월, ... 6: 토

    const diff = dayOfWeek == 6 ? dayOfWeek : today.getDate() - dayOfWeek - 1;
    const saturday = new Date(today.setDate(diff));

    return saturday.toLocaleDateString('en-CA'); // 'YYYY-MM-DD' 포맷
};

// 선택한 날짜 기준으로 바로 직전 일요일 반환 (이미 일요일이면 그대로)
export const snapToSunday = (date: string): string => {
    const d = new Date(date + 'T12:00:00');
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0) return date;
    d.setDate(d.getDate() - dayOfWeek);
    return d.toLocaleDateString('en-CA');
};

// 선택한 날짜 기준으로 바로 직전 토요일 반환 (이미 토요일이면 그대로)
export const snapToSaturday = (date: string): string => {
    const d = new Date(date + 'T12:00:00');
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 6) return date;
    d.setDate(d.getDate() - (dayOfWeek + 1));
    return d.toLocaleDateString('en-CA');
};