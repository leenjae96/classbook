export const apiFetch = async (url: string, options?: RequestInit) => {
    const res = await fetch(url, options);
    // 1. HTTP 에러 처리
    if (!res.ok) {
        throw new Error(`서버 응답 오류 (상태 코드: ${res.status})`);
    }
    // 2. 응답 내용물(JSON 등) 유연하게 처리
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return res.json(); // 응답이 JSON이면 파싱해서 반환
    } else {
        return res.text(); // 빈 응답이거나 단순 텍스트면 그냥 반환 (여기서 에러 안 나게 처리)
    }
};