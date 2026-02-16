interface Props {
    message?: string;
    onRetry?: () => void; // 다시 시도 버튼을 위한 함수 (선택 사항)
}

export const ErrorMessage = ({ message = "데이터를 불러오는 중 문제가 발생했습니다.", onRetry }: Props) => {
    return (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#333' }}>
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>🚨</div>
            <h3 style={{ marginBottom: '10px' }}>오류가 발생했습니다</h3>
            <p style={{ color: '#666', marginBottom: '20px', lineHeight: '1.5' }}>
                {message}<br/>
                화면을 캡쳐하여 관리자에게 문의해 주세요.
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    새로고침
                </button>
            )}
        </div>
    );
};