import {useRef} from "react";

interface DateSelectorProps {
    selectedDate: string;
    onChange: (date: string) => void;
}

export const DateSelector = ({ selectedDate, onChange }: DateSelectorProps) => {
    const initialDate = useRef(selectedDate);
    // 이전 주 이동
    const handlePrevWeek = () => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() - 7);
        onChange(date.toLocaleDateString('en-CA'));
    };

    // 다음 주 이동
    const handleNextWeek = () => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + 7);
        onChange(date.toLocaleDateString('en-CA'));
    };

    return (
        <div className="date-selector-container">
            <button className="date-arrow-btn" onClick={handlePrevWeek}>◀</button>
            <div className="date-input-wrapper">
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => onChange(e.target.value)}
                    className="date-input"
                />
            </div>
            <button className="date-arrow-btn" onClick={handleNextWeek}>▶</button>

            {/* 다른 날짜를 선택했을 때 언제든 최근 주일로 돌아오게 하는 리셋 버튼 */}
            <button
                className="date-reset-btn"
                onClick={() => onChange(initialDate.current)}
            >
                ↻
            </button>
        </div>
    );
};