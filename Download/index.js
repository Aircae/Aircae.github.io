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

document.getElementById('epubBtn').addEventListener('click', function() {
	window.location.href = '掉入异世界也要努力活下去.epub';
});

document.getElementById('txtBtn').addEventListener('click', downloadTXT);


async function downloadTXT() {
	const downloadBtn = document.getElementById('txtBtn');
	
	try {
		downloadBtn.disabled = true;
		downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 下载中...';
		
		const fileName = '掉入异世界也要努力活下去.txt';
		const response = await fetch(fileName);
		
		if (!response.ok) {
			throw new Error(`下载失败: ${response.status} ${response.statusText}`);
		}
		
		const reader = response.body.getReader();
		const chunks = [];
		let receivedLength = 0;
		
		while(true) {
			const {done, value} = await reader.read();
			
			if (done) break;
			
			chunks.push(value);
			receivedLength += value.length;
		}
		
		const blob = new Blob(chunks);
		const url = URL.createObjectURL(blob);
		
		const a = document.createElement('a');
		a.href = url;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		
		setTimeout(() => {
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			
			downloadBtn.disabled = false;
			downloadBtn.innerHTML = '<i class="fas fa-download"></i> 下载';
		}, 100);
		
	} catch (error) {
		console.error('下载失败:', error);
		
		downloadBtn.disabled = false;
		downloadBtn.innerHTML = '<i class="fas fa-redo"></i> 重试';
	}
}

function formatBytes(bytes, decimals = 2) {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}