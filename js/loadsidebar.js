window.addEventListener(`load`, async () => {
    const sidebarHTML = await loadHTML('/sidebar.html');
    const sidebar = document.querySelector('.sidebar');
    sidebar.innerHTML = sidebarHTML;
});

async function loadHTML(fileName) {
    const response = await fetch(`${fileName}`);
    return response.text();
}