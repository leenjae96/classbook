export const parseMarkdown = (md: string): string => {
    return md
        .split('\n')
        .map(line => {
            if (line.startsWith('## '))  return `<h3>${line.slice(3)}</h3>`;
            if (line.startsWith('# '))   return `<h2>${line.slice(2)}</h2>`;
            if (line.startsWith('### ')) return `<h4>${line.slice(4)}</h4>`;
            if (line.startsWith('---'))  return `<hr/>`;
            if (line.startsWith('- '))   return `<li>${inlineFormat(line.slice(2))}</li>`;
            if (line.trim() === '')      return `<br/>`;
            return `<p>${inlineFormat(line)}</p>`;
        })
        .join('\n')
        .replace(/(<li>.*<\/li>\n?)+/g, match => `<ul>${match}</ul>`);
};

const inlineFormat = (text: string): string =>
    text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>');
