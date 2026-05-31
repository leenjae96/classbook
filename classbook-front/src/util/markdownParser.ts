const inlineFormat = (text: string): string =>
    text
        .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:700">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em style="font-style:italic;color:#868e96">$1</em>');

export const parseMarkdown = (md: string): string => {
    const lines = md.split('\n');
    const result: string[] = [];

    for (const line of lines) {
        if (line.startsWith('### ')) {
            result.push(`<h4 style="font-size:15px;font-weight:700;margin:14px 0 5px 0;color:#343a40">${inlineFormat(line.slice(4))}</h4>`);
        } else if (line.startsWith('## ')) {
            result.push(`<h3 style="font-size:17px;font-weight:700;margin:0 0 10px 0;color:#212529">${inlineFormat(line.slice(3))}</h3>`);
        } else if (line.startsWith('# ')) {
            result.push(`<h2 style="font-size:19px;font-weight:700;margin:0 0 12px 0;color:#212529">${inlineFormat(line.slice(2))}</h2>`);
        } else if (line.startsWith('---')) {
            result.push(`<hr style="border:none;border-top:1px solid #e9ecef;margin:12px 0"/>`);
        } else if (line.startsWith('- ')) {
            result.push(`<li style="margin:3px 0 3px 0">${inlineFormat(line.slice(2))}</li>`);
        } else if (line.trim() === '') {
            result.push(`<div style="height:6px"></div>`);
        } else {
            result.push(`<p style="margin:4px 0;color:#495057">${inlineFormat(line)}</p>`);
        }
    }

    // 연속된 <li> 들을 <ul>로 감싸기
    return result
        .join('\n')
        .replace(/(<li[^>]*>[\s\S]*?<\/li>\n?)+/g, match =>
            `<ul style="margin:6px 0 6px 18px;padding:0;list-style:disc">${match}</ul>`
        );
};
