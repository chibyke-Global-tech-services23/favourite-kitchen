(function(){
var TAWK=""; /* optional: Tawk.to chat id, like "64abc123/1h9xyz" (property/widget) */
var S={cart:{},user:null,chat:[],menu:null,view:"cart",items:[],msg:""};
try{S.user=JSON.parse(localStorage.getItem("kfu")||"null")}catch(e){}
var css=document.createElement("style");
css.textContent="#kfbar{position:fixed;left:0;right:0;bottom:0;z-index:20;display:flex;gap:8px;padding:10px;background:#10301fee}#kfbar button{flex:1;padding:12px 6px;border:0;border-radius:8px;font:700 .95rem inherit;background:#f0a30a;color:#1b1500;cursor:pointer}#kfbar button.o{background:#fff2;color:#fff}#kfp{position:fixed;inset:0;z-index:30;background:#0008;display:flex;align-items:flex-end;justify-content:center}#kfp[hidden]{display:none}#kfb{background:#fff;width:100%;max-width:520px;max-height:88vh;overflow:auto;border-radius:14px 14px 0 0;padding:16px}#kfb h3{display:flex;justify-content:space-between;margin-bottom:10px}#kfb input,#kfb textarea{width:100%;padding:10px;margin:4px 0 8px;border:1px solid #b9c0b4;border-radius:7px;font:inherit}#kfb .b{width:100%;padding:12px;border:0;border-radius:8px;background:#10301f;color:#fff;font:700 1rem inherit;margin-top:6px;cursor:pointer}#kfb .b.l{background:#e4eadf;color:#10301f}.kfl{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 0;border-bottom:1px dashed #dfe3da}.kfq button{width:30px;height:30px;border:1px solid #10301f;background:#fff;border-radius:6px;font-weight:700}.kfe{color:#8a1c12;font-weight:600;margin:6px 0}.kfm{padding:8px 12px;margin:6px 0;border-radius:10px;max-width:85%;background:#eef1ea}.kfm.u{margin-left:auto;background:#f0a30a55}.add{margin-top:8px;border:0;background:#10301f;color:#fff;padding:7px 12px;border-radius:6px;font:700 .85rem inherit;cursor:pointer}body{padding-bottom:70px}";
document.head.appendChild(css);
var bar=document.createElement("div");bar.id="kfbar";
bar.innerHTML='<button id="kc">Cart</button><button class="o" id="ka">Account</button><button class="o" id="kh">Chat</button>';
var pan=document.createElement("div");pan.id="kfp";pan.hidden=true;pan.innerHTML='<div id="kfb"></div>';
document.body.appendChild(bar);document.body.appendChild(pan);
var B=pan.firstChild;
function esc(s){var d=document.createElement("div");d.textContent=s==null?"":s;return d.innerHTML}
function n(v){return "₦"+Number(v).toLocaleString("en-NG")}
function count(){var c=0;for(var k in S.cart)c+=S.cart[k].qty;return c}
function total(){var t=0;for(var k in S.cart)t+=S.cart[k].qty*S.cart[k].price;return t}
function bars(){document.getElementById("kc").textContent="Cart ("+count()+")";document.getElementById("ka").textContent=S.user?(S.user.name||"My account"):"Log in"}
function api(p,o){o=o||{};o.headers=Object.assign({"content-type":"application/json"},o.headers||{});if(S.user)o.headers.authorization="Bearer "+S.user.token;
  return fetch(p,o).then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.error||"Something went wrong");return j})})}
