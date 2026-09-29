const KEY="nfc-depo-demo-v1";
const initialProducts=[
{id:"1",name:"13x21 Thermo Deri Defter",code:"NA-1321",category:"Defter",stock:48,minStock:10},
{id:"2",name:"2026 Tarihli Ajanda",code:"NA-2026",category:"Ajanda",stock:24,minStock:8},
{id:"3",name:"A5 Spiral Planner",code:"NA-A5P",category:"Planner",stock:7,minStock:10},
{id:"4",name:"Kurumsal Karton Kutu",code:"NA-KUTU",category:"Kutu",stock:120,minStock:20}
];
let state=JSON.parse(localStorage.getItem(KEY)||"null")||{products:initialProducts,history:[]};
let selectedId=null;
const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
const esc=s=>String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
function render(){
 document.getElementById("productCount").textContent=state.products.length;
 document.getElementById("totalStock").textContent=state.products.reduce((a,p)=>a+p.stock,0);
 document.getElementById("lowStock").textContent=state.products.filter(p=>p.stock<=p.minStock).length;
 const q=(document.getElementById("searchInput").value||"").toLowerCase();
 const list=state.products.filter(p=>(p.name+" "+p.code+" "+p.category).toLowerCase().includes(q));
 document.getElementById("productList").innerHTML=list.length?list.map(p=>'<button class="product" data-id="'+p.id+'"><div class="product-info"><strong>'+esc(p.name)+'</strong><small>'+esc(p.code)+' · '+esc(p.category||"Genel")+'</small></div><div class="stock '+(p.stock<=p.minStock?"low":"ok")+'"><b>'+p.stock+'</b><small>adet</small></div></button>').join(""):'<div class="empty">Aradığınız ürün bulunamadı.</div>';
 document.querySelectorAll(".product").forEach(b=>b.onclick=()=>openProduct(b.dataset.id));
 renderHistory();
}
function renderHistory(){
 const el=document.getElementById("historyList");
 el.innerHTML=state.history.length?state.history.slice(0,40).map(h=>'<div class="history-item"><div><strong>'+esc(h.name)+'</strong><small>'+esc(h.code)+' · '+new Date(h.date).toLocaleString("tr-TR")+'</small></div><b class="'+(h.amount>0?"plus":"minus")+'">'+(h.amount>0?"+":"")+h.amount+'</b></div>').join(""):'<div class="empty">Henüz stok hareketi yok.</div>';
}
function showView(id){
 document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
 document.getElementById(id).classList.add("active");
 document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===id));
}
function openProduct(id){
 selectedId=id; const p=state.products.find(x=>x.id===id); if(!p)return;
 document.getElementById("productDetail").innerHTML='<div class="detail"><div class="detail-head"><span class="code">'+esc(p.code)+'</span><h2>'+esc(p.name)+'</h2><small>'+esc(p.category||"Genel")+'</small><div class="big-stock">'+p.stock+'<small style="font-size:14px;font-weight:600;color:#78929b"> adet stokta</small></div><div class="actions"><button class="action in" id="stockIn">+ Stok Girişi</button><button class="action out" id="stockOut">− Stok Çıkışı</button></div></div></div>';
 document.getElementById("stockIn").onclick=()=>changeStock(1);
 document.getElementById("stockOut").onclick=()=>changeStock(-1);
 showView("productView");
}
function changeStock(dir){
 const p=state.products.find(x=>x.id===selectedId); if(!p)return;
 const raw=prompt(dir>0?"Kaç adet stok girişi yapılacak?":"Kaç adet stok çıkışı yapılacak?","1");
 const n=Math.floor(Number(raw));
 if(!Number.isFinite(n)||n<=0)return;
 if(dir<0&&n>p.stock){alert("Yeterli stok yok.");return}
 p.stock+=dir*n;
 state.history.unshift({name:p.name,code:p.code,amount:dir*n,date:new Date().toISOString()});
 save(); openProduct(p.id); render();
}
document.getElementById("searchInput").oninput=render;
document.getElementById("backBtn").onclick=()=>{showView("dashboardView");render()};
document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>showView(b.dataset.view));
document.getElementById("addProductBtn").onclick=()=>document.getElementById("modal").classList.remove("hidden");
document.getElementById("closeModal").onclick=()=>document.getElementById("modal").classList.add("hidden");
document.getElementById("productForm").onsubmit=e=>{
 e.preventDefault();const f=new FormData(e.target);
 const p={id:crypto.randomUUID(),name:f.get("name"),code:f.get("code"),category:f.get("category"),stock:Number(f.get("stock")),minStock:Number(f.get("minStock"))};
 state.products.unshift(p);save();e.target.reset();document.getElementById("modal").classList.add("hidden");render();
};
document.getElementById("resetBtn").onclick=()=>{if(confirm("Demo verileri ilk haline döndürülsün mü?")){localStorage.removeItem(KEY);location.reload()}};
const params=new URLSearchParams(location.search);
if(params.get("product"))openProduct(params.get("product"));
render();