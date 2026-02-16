export const apiFetch = async (url: string, options?: RequestInit) => {
    const res = await fetch(url, options);
    // 1. HTTP 에러 처리
    if (!res.ok) {
        throw new Error(`서버 응답 오류 (상태 코드: ${res.status})`);
    }
    // 2. 서버가 꺼져서 HTML이 넘어오는 경우 방어
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        throw new Error("서버가 꺼져있거나 올바른 응답(JSON)이 아닙니다.");
    }
    // 3. 정상적이면 파싱된 데이터 반환
    return res.json();
};