function open(v,m){S.view=v;S.msg=m||"";pan.hidden=false;draw()}
function close(){pan.hidden=true}
function draw(){var h='<h3><span>'+({cart:"Your cart",login:"Log in or sign up",signup:"Create account",orders:"My orders",chat:"Customer service",done:"Order sent"}[S.view])+'</span><button class="kfq" id="x" style="border:0;background:none;font-size:1.4rem">✕</button></h3>';
  if(S.msg)h+='<p class="kfe">'+esc(S.msg)+'</p>';
  if(S.view==="cart"){var ks=Object.keys(S.cart);
    if(!ks.length)h+='<p>Your cart is empty. Tap "Add to cart" on any dish.</p>';
    else{h+=ks.map(function(k){var i=S.cart[k];return '<div class="kfl"><span>'+esc(k)+'<br><small>'+n(i.price)+'</small></span><span class="kfq"><button data-m="'+esc(k)+'">−</button> '+i.qty+' <button data-p="'+esc(k)+'">+</button></span></div>'}).join("");
      h+='<p style="margin:10px 0"><b>Total: '+n(total())+'</b> (delivery fee not included)</p><input id="ph" inputmode="tel" placeholder="Phone number" value="'+esc(S.user?S.user.phone:"")+'"><textarea id="ad" rows="2" placeholder="Delivery address (or write: pickup)"></textarea><input id="nt" placeholder="Note (optional)"><button class="b" id="po">Place order</button>'}}
  if(S.view==="login"||S.view==="signup"){var su=S.view==="signup";
    h+=(su?'<input id="nm" placeholder="Your name"><input id="pn" inputmode="tel" placeholder="Phone number">':'')+'<input id="em" type="email" placeholder="Email"><input id="pw" type="password" placeholder="Password (6+ characters)"><button class="b" id="go">'+(su?"Create account":"Log in")+'</button><button class="b l" id="sw">'+(su?"I already have an account":"Create a new account")+'</button>'}
  if(S.view==="orders")h+='<div id="ol">Loading...</div><button class="b l" id="lo">Log out</button>';
  if(S.view==="done")h+='<p>Order <b>'+esc(S.oid)+'</b> received. Total '+n(S.ot)+'.</p><p style="margin:8px 0">Pay by bank transfer using the account numbers in the Payment section, then send your receipt on WhatsApp.</p><a class="b" style="display:block;text-align:center;text-decoration:none" href="'+esc(S.wa)+'">Send receipt on WhatsApp</a>';
  if(S.view==="chat"){h+='<div id="cm">'+(S.chat.length?"":'<div class="kfm">Hello! Ask me about our menu, prices, delivery or payment.</div>')+S.chat.map(function(m){return '<div class="kfm '+(m.role==="user"?"u":"")+'">'+esc(m.content)+'</div>'}).join("")+'</div><input id="ci" placeholder="Type your question"><button class="b" id="cs">Send</button><button class="b l" id="hp">Talk to a person</button>'}
  B.innerHTML=h;
  if(S.view==="orders")api("/api/orders").then(function(o){document.getElementById("ol").innerHTML=o.length?o.map(function(x){return '<div class="kfl"><span><b>'+x.id+'</b> · '+x.status+'<br><small>'+x.items.map(function(i){return i.qty+"× "+esc(i.name)}).join(", ")+'</small></span><b>'+n(x.total)+'</b></div>'}).join(""):"No orders yet."}).catch(function(e){document.getElementById("ol").textContent=e.message});
  if(S.view==="chat"){var c=document.getElementById("cm");c.scrollTop=c.scrollHeight}}
function login(mode){var b={mode:mode,email:val("em"),password:val("pw"),name:val("nm"),phone:val("pn")};
  api("/api/auth",{method:"POST",body:JSON.stringify(b)}).then(function(u){S.user=u;try{localStorage.setItem("kfu",JSON.stringify(u))}catch(e){}bars();open(count()?"cart":"orders")}).catch(function(e){open(mode==="signup"?"signup":"login",e.message)})}
function val(i){var e=document.getElementById(i);return e?e.value:""}
function person(){var m=S.menu||{};if(TAWK&&window.Tawk_API&&Tawk_API.maximize){Tawk_API.maximize();close()}else window.open("https://wa.me/"+(m.whatsapp||"2347032856664")+"?text="+encodeURIComponent("Hello Favourite Kitchen, I need help."),"_blank")}
function faq(q){var m=S.menu||{},t=q.toLowerCase(),ph=m.phone||"07032856664";
  function has(re){return re.test(t)}
  var stop=" what which have much does price cost your with there that this please want need sell soup soups "
  var words=t.replace(/[^a-z ]/g," ").split(" ").filter(function(w){return w.length>3&&stop.indexOf(" "+w+" ")<0});
  var hits=S.items.filter(function(it){var n=it.name.toLowerCase();return words.some(function(w){return n.indexOf(w)>-1})});
  var seen={};hits=hits.filter(function(i){if(seen[i.name])return false;seen[i.name]=1;return true}).slice(0,6);
  if(has(/^(hi|hello|hey|good (morning|afternoon|evening))/))return "Hello! Welcome to Favourite Kitchen. Ask me about our food, prices, delivery or payment.";
  if(hits.length&&!has(/deliver|pay|account|open|where|locat/))return hits.map(function(i){return i.name+": "+(i.price?n(i.price):"ask us for the price")}).join("\n");
  if(has(/deliver/))return "Yes, we deliver. The delivery fee starts from ₦5,000 and depends on your location. Add your address when you place the order.";
  if(has(/pay|transfer|account|bank|opay|palmpay|first/)){var a=(m.accounts||[]).map(function(x){return x.bank+": "+x.number+" ("+x.name+")"}).join("\n");return "Pay by bank transfer, then send your receipt on WhatsApp.\n"+a}
  if(has(/how.*order|order|buy|cart/))return "Tap 'Add to cart' on any dish, open Cart, enter your phone and address, and place your order. Then pay by transfer and send the receipt on WhatsApp.";
  if(has(/menu|food|eat|sell|dish|soup|drink/))return "We have soups, pepper soup, noodles, abacha, nkwobi, shawarma and cold drinks. Scroll to Menu prices on this page to see everything.";
  if(has(/where|locat|address|direction|find you/))return "We are in Awo-Omamma. For exact directions, tap 'Talk to a person'.";
  if(has(/open|close|hour|time/))return "For our opening hours, please tap 'Talk to a person'.";
  if(has(/phone|call|number|contact|whatsapp/))return "Call "+ph+" or tap 'Talk to a person' to chat on WhatsApp.";
  return "I am not sure about that. Please tap 'Talk to a person' and we will help you."}
