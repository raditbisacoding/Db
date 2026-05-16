const KEY='aesthetic_pm_db';
const defaultDB=()=>({admins:[{username:'admin',password:'admin123'}],numbers:[],logs:['System initialized']});
const getDB=()=>JSON.parse(localStorage.getItem(KEY)||'null')||defaultDB();
const saveDB=db=>localStorage.setItem(KEY,JSON.stringify(db));
if(!localStorage.getItem(KEY)) saveDB(defaultDB());

function addLog(msg){const db=getDB(); db.logs.unshift(new Date().toLocaleString()+' - '+msg); saveDB(db);}
function login(){
 const u=username.value.trim(), p=password.value;
 const ok=getDB().admins.find(a=>a.username===u && a.password===p);
 if(ok){localStorage.setItem('logged','1'); addLog('Login '+u); location.href='dashboard.html';}
 else loginMsg.textContent='Username atau password salah';
}
function logout(){localStorage.removeItem('logged'); location.href='login.html';}
if(location.pathname.endsWith('dashboard.html') && !localStorage.getItem('logged')) location.href='login.html';

function showTab(name){
 ['dashboard','numbers','admins','logs'].forEach(t=>document.getElementById(t+'Tab').classList.add('hidden'));
 document.getElementById(name+'Tab').classList.remove('hidden'); render();
}
function addNumber(){
 const v=phoneInput.value.trim(); if(!v) return;
 const db=getDB(); db.numbers.unshift({phone:v,status:'active'}); saveDB(db); addLog('Add number '+v);
 phoneInput.value=''; render();
}
function addAdmin(){
 const u=newAdminUser.value.trim(), p=newAdminPass.value.trim(); if(!u||!p) return;
 const db=getDB(); db.admins.push({username:u,password:p}); saveDB(db); addLog('Add admin '+u);
 newAdminUser.value=''; newAdminPass.value=''; render();
}
function toggleStatus(i){const db=getDB(); db.numbers[i].status=db.numbers[i].status==='active'?'blacklist':'active'; saveDB(db); render();}
function deleteNumber(i){const db=getDB(); db.numbers.splice(i,1); saveDB(db); render();}
function deleteAdmin(i){const db=getDB(); if(db.admins.length<=1) return alert('Minimal satu admin'); db.admins.splice(i,1); saveDB(db); render();}
function exportData(){
 const blob=new Blob([JSON.stringify(getDB(),null,2)],{type:'application/json'});
 const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='backup.json'; a.click();
}
function toggleTheme(){document.body.classList.toggle('dark'); localStorage.setItem('theme',document.body.classList.contains('dark')?'dark':'light');}
function applyTheme(){if(localStorage.getItem('theme')==='dark') document.body.classList.add('dark');}

function render(){
 if(!document.getElementById('statTotal')) return;
 const db=getDB();
 statTotal.textContent=db.numbers.length;
 statActive.textContent=db.numbers.filter(x=>x.status==='active').length;
 statBlacklist.textContent=db.numbers.filter(x=>x.status==='blacklist').length;

 if(numbersBody){
   const q=(searchInput?.value||'').toLowerCase();
   numbersBody.innerHTML='';
   db.numbers.forEach((n,i)=>{
     if(!n.phone.toLowerCase().includes(q)) return;
     numbersBody.innerHTML += `<tr><td>${n.phone}</td><td><span class="badge">${n.status}</span></td><td>
     <button onclick="toggleStatus(${i})">Toggle</button>
     <button onclick="deleteNumber(${i})">Delete</button></td></tr>`;
   });
 }
 if(adminsBody){
   adminsBody.innerHTML='';
   db.admins.forEach((a,i)=>adminsBody.innerHTML += `<tr><td>${a.username}</td><td><button onclick="deleteAdmin(${i})">Delete</button></td></tr>`);
 }
 if(logsList){
   logsList.innerHTML='';
   db.logs.slice(0,50).forEach(l=>logsList.innerHTML += `<li>${l}</li>`);
 }
}
document.addEventListener('DOMContentLoaded',()=>{applyTheme(); render();});
