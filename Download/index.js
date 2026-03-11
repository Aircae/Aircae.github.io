function toggleSidebar() {
    const sidebar = document.getElementById('side');
    sidebar.classList.toggle('active');

    if (sidebar.classList.contains('active')) {
        document.addEventListener('click', closeSidebarOutside);
    } else {
        document.removeEventListener('click', closeSidebarOutside);
    }
}

function closeSidebarOutside(event) {
    const sidebar = document.getElementById('side');
    const sidebarBtn = document.getElementById('sidebar-btn');

    if (!sidebar.contains(event.target) && !sidebarBtn.contains(event.target)) {
        sidebar.classList.remove('active');
        document.removeEventListener('click', closeSidebarOutside);
    }
}

async function downloadWithConcurrency(url, chunks = 6) {

    const sizeResponse = await fetch(url, {
        headers: { 'Range': 'bytes=0-0' }
    });
    if (!sizeResponse.ok && sizeResponse.status !== 206) {
        throw new Error(`无法获取文件大小: HTTP ${sizeResponse.status}`);
    }
    const contentRange = sizeResponse.headers.get('content-range');
    if (!contentRange) {
        throw new Error('服务器未返回 content-range 头，可能不支持分片下载');
    }
    const match = contentRange.match(/\/(\d+)$/);
    if (!match) {
        throw new Error('无法从 content-range 解析文件大小');
    }
    const totalSize = parseInt(match[1], 10);

    const chunkSize = Math.ceil(totalSize / chunks);
    const downloadTasks = [];

    for (let i = 0; i < chunks; i++) {
        const start = i * chunkSize;
        if (start >= totalSize) break;

        const end = Math.min(start + chunkSize - 1, totalSize - 1);
        const task = (async () => {
            const response = await fetch(url, {
                headers: { 'Range': `bytes=${start}-${end}` }
            });
            if (!response.ok && response.status !== 206) {
                throw new Error(`分片 ${i} 下载失败: HTTP ${response.status}`);
            }
            return response.arrayBuffer();
        })();
        downloadTasks.push(task);
    }

    const chunksData = await Promise.all(downloadTasks);

    const fullData = new Uint8Array(totalSize);
    let offset = 0;
    for (const chunk of chunksData) {
        const uint8 = new Uint8Array(chunk);
        fullData.set(uint8, offset);
        offset += uint8.length;
    }
    return fullData.buffer;
}

async function downloadWithChunks(url, fileName, mimeType) {
    try {
        const buffer = await downloadWithConcurrency(url, 6);
        const blob = new Blob([buffer], { type: mimeType });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error('下载失败:', error);
        alert('文件下载失败，请检查网络或刷新重试。\n' + error.message);
    }
}

document.addEventListener('DOMContentLoaded', function () {

    const epubBtn = document.getElementById('epubBtn');
    if (epubBtn) {
        epubBtn.addEventListener('click', function (e) {
            e.preventDefault();
            downloadWithChunks(
                'book/1/掉入异世界也要努力活下去.epub',
                '掉入异世界也要努力活下去.epub',
                'application/epub+zip'
            );
        });
    }

    const txtBtn = document.getElementById('txtBtn');
    if (txtBtn) {
        txtBtn.addEventListener('click', function (e) {
            e.preventDefault();
            downloadWithChunks(
                'book/1/掉入异世界也要努力活下去.txt',
                '掉入异世界也要努力活下去.txt',
                'text/plain;charset=utf-8'
            );
        });
    }
});