document.addEventListener("click",function(e){var t=e.target,id=t.id;
  if(t.dataset&&t.dataset.add){var it=S.items[+t.dataset.add];S.cart[it.name]=S.cart[it.name]||{price:it.price,qty:0};S.cart[it.name].qty++;bars();t.textContent="Added ✓";setTimeout(function(){t.textContent="Add to cart"},900);return}
  if(t.dataset&&t.dataset.m!==undefined){if(--S.cart[t.dataset.m].qty<1)delete S.cart[t.dataset.m];draw();bars();return}
  if(t.dataset&&t.dataset.p!==undefined){S.cart[t.dataset.p].qty++;draw();bars();return}
  if(id==="kc")open("cart");else if(id==="ka")open(S.user?"orders":"login");else if(id==="kh")open("chat");
  else if(id==="x"||t===pan)close();
  else if(id==="sw")open(S.view==="login"?"signup":"login");
  else if(id==="go")login(S.view);
  else if(id==="lo"){S.user=null;try{localStorage.removeItem("kfu")}catch(e){}bars();close()}
  else if(id==="hp")person();
  else if(id==="po"){if(!S.user){open("login","Please log in or create an account to place your order.");return}
    var ad=val("ad").trim();if(!ad){S.msg="Enter your delivery address, or write pickup.";draw();return}
    api("/api/orders",{method:"POST",body:JSON.stringify({items:Object.keys(S.cart).map(function(k){return{name:k,price:S.cart[k].price,qty:S.cart[k].qty}}),phone:val("ph"),address:ad,note:val("nt")})}).then(function(r){
      var m=S.menu||{};S.oid=r.id;S.ot=r.total;S.wa="https://wa.me/"+(m.whatsapp||"2347032856664")+"?text="+encodeURIComponent("Hello, I placed order "+r.id+" (₦"+r.total+"). Here is my payment receipt.");S.cart={};bars();open("done")}).catch(function(er){open("cart",er.message)})}
  else if(id==="cs"){var q=val("ci").trim();if(!q)return;S.chat.push({role:"user",content:q});S.chat.push({role:"assistant",content:"..."});draw();
    api("/api/chat",{method:"POST",body:JSON.stringify({messages:S.chat.slice(0,-1),menu:S.menu})}).then(function(r){var x=r.reply||"";if(/^(Sorry, I could not|The assistant is not available)/.test(x))x=faq(q);S.chat[S.chat.length-1].content=x;draw()}).catch(function(){S.chat[S.chat.length-1].content=faq(q);draw()})}});
document.addEventListener("keydown",function(e){if(e.key==="Enter"&&e.target.id==="ci")document.getElementById("cs").click()});
window.onMenu=function(d){S.menu=d;S.items=[];
  function add(a){a.forEach(function(x){var p=Number(x.price);S.items.push({name:x.name,price:p>0?p:0})})}
  add(d.specials);add(d.soups);add(d.drinks);
  var ds=document.querySelectorAll("#specials .dish > div"),rs=document.querySelectorAll("#lists .row");
  ds.forEach(function(el,i){if(S.items[i]&&S.items[i].price&&!el.querySelector(".add"))el.insertAdjacentHTML("beforeend",'<button class="add" data-add="'+i+'">Add to cart</button>')});
  var off=d.specials.length;
  rs.forEach(function(el,i){var ix=off+i;if(S.items[ix]&&S.items[ix].price&&!el.querySelector(".add"))el.insertAdjacentHTML("beforeend",'<button class="add" data-add="'+ix+'">Add to cart</button>')});
};
if(window.__menuData)window.onMenu(window.__menuData);
if(TAWK){var s=document.createElement("script");s.async=true;s.src="https://embed.tawk.to/"+TAWK;document.head.appendChild(s)}
bars();
})();
