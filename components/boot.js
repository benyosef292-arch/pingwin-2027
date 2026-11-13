/* Runs before first paint: page language/direction and the saved theme. */
/* theme: saved choice, dark by default */try{document.documentElement.dataset.theme=localStorage.getItem("penguin-theme")==="light"?"light":"dark"}catch(e){document.documentElement.dataset.theme="dark"}
document.documentElement.lang="he";document.documentElement.dir="rtl";
