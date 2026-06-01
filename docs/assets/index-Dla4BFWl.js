(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const l of s.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&o(l)}).observe(document,{childList:!0,subtree:!0});function n(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function o(r){if(r.ep)return;r.ep=!0;const s=n(r);fetch(r.href,s)}})();const Ot=!1,At=(e,t)=>e===t,pe=Symbol("solid-proxy"),Ze=typeof Proxy=="function",$t=Symbol("solid-track"),de={equals:At};let Je=at;const j=1,ue=2,et={owned:null,cleanups:null,context:null,owner:null};var S=null;let _e=null,kt=null,P=null,I=null,U=null,fe=0;function Y(e,t){const n=P,o=S,r=e.length===0,s=t===void 0?o:t,l=r?et:{owned:null,cleanups:null,context:s?s.context:null,owner:s},a=r?e:()=>e(()=>F(()=>Z(l)));S=l,P=null;try{return H(a,!0)}finally{P=n,S=o}}function T(e,t){t=t?Object.assign({},de,t):de;const n={value:e,observers:null,observerSlots:null,comparator:t.equals||void 0},o=r=>(typeof r=="function"&&(r=r(n.value)),ot(n,r));return[rt.bind(n),o]}function N(e,t,n){const o=De(e,t,!1,j);ne(o)}function It(e,t,n){Je=Rt;const o=De(e,t,!1,j);o.user=!0,U?U.push(o):ne(o)}function $(e,t,n){n=n?Object.assign({},de,n):de;const o=De(e,t,!0,0);return o.observers=null,o.observerSlots=null,o.comparator=n.equals||void 0,ne(o),rt.bind(o)}function Et(e){return H(e,!1)}function F(e){if(P===null)return e();const t=P;P=null;try{return e()}finally{P=t}}function Te(e,t,n){const o=Array.isArray(e);let r,s=n&&n.defer;return l=>{let a;if(o){a=Array(e.length);for(let c=0;c<e.length;c++)a[c]=e[c]()}else a=e();if(s)return s=!1,l;const i=F(()=>t(a,r,l));return r=a,i}}function D(e){It(()=>F(e))}function G(e){return S===null||(S.cleanups===null?S.cleanups=[e]:S.cleanups.push(e)),e}function tt(){return S}function nt(e,t){const n=S,o=P;S=e,P=null;try{return H(t,!0)}catch(r){Re(r)}finally{S=n,P=o}}function Tt(e){const t=P,n=S;return Promise.resolve().then(()=>{P=t,S=n;let o;return H(e,!1),P=S=null,o?o.done:void 0})}const[co,po]=T(!1);function ge(e,t){const n=Symbol("context");return{id:n,Provider:Ft(n),defaultValue:e}}function te(e){let t;return S&&S.context&&(t=S.context[e.id])!==void 0?t:e.defaultValue}function Ne(e){const t=$(e),n=$(()=>Oe(t()));return n.toArray=()=>{const o=n();return Array.isArray(o)?o:o!=null?[o]:[]},n}function rt(){if(this.sources&&this.state)if(this.state===j)ne(this);else{const e=I;I=null,H(()=>he(this),!1),I=e}if(P){const e=this.observers?this.observers.length:0;P.sources?(P.sources.push(this),P.sourceSlots.push(e)):(P.sources=[this],P.sourceSlots=[e]),this.observers?(this.observers.push(P),this.observerSlots.push(P.sources.length-1)):(this.observers=[P],this.observerSlots=[P.sources.length-1])}return this.value}function ot(e,t,n){let o=e.value;return(!e.comparator||!e.comparator(o,t))&&(e.value=t,e.observers&&e.observers.length&&H(()=>{for(let r=0;r<e.observers.length;r+=1){const s=e.observers[r],l=_e&&_e.running;l&&_e.disposed.has(s),(l?!s.tState:!s.state)&&(s.pure?I.push(s):U.push(s),s.observers&&st(s)),l||(s.state=j)}if(I.length>1e6)throw I=[],new Error},!1)),t}function ne(e){if(!e.fn)return;Z(e);const t=fe;Nt(e,e.value,t)}function Nt(e,t,n){let o;const r=S,s=P;P=S=e;try{o=e.fn(t)}catch(l){return e.pure&&(e.state=j,e.owned&&e.owned.forEach(Z),e.owned=null),e.updatedAt=n+1,Re(l)}finally{P=s,S=r}(!e.updatedAt||e.updatedAt<=n)&&(e.updatedAt!=null&&"observers"in e?ot(e,o):e.value=o,e.updatedAt=n)}function De(e,t,n,o=j,r){const s={fn:e,state:o,updatedAt:null,owned:null,sources:null,sourceSlots:null,cleanups:null,value:t,owner:S,context:S?S.context:null,pure:n};return S===null||S!==et&&(S.owned?S.owned.push(s):S.owned=[s]),s}function me(e){if(e.state===0)return;if(e.state===ue)return he(e);if(e.suspense&&F(e.suspense.inFallback))return e.suspense.effects.push(e);const t=[e];for(;(e=e.owner)&&(!e.updatedAt||e.updatedAt<fe);)e.state&&t.push(e);for(let n=t.length-1;n>=0;n--)if(e=t[n],e.state===j)ne(e);else if(e.state===ue){const o=I;I=null,H(()=>he(e,t[0]),!1),I=o}}function H(e,t){if(I)return e();let n=!1;t||(I=[]),U?n=!0:U=[],fe++;try{const o=e();return Dt(n),o}catch(o){n||(U=null),I=null,Re(o)}}function Dt(e){if(I&&(at(I),I=null),e)return;const t=U;U=null,t.length&&H(()=>Je(t),!1)}function at(e){for(let t=0;t<e.length;t++)me(e[t])}function Rt(e){let t,n=0;for(t=0;t<e.length;t++){const o=e[t];o.user?e[n++]=o:me(o)}for(t=0;t<n;t++)me(e[t])}function he(e,t){e.state=0;for(let n=0;n<e.sources.length;n+=1){const o=e.sources[n];if(o.sources){const r=o.state;r===j?o!==t&&(!o.updatedAt||o.updatedAt<fe)&&me(o):r===ue&&he(o,t)}}}function st(e){for(let t=0;t<e.observers.length;t+=1){const n=e.observers[t];n.state||(n.state=ue,n.pure?I.push(n):U.push(n),n.observers&&st(n))}}function Z(e){let t;if(e.sources)for(;e.sources.length;){const n=e.sources.pop(),o=e.sourceSlots.pop(),r=n.observers;if(r&&r.length){const s=r.pop(),l=n.observerSlots.pop();o<r.length&&(s.sourceSlots[l]=o,r[o]=s,n.observerSlots[o]=l)}}if(e.tOwned){for(t=e.tOwned.length-1;t>=0;t--)Z(e.tOwned[t]);delete e.tOwned}if(e.owned){for(t=e.owned.length-1;t>=0;t--)Z(e.owned[t]);e.owned=null}if(e.cleanups){for(t=e.cleanups.length-1;t>=0;t--)e.cleanups[t]();e.cleanups=null}e.state=0}function Lt(e){return e instanceof Error?e:new Error(typeof e=="string"?e:"Unknown error",{cause:e})}function Re(e,t=S){throw Lt(e)}function Oe(e){if(typeof e=="function"&&!e.length)return Oe(e());if(Array.isArray(e)){const t=[];for(let n=0;n<e.length;n++){const o=Oe(e[n]);Array.isArray(o)?t.push.apply(t,o):t.push(o)}return t}return e}function Ft(e,t){return function(o){let r;return N(()=>r=F(()=>(S.context={...S.context,[e]:o.value},Ne(()=>o.children))),void 0),r}}const Mt=Symbol("fallback");function He(e){for(let t=0;t<e.length;t++)e[t]()}function Ut(e,t,n={}){let o=[],r=[],s=[],l=0,a=t.length>1?[]:null;return G(()=>He(s)),()=>{let i=e()||[],c=i.length,p,d;return i[$t],F(()=>{let h,b,f,v,_,y,O,A,E;if(c===0)l!==0&&(He(s),s=[],o=[],r=[],l=0,a&&(a=[])),n.fallback&&(o=[Mt],r[0]=Y(W=>(s[0]=W,n.fallback())),l=1);else if(l===0){for(r=new Array(c),d=0;d<c;d++)o[d]=i[d],r[d]=Y(m);l=c}else{for(f=new Array(c),v=new Array(c),a&&(_=new Array(c)),y=0,O=Math.min(l,c);y<O&&o[y]===i[y];y++);for(O=l-1,A=c-1;O>=y&&A>=y&&o[O]===i[A];O--,A--)f[A]=r[O],v[A]=s[O],a&&(_[A]=a[O]);for(h=new Map,b=new Array(A+1),d=A;d>=y;d--)E=i[d],p=h.get(E),b[d]=p===void 0?-1:p,h.set(E,d);for(p=y;p<=O;p++)E=o[p],d=h.get(E),d!==void 0&&d!==-1?(f[d]=r[p],v[d]=s[p],a&&(_[d]=a[p]),d=b[d],h.set(E,d)):s[p]();for(d=y;d<c;d++)d in f?(r[d]=f[d],s[d]=v[d],a&&(a[d]=_[d],a[d](d))):r[d]=Y(m);r=r.slice(0,l=c),o=i.slice(0)}return r});function m(h){if(s[d]=h,a){const[b,f]=T(d);return a[d]=f,t(i[d],b)}return t(i[d])}}}function u(e,t){return F(()=>e(t||{}))}function ie(){return!0}const Ae={get(e,t,n){return t===pe?n:e.get(t)},has(e,t){return t===pe?!0:e.has(t)},set:ie,deleteProperty:ie,getOwnPropertyDescriptor(e,t){return{configurable:!0,enumerable:!0,get(){return e.get(t)},set:ie,deleteProperty:ie}},ownKeys(e){return e.keys()}};function Se(e){return(e=typeof e=="function"?e():e)?e:{}}function jt(){for(let e=0,t=this.length;e<t;++e){const n=this[e]();if(n!==void 0)return n}}function $e(...e){let t=!1;for(let l=0;l<e.length;l++){const a=e[l];t=t||!!a&&pe in a,e[l]=typeof a=="function"?(t=!0,$(a)):a}if(Ze&&t)return new Proxy({get(l){for(let a=e.length-1;a>=0;a--){const i=Se(e[a])[l];if(i!==void 0)return i}},has(l){for(let a=e.length-1;a>=0;a--)if(l in Se(e[a]))return!0;return!1},keys(){const l=[];for(let a=0;a<e.length;a++)l.push(...Object.keys(Se(e[a])));return[...new Set(l)]}},Ae);const n={},o=Object.create(null);for(let l=e.length-1;l>=0;l--){const a=e[l];if(!a)continue;const i=Object.getOwnPropertyNames(a);for(let c=i.length-1;c>=0;c--){const p=i[c];if(p==="__proto__"||p==="constructor")continue;const d=Object.getOwnPropertyDescriptor(a,p);if(!o[p])o[p]=d.get?{enumerable:!0,configurable:!0,get:jt.bind(n[p]=[d.get.bind(a)])}:d.value!==void 0?d:void 0;else{const m=n[p];m&&(d.get?m.push(d.get.bind(a)):d.value!==void 0&&m.push(()=>d.value))}}}const r={},s=Object.keys(o);for(let l=s.length-1;l>=0;l--){const a=s[l],i=o[a];i&&i.get?Object.defineProperty(r,a,i):r[a]=i?i.value:void 0}return r}function Gt(e,...t){const n=t.length;if(Ze&&pe in e){const r=n>1?t.flat():t[0],s=t.map(l=>new Proxy({get(a){return l.includes(a)?e[a]:void 0},has(a){return l.includes(a)&&a in e},keys(){return l.filter(a=>a in e)}},Ae));return s.push(new Proxy({get(l){return r.includes(l)?void 0:e[l]},has(l){return r.includes(l)?!1:l in e},keys(){return Object.keys(e).filter(l=>!r.includes(l))}},Ae)),s}const o=[];for(let r=0;r<=n;r++)o[r]={};for(const r of Object.getOwnPropertyNames(e)){let s=n;for(let i=0;i<t.length;i++)if(t[i].includes(r)){s=i;break}const l=Object.getOwnPropertyDescriptor(e,r);!l.get&&!l.set&&l.enumerable&&l.writable&&l.configurable?o[s][r]=l.value:Object.defineProperty(o[s],r,l)}return o}let Ht=0;function Wt(){return`cl-${Ht++}`}const Bt=e=>`Stale read from <${e}>.`;function xe(e){const t="fallback"in e&&{fallback:()=>e.fallback};return $(Ut(()=>e.each,e.children,t||void 0))}function lt(e){const t=e.keyed,n=$(()=>e.when,void 0,void 0),o=t?n:$(n,void 0,{equals:(r,s)=>!r==!s});return $(()=>{const r=o();if(r){const s=e.children;return typeof s=="function"&&s.length>0?F(()=>s(t?r:()=>{if(!F(o))throw Bt("Show");return n()})):s}return e.fallback},void 0,void 0)}const qt=["allowfullscreen","async","alpha","autofocus","autoplay","checked","controls","default","disabled","formnovalidate","hidden","indeterminate","inert","ismap","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","seamless","selected","adauctionheaders","browsingtopics","credentialless","defaultchecked","defaultmuted","defaultselected","defer","disablepictureinpicture","disableremoteplayback","preservespitch","shadowrootclonable","shadowrootcustomelementregistry","shadowrootdelegatesfocus","shadowrootserializable","sharedstoragewritable"],Kt=new Set(["className","value","readOnly","noValidate","formNoValidate","isMap","noModule","playsInline","adAuctionHeaders","allowFullscreen","browsingTopics","defaultChecked","defaultMuted","defaultSelected","disablePictureInPicture","disableRemotePlayback","preservesPitch","shadowRootClonable","shadowRootCustomElementRegistry","shadowRootDelegatesFocus","shadowRootSerializable","sharedStorageWritable",...qt]),Qt=new Set(["innerHTML","textContent","innerText","children"]),Xt=Object.assign(Object.create(null),{className:"class",htmlFor:"for"}),Vt=Object.assign(Object.create(null),{class:"className",novalidate:{$:"noValidate",FORM:1},formnovalidate:{$:"formNoValidate",BUTTON:1,INPUT:1},ismap:{$:"isMap",IMG:1},nomodule:{$:"noModule",SCRIPT:1},playsinline:{$:"playsInline",VIDEO:1},readonly:{$:"readOnly",INPUT:1,TEXTAREA:1},adauctionheaders:{$:"adAuctionHeaders",IFRAME:1},allowfullscreen:{$:"allowFullscreen",IFRAME:1},browsingtopics:{$:"browsingTopics",IMG:1},defaultchecked:{$:"defaultChecked",INPUT:1},defaultmuted:{$:"defaultMuted",AUDIO:1,VIDEO:1},defaultselected:{$:"defaultSelected",OPTION:1},disablepictureinpicture:{$:"disablePictureInPicture",VIDEO:1},disableremoteplayback:{$:"disableRemotePlayback",AUDIO:1,VIDEO:1},preservespitch:{$:"preservesPitch",AUDIO:1,VIDEO:1},shadowrootclonable:{$:"shadowRootClonable",TEMPLATE:1},shadowrootdelegatesfocus:{$:"shadowRootDelegatesFocus",TEMPLATE:1},shadowrootserializable:{$:"shadowRootSerializable",TEMPLATE:1},sharedstoragewritable:{$:"sharedStorageWritable",IFRAME:1,IMG:1}});function Yt(e,t){const n=Vt[e];return typeof n=="object"?n[t]?n.$:void 0:n}const zt=new Set(["beforeinput","click","dblclick","contextmenu","focusin","focusout","input","keydown","keyup","mousedown","mousemove","mouseout","mouseover","mouseup","pointerdown","pointermove","pointerout","pointerover","pointerup","touchend","touchmove","touchstart"]),Zt={xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace"},z=e=>$(()=>e());function Jt(e,t,n){let o=n.length,r=t.length,s=o,l=0,a=0,i=t[r-1].nextSibling,c=null;for(;l<r||a<s;){if(t[l]===n[a]){l++,a++;continue}for(;t[r-1]===n[s-1];)r--,s--;if(r===l){const p=s<o?a?n[a-1].nextSibling:n[s-a]:i;for(;a<s;)e.insertBefore(n[a++],p)}else if(s===a)for(;l<r;)(!c||!c.has(t[l]))&&t[l].remove(),l++;else if(t[l]===n[s-1]&&n[a]===t[r-1]){const p=t[--r].nextSibling;e.insertBefore(n[a++],t[l++].nextSibling),e.insertBefore(n[--s],p),t[r]=n[s]}else{if(!c){c=new Map;let d=a;for(;d<s;)c.set(n[d],d++)}const p=c.get(t[l]);if(p!=null)if(a<p&&p<s){let d=l,m=1,h;for(;++d<r&&d<s&&!((h=c.get(t[d]))==null||h!==p+m);)m++;if(m>p-a){const b=t[l];for(;a<p;)e.insertBefore(n[a++],b)}else e.replaceChild(n[a++],t[l++])}else l++;else t[l++].remove()}}}const We="_$DX_DELEGATE";function en(e,t,n,o={}){let r;return Y(s=>{r=s,t===document?e():g(t,e(),t.firstChild?null:void 0,n)},o.owner),()=>{r(),t.textContent=""}}function w(e,t,n,o){let r;const s=()=>{const a=document.createElement("template");return a.innerHTML=e,a.content.firstChild},l=()=>(r||(r=s())).cloneNode(!0);return l.cloneNode=l,l}function re(e,t=window.document){const n=t[We]||(t[We]=new Set);for(let o=0,r=e.length;o<r;o++){const s=e[o];n.has(s)||(n.add(s),t.addEventListener(s,pn))}}function J(e,t,n){n==null?e.removeAttribute(t):e.setAttribute(t,n)}function tn(e,t,n,o){o==null?e.removeAttributeNS(t,n):e.setAttributeNS(t,n,o)}function nn(e,t,n){n?e.setAttribute(t,""):e.removeAttribute(t)}function rn(e,t){t==null?e.removeAttribute("class"):e.className=t}function on(e,t,n,o){if(o)Array.isArray(n)?(e[`$$${t}`]=n[0],e[`$$${t}Data`]=n[1]):e[`$$${t}`]=n;else if(Array.isArray(n)){const r=n[0];e.addEventListener(t,n[0]=s=>r.call(e,n[1],s))}else e.addEventListener(t,n,typeof n!="function"&&n)}function an(e,t,n={}){const o=Object.keys(t||{}),r=Object.keys(n);let s,l;for(s=0,l=r.length;s<l;s++){const a=r[s];!a||a==="undefined"||t[a]||(Be(e,a,!1),delete n[a])}for(s=0,l=o.length;s<l;s++){const a=o[s],i=!!t[a];!a||a==="undefined"||n[a]===i||!i||(Be(e,a,!0),n[a]=i)}return n}function it(e,t,n){if(!t)return n?J(e,"style"):t;const o=e.style;if(typeof t=="string")return o.cssText=t;typeof n=="string"&&(o.cssText=n=void 0),n||(n={}),t||(t={});let r,s;for(s in n)t[s]==null&&o.removeProperty(s),delete n[s];for(s in t)r=t[s],r!==n[s]&&(o.setProperty(s,r),n[s]=r);return n}function sn(e,t,n){n!=null?e.style.setProperty(t,n):e.style.removeProperty(t)}function ke(e,t={},n,o){const r={};return o||N(()=>r.children=ee(e,t.children,r.children)),N(()=>typeof t.ref=="function"&&oe(t.ref,e)),N(()=>ln(e,t,n,!0,r,!0)),r}function oe(e,t,n){return F(()=>e(t,n))}function g(e,t,n,o){if(n!==void 0&&!o&&(o=[]),typeof t!="function")return ee(e,t,o,n);N(r=>ee(e,t(),r,n),o)}function ln(e,t,n,o,r={},s=!1){t||(t={});for(const l in r)if(!(l in t)){if(l==="children")continue;r[l]=qe(e,l,null,r[l],n,s,t)}for(const l in t){if(l==="children")continue;const a=t[l];r[l]=qe(e,l,a,r[l],n,s,t)}}function cn(e){return e.toLowerCase().replace(/-([a-z])/g,(t,n)=>n.toUpperCase())}function Be(e,t,n){const o=t.trim().split(/\s+/);for(let r=0,s=o.length;r<s;r++)e.classList.toggle(o[r],n)}function qe(e,t,n,o,r,s,l){let a,i,c,p,d;if(t==="style")return it(e,n,o);if(t==="classList")return an(e,n,o);if(n===o)return o;if(t==="ref")s||n(e);else if(t.slice(0,3)==="on:"){const m=t.slice(3);o&&e.removeEventListener(m,o,typeof o!="function"&&o),n&&e.addEventListener(m,n,typeof n!="function"&&n)}else if(t.slice(0,10)==="oncapture:"){const m=t.slice(10);o&&e.removeEventListener(m,o,!0),n&&e.addEventListener(m,n,!0)}else if(t.slice(0,2)==="on"){const m=t.slice(2).toLowerCase(),h=zt.has(m);if(!h&&o){const b=Array.isArray(o)?o[0]:o;e.removeEventListener(m,b)}(h||n)&&(on(e,m,n,h),h&&re([m]))}else if(t.slice(0,5)==="attr:")J(e,t.slice(5),n);else if(t.slice(0,5)==="bool:")nn(e,t.slice(5),n);else if((d=t.slice(0,5)==="prop:")||(c=Qt.has(t))||!r&&((p=Yt(t,e.tagName))||(i=Kt.has(t)))||(a=e.nodeName.includes("-")||"is"in l))d&&(t=t.slice(5),i=!0),t==="class"||t==="className"?rn(e,n):a&&!i&&!c?e[cn(t)]=n:e[p||t]=n;else{const m=r&&t.indexOf(":")>-1&&Zt[t.split(":")[0]];m?tn(e,m,t,n):J(e,Xt[t]||t,n)}return n}function pn(e){let t=e.target;const n=`$$${e.type}`,o=e.target,r=e.currentTarget,s=i=>Object.defineProperty(e,"target",{configurable:!0,value:i}),l=()=>{const i=t[n];if(i&&!t.disabled){const c=t[`${n}Data`];if(c!==void 0?i.call(t,c,e):i.call(t,e),e.cancelBubble)return}return t.host&&typeof t.host!="string"&&!t.host._$host&&t.contains(e.target)&&s(t.host),!0},a=()=>{for(;l()&&(t=t._$host||t.parentNode||t.host););};if(Object.defineProperty(e,"currentTarget",{configurable:!0,get(){return t||document}}),e.composedPath){const i=e.composedPath();s(i[0]);for(let c=0;c<i.length-2&&(t=i[c],!!l());c++){if(t._$host){t=t._$host,a();break}if(t.parentNode===r)break}}else a();s(o)}function ee(e,t,n,o,r){for(;typeof n=="function";)n=n();if(t===n)return n;const s=typeof t,l=o!==void 0;if(e=l&&n[0]&&n[0].parentNode||e,s==="string"||s==="number"){if(s==="number"&&(t=t.toString(),t===n))return n;if(l){let a=n[0];a&&a.nodeType===3?a.data!==t&&(a.data=t):a=document.createTextNode(t),n=Q(e,n,o,a)}else n!==""&&typeof n=="string"?n=e.firstChild.data=t:n=e.textContent=t}else if(t==null||s==="boolean")n=Q(e,n,o);else{if(s==="function")return N(()=>{let a=t();for(;typeof a=="function";)a=a();n=ee(e,a,n,o)}),()=>n;if(Array.isArray(t)){const a=[],i=n&&Array.isArray(n);if(Ie(a,t,n,r))return N(()=>n=ee(e,a,n,o,!0)),()=>n;if(a.length===0){if(n=Q(e,n,o),l)return n}else i?n.length===0?Ke(e,a,o):Jt(e,n,a):(n&&Q(e),Ke(e,a));n=a}else if(t.nodeType){if(Array.isArray(n)){if(l)return n=Q(e,n,o,t);Q(e,n,null,t)}else n==null||n===""||!e.firstChild?e.appendChild(t):e.replaceChild(t,e.firstChild);n=t}}return n}function Ie(e,t,n,o){let r=!1;for(let s=0,l=t.length;s<l;s++){let a=t[s],i=n&&n[e.length],c;if(!(a==null||a===!0||a===!1))if((c=typeof a)=="object"&&a.nodeType)e.push(a);else if(Array.isArray(a))r=Ie(e,a,i)||r;else if(c==="function")if(o){for(;typeof a=="function";)a=a();r=Ie(e,Array.isArray(a)?a:[a],Array.isArray(i)?i:[i])||r}else e.push(a),r=!0;else{const p=String(a);i&&i.nodeType===3&&i.data===p?e.push(i):e.push(document.createTextNode(p))}}return r}function Ke(e,t,n=null){for(let o=0,r=t.length;o<r;o++)e.insertBefore(t[o],n)}function Q(e,t,n,o){if(n===void 0)return e.textContent="";const r=o||document.createTextNode("");if(t.length){let s=!1;for(let l=t.length-1;l>=0;l--){const a=t[l];if(r!==a){const i=a.parentNode===e;!s&&!l?i?e.replaceChild(r,a):e.insertBefore(r,n):i&&a.remove()}else s=!0}}else e.insertBefore(r,n);return[r]}const dn=!1;function ct(){let e=new Set;function t(r){return e.add(r),()=>e.delete(r)}let n=!1;function o(r,s){if(n)return!(n=!1);const l={to:r,options:s,defaultPrevented:!1,preventDefault:()=>l.defaultPrevented=!0};for(const a of e)a.listener({...l,from:a.location,retry:i=>{i&&(n=!0),a.navigate(r,{...s,resolve:!1})}});return!l.defaultPrevented}return{subscribe:t,confirm:o}}let Ee;function Le(){(!window.history.state||window.history.state._depth==null)&&window.history.replaceState({...window.history.state,_depth:window.history.length-1},""),Ee=window.history.state._depth}Le();function un(e){return{...e,_depth:window.history.state&&window.history.state._depth}}function mn(e,t){let n=!1;return()=>{const o=Ee;Le();const r=o==null?null:Ee-o;if(n){n=!1;return}r&&t(r)?(n=!0,window.history.go(-r)):e()}}const hn=/^(?:[a-z0-9]+:)?\/\//i,fn=/^\/+|(\/)\/+$/g,pt="http://sr";function q(e,t=!1){const n=e.replace(fn,"$1");return n?t||/^[?#]/.test(n)?n:"/"+n:""}function ce(e,t,n){if(hn.test(t))return;const o=q(e),r=n&&q(n);let s="";return!r||t.startsWith("/")?s=o:r.toLowerCase().indexOf(o.toLowerCase())!==0?s=o+r:s=r,(s||"/")+q(t,!s)}function gn(e,t){if(e==null)throw new Error(t);return e}function wn(e,t){return q(e).replace(/\/*(\*.*)?$/g,"")+q(t)}function dt(e){const t={};return e.searchParams.forEach((n,o)=>{o in t?Array.isArray(t[o])?t[o].push(n):t[o]=[t[o],n]:t[o]=n}),t}function vn(e,t,n){const[o,r]=e.split("/*",2),s=o.split("/").filter(Boolean),l=s.length;return a=>{const i=a.split("/").filter(Boolean),c=i.length-l;if(c<0||c>0&&r===void 0&&!t)return null;const p={path:l?"":"/",params:{}},d=m=>n===void 0?void 0:n[m];for(let m=0;m<l;m++){const h=s[m],b=h[0]===":",f=b?i[m]:i[m].toLowerCase(),v=b?h.slice(1):h.toLowerCase();if(b&&Pe(f,d(v)))p.params[v]=f;else if(b||!Pe(f,v))return null;p.path+=`/${f}`}if(r){const m=c?i.slice(-c).join("/"):"";if(Pe(m,d(r)))p.params[r]=m;else return null}return p}}function Pe(e,t){const n=o=>o===e;return t===void 0?!0:typeof t=="string"?n(t):typeof t=="function"?t(e):Array.isArray(t)?t.some(n):t instanceof RegExp?t.test(e):!1}function bn(e){const[t,n]=e.pattern.split("/*",2),o=t.split("/").filter(Boolean);return o.reduce((r,s)=>r+(s.startsWith(":")?2:3),o.length-(n===void 0?0:1))}function ut(e){const t=new Map,n=tt();return new Proxy({},{get(o,r){return t.has(r)||nt(n,()=>t.set(r,$(()=>e()[r]))),t.get(r)()},getOwnPropertyDescriptor(){return{enumerable:!0,configurable:!0}},ownKeys(){return Reflect.ownKeys(e())}})}function mt(e){let t=/(\/?\:[^\/]+)\?/.exec(e);if(!t)return[e];let n=e.slice(0,t.index),o=e.slice(t.index+t[0].length);const r=[n,n+=t[1]];for(;t=/^(\/\:[^\/]+)\?/.exec(o);)r.push(n+=t[1]),o=o.slice(t[0].length);return mt(o).reduce((s,l)=>[...s,...r.map(a=>a+l)],[])}const yn=100,ht=ge(),Fe=ge(),we=()=>gn(te(ht),"<A> and 'use' router primitives can be only used inside a Route."),_n=()=>te(Fe)||we().base,Sn=e=>{const t=_n();return $(()=>t.resolvePath(e()))},xn=e=>{const t=we();return $(()=>{const n=e();return n!==void 0?t.renderPath(n):n})},ft=()=>we().navigatorFactory(),Pn=()=>we().location;function Cn(e,t=""){const{component:n,preload:o,load:r,children:s,info:l}=e,a=!s||Array.isArray(s)&&!s.length,i={key:e,component:n,preload:o||r,info:l};return gt(e.path).reduce((c,p)=>{for(const d of mt(p)){const m=wn(t,d);let h=a?m:m.split("/*",1)[0];h=h.split("/").map(b=>b.startsWith(":")||b.startsWith("*")?b:encodeURIComponent(b)).join("/"),c.push({...i,originalPath:p,pattern:h,matcher:vn(h,!a,e.matchFilters)})}return c},[])}function On(e,t=0){return{routes:e,score:bn(e[e.length-1])*1e4-t,matcher(n){const o=[];for(let r=e.length-1;r>=0;r--){const s=e[r],l=s.matcher(n);if(!l)return null;o.unshift({...l,route:s})}return o}}}function gt(e){return Array.isArray(e)?e:[e]}function wt(e,t="",n=[],o=[]){const r=gt(e);for(let s=0,l=r.length;s<l;s++){const a=r[s];if(a&&typeof a=="object"){a.hasOwnProperty("path")||(a.path="");const i=Cn(a,t);for(const c of i){n.push(c);const p=Array.isArray(a.children)&&a.children.length===0;if(a.children&&!p)wt(a.children,c.pattern,n,o);else{const d=On([...n],o.length);o.push(d)}n.pop()}}}return n.length?o:o.sort((s,l)=>l.score-s.score)}function Ce(e,t){for(let n=0,o=e.length;n<o;n++){const r=e[n].matcher(t);if(r)return r}return[]}function An(e,t,n){const o=new URL(pt),r=$(p=>{const d=e();try{return new URL(d,o)}catch{return console.error(`Invalid path ${d}`),p}},o,{equals:(p,d)=>p.href===d.href}),s=$(()=>r().pathname),l=$(()=>r().search,!0),a=$(()=>r().hash),i=()=>"",c=Te(l,()=>dt(r()));return{get pathname(){return s()},get search(){return l()},get hash(){return a()},get state(){return t()},get key(){return i()},query:n?n(c):ut(c)}}let B;function $n(){return B}function kn(e,t,n,o={}){const{signal:[r,s],utils:l={}}=e,a=l.parsePath||(x=>x),i=l.renderPath||(x=>x),c=l.beforeLeave||ct(),p=ce("",o.base||"");if(p===void 0)throw new Error(`${p} is not a valid base path`);p&&!r().value&&s({value:p,replace:!0,scroll:!1});const[d,m]=T(!1);let h;const b=(x,C)=>{C.value===f()&&C.state===_()||(h===void 0&&m(!0),B=x,h=C,Tt(()=>{h===C&&(v(h.value),y(h.state),E[1]([]))}).finally(()=>{h===C&&Et(()=>{B=void 0,x==="navigate"&&Pt(h),m(!1),h=void 0})}))},[f,v]=T(r().value),[_,y]=T(r().state),O=An(f,_,l.queryWrapper),A=[],E=T([]),W=$(()=>typeof o.transformUrl=="function"?Ce(t(),o.transformUrl(O.pathname)):Ce(t(),O.pathname)),Ue=()=>{const x=W(),C={};for(let M=0;M<x.length;M++)Object.assign(C,x[M].params);return C},_t=l.paramsWrapper?l.paramsWrapper(Ue,t):ut(Ue),je={pattern:p,path:()=>p,outlet:()=>null,resolvePath(x){return ce(p,x)}};return N(Te(r,x=>b("native",x),{defer:!0})),{base:je,location:O,params:_t,isRouting:d,renderPath:i,parsePath:a,navigatorFactory:xt,matches:W,beforeLeave:c,preloadRoute:Ct,singleFlight:o.singleFlight===void 0?!0:o.singleFlight,submissions:E};function St(x,C,M){F(()=>{if(typeof C=="number"){C&&(l.go?l.go(C):console.warn("Router integration does not support relative routing"));return}const se=!C||C[0]==="?",{replace:be,resolve:K,scroll:ye,state:X}={replace:!1,resolve:!se,scroll:!0,...M},le=K?x.resolvePath(C):ce(se&&O.pathname||"",C);if(le===void 0)throw new Error(`Path '${C}' is not a routable path`);if(A.length>=yn)throw new Error("Too many redirects");const Ge=f();(le!==Ge||X!==_())&&(dn||c.confirm(le,M)&&(A.push({value:Ge,replace:be,scroll:ye,state:_()}),b("navigate",{value:le,state:X})))})}function xt(x){return x=x||te(Fe)||je,(C,M)=>St(x,C,M)}function Pt(x){const C=A[0];C&&(s({...x,replace:C.replace,scroll:C.scroll}),A.length=0)}function Ct(x,C){const M=Ce(t(),x.pathname),se=B;B="preload";for(let be in M){const{route:K,params:ye}=M[be];K.component&&K.component.preload&&K.component.preload();const{preload:X}=K;C&&X&&nt(n(),()=>X({params:ye,location:{pathname:x.pathname,search:x.search,hash:x.hash,query:dt(x),state:null,key:""},intent:"preload"}))}B=se}}function In(e,t,n,o){const{base:r,location:s,params:l}=e,{pattern:a,component:i,preload:c}=o().route,p=$(()=>o().path);i&&i.preload&&i.preload();const d=c?c({params:l,location:s,intent:B||"initial"}):void 0;return{parent:t,pattern:a,path:p,outlet:()=>i?u(i,{params:l,location:s,data:d,get children(){return n()}}):n(),resolvePath(h){return ce(r.path(),h,p())}}}const En=e=>t=>{const{base:n}=t,o=Ne(()=>t.children),r=$(()=>wt(o(),t.base||""));let s;const l=kn(e,r,()=>s,{base:n,singleFlight:t.singleFlight,transformUrl:t.transformUrl});return e.create&&e.create(l),u(ht.Provider,{value:l,get children(){return u(Tn,{routerState:l,get root(){return t.root},get preload(){return t.rootPreload||t.rootLoad},get children(){return[z(()=>(s=tt())&&null),u(Nn,{routerState:l,get branches(){return r()}})]}})}})};function Tn(e){const t=e.routerState.location,n=e.routerState.params,o=$(()=>e.preload&&F(()=>{e.preload({params:n,location:t,intent:$n()||"initial"})}));return u(lt,{get when(){return e.root},keyed:!0,get fallback(){return e.children},children:r=>u(r,{params:n,location:t,get data(){return o()},get children(){return e.children}})})}function Nn(e){const t=[];let n;const o=$(Te(e.routerState.matches,(r,s,l)=>{let a=s&&r.length===s.length;const i=[];for(let c=0,p=r.length;c<p;c++){const d=s&&s[c],m=r[c];l&&d&&m.route.key===d.route.key?i[c]=l[c]:(a=!1,t[c]&&t[c](),Y(h=>{t[c]=h,i[c]=In(e.routerState,i[c-1]||e.routerState.base,Qe(()=>o()[c+1]),()=>e.routerState.matches()[c])}))}return t.splice(r.length).forEach(c=>c()),l&&a?l:(n=i[0],i)}));return Qe(()=>o()&&n)()}const Qe=e=>()=>u(lt,{get when(){return e()},keyed:!0,children:t=>u(Fe.Provider,{value:t,get children(){return t.outlet()}})}),R=e=>{const t=Ne(()=>e.children);return $e(e,{get children(){return t()}})};function Dn([e,t],n,o){return[e,o?r=>t(o(r)):t]}function Rn(e){let t=!1;const n=r=>typeof r=="string"?{value:r}:r,o=Dn(T(n(e.get()),{equals:(r,s)=>r.value===s.value&&r.state===s.state}),void 0,r=>(!t&&e.set(r),r));return e.init&&G(e.init((r=e.get())=>{t=!0,o[1](n(r)),t=!1})),En({signal:o,create:e.create,utils:e.utils})}function Ln(e,t,n){return e.addEventListener(t,n),()=>e.removeEventListener(t,n)}function Fn(e,t){const n=e&&document.getElementById(e);n?n.scrollIntoView():t&&window.scrollTo(0,0)}const Mn=new Map;function Un(e=!0,t=!1,n="/_server",o){return r=>{const s=r.base.path(),l=r.navigatorFactory(r.base);let a,i;function c(f){return f.namespaceURI==="http://www.w3.org/2000/svg"}function p(f){if(f.defaultPrevented||f.button!==0||f.metaKey||f.altKey||f.ctrlKey||f.shiftKey)return;const v=f.composedPath().find(W=>W instanceof Node&&W.nodeName.toUpperCase()==="A");if(!v||t&&!v.hasAttribute("link"))return;const _=c(v),y=_?v.href.baseVal:v.href;if((_?v.target.baseVal:v.target)||!y&&!v.hasAttribute("state"))return;const A=(v.getAttribute("rel")||"").split(/\s+/);if(v.hasAttribute("download")||A&&A.includes("external"))return;const E=_?new URL(y,document.baseURI):new URL(y);if(!(E.origin!==window.location.origin||s&&E.pathname&&!E.pathname.toLowerCase().startsWith(s.toLowerCase())))return[v,E]}function d(f){const v=p(f);if(!v)return;const[_,y]=v,O=r.parsePath(y.pathname+y.search+y.hash),A=_.getAttribute("state");f.preventDefault(),l(O,{resolve:!1,replace:_.hasAttribute("replace"),scroll:!_.hasAttribute("noscroll"),state:A?JSON.parse(A):void 0})}function m(f){const v=p(f);if(!v)return;const[_,y]=v;r.preloadRoute(y,_.getAttribute("preload")!=="false")}function h(f){clearTimeout(a);const v=p(f);if(!v)return i=null;const[_,y]=v;i!==_&&(a=setTimeout(()=>{r.preloadRoute(y,_.getAttribute("preload")!=="false"),i=_},20))}function b(f){if(f.defaultPrevented)return;let v=f.submitter&&f.submitter.hasAttribute("formaction")?f.submitter.getAttribute("formaction"):f.target.getAttribute("action");if(!v)return;if(!v.startsWith("https://action/")){const y=new URL(v,pt);if(v=r.parsePath(y.pathname+y.search),!v.startsWith(n))return}if(f.target.method.toUpperCase()!=="POST")throw new Error("Only POST forms are supported for Actions");const _=Mn.get(v);if(_){f.preventDefault();const y=new FormData(f.target,f.submitter);_.call({r,f:f.target},f.target.enctype==="multipart/form-data"?y:new URLSearchParams(y))}}re(["click","submit"]),document.addEventListener("click",d),e&&(document.addEventListener("mousemove",h,{passive:!0}),document.addEventListener("focusin",m,{passive:!0}),document.addEventListener("touchstart",m,{passive:!0})),document.addEventListener("submit",b),G(()=>{document.removeEventListener("click",d),e&&(document.removeEventListener("mousemove",h),document.removeEventListener("focusin",m),document.removeEventListener("touchstart",m)),document.removeEventListener("submit",b)})}}function jn(e){const t=e.replace(/^.*?#/,"");if(!t.startsWith("/")){const[,n="/"]=window.location.hash.split("#",2);return`${n}#${t}`}return t}function Gn(e){const t=()=>window.location.hash.slice(1),n=ct();return Rn({get:t,set({value:o,replace:r,scroll:s,state:l}){r?window.history.replaceState(un(l),"","#"+o):window.history.pushState(l,"","#"+o);const a=o.indexOf("#"),i=a>=0?o.slice(a+1):"";Fn(i,s),Le()},init:o=>Ln(window,"hashchange",mn(o,r=>!n.confirm(r&&r<0?r:t()))),create:Un(e.preload,e.explicitLinks,e.actionBase),utils:{go:o=>window.history.go(o),renderPath:o=>`#${o}`,parsePath:jn,beforeLeave:n}})(e)}var Hn=w("<a>");function k(e){e=$e({inactiveClass:"inactive",activeClass:"active"},e);const[,t]=Gt(e,["href","state","class","activeClass","inactiveClass","end"]),n=Sn(()=>e.href),o=xn(n),r=Pn(),s=$(()=>{const l=n();if(l===void 0)return[!1,!1];const a=q(l.split(/[?#]/,1)[0]).toLowerCase(),i=decodeURI(q(r.pathname).toLowerCase());return[e.end?a===i:i.startsWith(a+"/")||i===a,a===i]});return(()=>{var l=Hn();return ke(l,$e(t,{get href(){return o()||e.href},get state(){return JSON.stringify(e.state)},get classList(){return{...e.class&&{[e.class]:!0},[e.inactiveClass]:!s()[0],[e.activeClass]:s()[0],...t.classList}},link:"",get"aria-current"(){return s()[1]?"page":void 0}}),!1,!1),l})()}const vt=ge(),Wn=["title","meta"],Xe=[],Ve=["name","http-equiv","content","charset","media"].concat(["property"]),Ye=(e,t)=>{const n=Object.fromEntries(Object.entries(e.props).filter(([o])=>t.includes(o)).sort());return(Object.hasOwn(n,"name")||Object.hasOwn(n,"property"))&&(n.name=n.name||n.property,delete n.property),e.tag+JSON.stringify(n)};function Bn(){{const n=document.head.querySelectorAll("[data-sm]");Array.prototype.forEach.call(n,o=>o.parentNode.removeChild(o))}const e=new Map;function t(n){if(n.ref)return n.ref;let o=document.querySelector(`[data-sm="${n.id}"]`);return o?(o.tagName.toLowerCase()!==n.tag&&(o.parentNode&&o.parentNode.removeChild(o),o=document.createElement(n.tag)),o.removeAttribute("data-sm")):o=document.createElement(n.tag),o}return{addTag(n){if(Wn.indexOf(n.tag)!==-1){const s=n.tag==="title"?Xe:Ve,l=Ye(n,s);e.has(l)||e.set(l,[]);let a=e.get(l),i=a.length;a=[...a,n],e.set(l,a);let c=t(n);n.ref=c,ke(c,n.props);let p=null;for(var o=i-1;o>=0;o--)if(a[o]!=null){p=a[o];break}return c.parentNode!=document.head&&document.head.appendChild(c),p&&p.ref&&p.ref.parentNode&&document.head.removeChild(p.ref),i}let r=t(n);return n.ref=r,ke(r,n.props),r.parentNode!=document.head&&document.head.appendChild(r),-1},removeTag(n,o){const r=n.tag==="title"?Xe:Ve,s=Ye(n,r);if(n.ref){const l=e.get(s);if(l){if(n.ref.parentNode){n.ref.parentNode.removeChild(n.ref);for(let a=o-1;a>=0;a--)l[a]!=null&&document.head.appendChild(l[a].ref)}l[o]=null,e.set(s,l)}else n.ref.parentNode&&n.ref.parentNode.removeChild(n.ref)}}}}const qn=e=>{const t=Bn();return u(vt.Provider,{value:t,get children(){return e.children}})},bt=(e,t,n)=>(Kn({tag:e,props:t,setting:n,id:Wt(),get name(){return t.name||t.property}}),null);function Kn(e){const t=te(vt);if(!t)throw new Error("<MetaProvider /> should be in the tree");N(()=>{const n=t.addTag(e);G(()=>t.removeTag(e,n))})}const L=e=>bt("title",e,{escape:!0,close:!0}),V=e=>bt("meta",e),Qn="4bc8c4f28c625fca2004a5f486c31aa4f161dc9f3c0c6b2c9237db12f55ac442",Xn="ba5f920b7136c1cd3101518a952c085a4e2313e4800d628c86b630f142808039";async function ze(e){const t=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(e));return Array.from(new Uint8Array(t)).map(n=>n.toString(16).padStart(2,"0")).join("")}const yt=ge();function Vn(e){const[t,n]=T(localStorage.getItem("auth_logged_in")==="true"),[o,r]=T(localStorage.getItem("auth_username")||""),s=async(a,i)=>{const c=await ze(a),p=await ze(i);return c===Qn&&p===Xn?(localStorage.setItem("auth_logged_in","true"),localStorage.setItem("auth_username",a),n(!0),r(a),!0):!1},l=()=>{localStorage.removeItem("auth_logged_in"),localStorage.removeItem("auth_username"),n(!1),r("")};return u(yt.Provider,{value:{isLoggedIn:t,username:o,login:s,logout:l},get children(){return e.children}})}function Me(){const e=te(yt);if(!e)throw new Error("useAuth must be used within AuthProvider");return e}var Yn=w("<nav id=navbar><ul class=nav-links><li></li><li></li><li></li><li></li><li>"),zn=w("<span class=logged-in-text style=cursor:pointer;color:#00d4ff;font-weight:bold;font-size:0.9rem>已登录"),Zn=w("<div class=dialog-overlay>"),Jn=w('<div class=dialog-box><p style="margin:0 0 6px;font-size:1rem">当前用户：<strong></strong></p><p style="margin:0 0 20px;color:#888;font-size:0.85rem">确定要退出登录吗？退出后需重新输入密码访问项目链接。</p><div style=display:flex;gap:10px;justify-content:flex-end><button style="padding:8px 20px;background:#333;color:#fff;border:none;border-radius:6px;cursor:pointer">取消</button><button style="padding:8px 20px;background:#d33;color:#fff;border:none;border-radius:6px;cursor:pointer">退出登录');function er(){let e;const{isLoggedIn:t,username:n,logout:o}=Me(),[r,s]=T(!1);D(()=>{let a=window.scrollY;const i=()=>{const c=Math.max(0,window.scrollY);c>a&&c>100?e.classList.add("hidden"):e.classList.remove("hidden"),a=c};window.addEventListener("scroll",i),G(()=>window.removeEventListener("scroll",i))});const l=()=>{o(),s(!1)};return[(()=>{var a=Yn(),i=a.firstChild,c=i.firstChild,p=c.nextSibling,d=p.nextSibling,m=d.nextSibling,h=m.nextSibling,b=e;return typeof b=="function"?oe(b,a):e=a,g(a,u(k,{href:"/",class:"logo",style:"text-decoration:none;",children:"DeltrivX"}),i),g(c,u(k,{href:"/about",children:"关于"})),g(p,u(k,{href:"/skills",children:"技能"})),g(d,u(k,{href:"/projects",children:"项目"})),g(m,u(k,{href:"/articles",children:"实战"})),g(h,(()=>{var f=z(()=>!!t());return()=>f()?(()=>{var v=zn();return v.$$click=()=>s(!0),v})():u(k,{href:"/login",style:"color:#007bff;font-weight:bold;",children:"登录"})})()),a})(),z(()=>z(()=>!!r())()&&[(()=>{var a=Zn();return a.$$click=()=>s(!1),a})(),(()=>{var a=Jn(),i=a.firstChild,c=i.firstChild,p=c.nextSibling,d=i.nextSibling,m=d.nextSibling,h=m.firstChild,b=h.nextSibling;return g(p,n),h.$$click=()=>s(!1),b.$$click=l,a})()])]}re(["click"]);var tr=w("<footer><p>© <!> DeltrivX. Made with ❤️ and lots of ☕");function nr(){const e=new Date().getFullYear();return(()=>{var t=tr(),n=t.firstChild,o=n.firstChild,r=o.nextSibling;return r.nextSibling,g(n,e,r),t})()}var rr=w("<canvas id=particles>");function or(){let e,t;return D(()=>{const n=e.getContext("2d");let o=[],r={x:null,y:null};const s=()=>{e.width=window.innerWidth,e.height=window.innerHeight};s(),window.addEventListener("resize",s);const l=p=>{r.x=p.clientX,r.y=p.clientY};document.addEventListener("mousemove",l);class a{constructor(){this.reset()}reset(){this.x=Math.random()*e.width,this.y=Math.random()*e.height,this.size=Math.random()*2+.5,this.speedX=(Math.random()-.5)*.5,this.speedY=(Math.random()-.5)*.5,this.opacity=Math.random()*.5+.1}update(){if(this.x+=this.speedX,this.y+=this.speedY,r.x!==null){const d=r.x-this.x,m=r.y-this.y,h=Math.sqrt(d*d+m*m);if(h<120){const b=(120-h)/120;this.x-=d/h*b*1.5,this.y-=m/h*b*1.5}}(this.x<0||this.x>e.width||this.y<0||this.y>e.height)&&this.reset()}draw(){n.beginPath(),n.arc(this.x,this.y,this.size,0,Math.PI*2),n.fillStyle=`rgba(108, 92, 231, ${this.opacity})`,n.fill()}}const i=Math.min(120,Math.floor(e.width*e.height/12e3));for(let p=0;p<i;p++)o.push(new a);function c(){n.clearRect(0,0,e.width,e.height),o.forEach(p=>{p.update(),p.draw()}),t=requestAnimationFrame(c)}c(),G(()=>{window.removeEventListener("resize",s),document.removeEventListener("mousemove",l),cancelAnimationFrame(t)})}),(()=>{var n=rr(),o=e;return typeof o=="function"?oe(o,n):e=n,n})()}var ar=w("<div class=spotlight>"),sr=w("<main>");function lr(e){let t;return D(()=>{const n=o=>{document.documentElement.style.setProperty("--mouse-x",`${o.clientX}px`),document.documentElement.style.setProperty("--mouse-y",`${o.clientY}px`)};window.addEventListener("mousemove",n),G(()=>window.removeEventListener("mousemove",n))}),[(()=>{var n=ar(),o=t;return typeof o=="function"?oe(o,n):t=n,n})(),u(or,{}),u(er,{}),(()=>{var n=sr();return g(n,()=>e.children),n})(),u(nr,{})]}function ae(){const e=document.querySelectorAll(".reveal"),t=new IntersectionObserver(n=>{n.forEach((o,r)=>{o.isIntersecting&&setTimeout(()=>o.target.classList.add("visible"),r*100)})},{threshold:.15});e.forEach(n=>t.observe(n))}function ve(){document.querySelectorAll(".tilt-card").forEach(t=>{const n=t.querySelector(".tilt-card-inner")||t;t.addEventListener("mousemove",o=>{const r=t.getBoundingClientRect(),s=o.clientX-r.left,l=o.clientY-r.top,a=r.width/2,i=r.height/2,c=(l-i)/i*-10,p=(s-a)/a*10;n.style.transform=`rotateX(${c}deg) rotateY(${p}deg) scale(1.02)`}),t.addEventListener("mouseleave",()=>{n.style.transform="rotateX(0) rotateY(0) scale(1)"})})}var ir=w("<section class=hero><div class=hero-content><span class=hero-badge>👋 欢迎来到我的个人主页</span><h1>Hi, I'm <span class=gradient-text>DeltrivX</span></h1><div class=typewriter></div><div class=hero-buttons></div></div><div class=scroll-indicator><span>"),cr=w("<div class=nav-card-icon>👨‍💻"),pr=w("<h3>关于我"),dr=w("<p>了解我的背景和经历"),ur=w("<div class=nav-card-icon>⚡"),mr=w("<h3>技能栈"),hr=w("<p>掌握的技术与工具"),fr=w("<div class=nav-card-icon>🚀"),gr=w("<h3>精选项目"),wr=w("<p>查看我的作品展示"),vr=w("<div class=nav-card-icon>📝"),br=w("<h3>文章"),yr=w("<p>阅读我的技术分享"),_r=w('<section class=explore-section><div class="section-header reveal"><h2><span class=gradient-text>探索更多</span></h2><p>了解我的技能、项目和联系方式</p></div><div class=nav-cards-grid>');function Sr(){let e,t;return D(()=>{ae(),ve();const n=["全栈开发者 🚀","UI/UX 设计爱好者 🎨","开源贡献者 💡","终身学习者 📚","AI 探索者 🤖"];let o=0,r=0,s=!1;function l(){const a=n[o];s?(e.innerHTML=a.substring(0,r-1)+'<span class="cursor"></span>',r--):(e.innerHTML=a.substring(0,r+1)+'<span class="cursor"></span>',r++);let i=s?40:80;!s&&r===a.length?(i=2e3,s=!0):s&&r===0&&(s=!1,o=(o+1)%n.length,i=500),t=setTimeout(l,i)}l()}),G(()=>clearTimeout(t)),[(()=>{var n=ir(),o=n.firstChild,r=o.firstChild,s=r.nextSibling,l=s.nextSibling,a=l.nextSibling,i=e;return typeof i=="function"?oe(i,l):e=l,g(a,u(k,{href:"/projects",class:"btn btn-primary",children:"🚀 查看项目"}),null),g(a,u(k,{href:"/about",class:"btn btn-outline",children:"💬 联系我"}),null),n})(),(()=>{var n=_r(),o=n.firstChild,r=o.nextSibling;return g(r,u(k,{href:"/about",class:"nav-card reveal tilt-card",get children(){return[cr(),pr(),dr()]}}),null),g(r,u(k,{href:"/skills",class:"nav-card reveal tilt-card",get children(){return[ur(),mr(),hr()]}}),null),g(r,u(k,{href:"/projects",class:"nav-card reveal tilt-card",get children(){return[fr(),gr(),wr()]}}),null),g(r,u(k,{href:"/articles",class:"nav-card reveal tilt-card",get children(){return[vr(),br(),yr()]}}),null),n})()]}var xr=w('<section id=about><div class=about-grid><div class="about-image-wrapper reveal"><div class=about-image>🖥️</div></div><div class="about-text reveal"><h3>AI 折腾党 & 自建派</h3><p>我是 DeltrivX，一名热爱自建（self-hosting）的技术爱好者。从一台 FnOS 起步，逐步搭建起覆盖存储、影音、下载、AI 的家庭数据中心。</p><p>热衷于用 Docker 容器编排各类服务，打通 Cloudflare Tunnel 公网访问，构建属于自己的数字基础设施。同时也在探索 LLM 应用与 AIGC 的可能性。</p><div class=stats-row><div class=stat-item><div class=stat-number data-target=27>0</div><div class=stat-label>Docker 容器</div></div><div class=stat-item><div class=stat-number data-target=20>0</div><div class=stat-label>自建服务</div></div><div class=stat-item><div class=stat-number data-target=9>0</div><div class=stat-label>GitHub 仓库</div></div></div></div></div><div class="contact-wrapper reveal"><div class=contact-info><h3>保持联系 🤝</h3><p>无论是项目合作、技术交流还是随便聊聊，都欢迎联系我。</p><div class=contact-links><a href=mailto:deltrivx@icloud.com class=contact-link-item><span class=contact-link-icon>📧</span><div class=contact-link-text><strong>Email</strong><span>deltrivx@icloud.com</span></div></a><a href=https://github.com/deltrivx target=_blank rel=noopener class=contact-link-item><span class=contact-link-icon>🐙</span><div class=contact-link-text><strong>GitHub</strong><span>DeltrivX</span></div></a><a href=https://x.com/deltrivx target=_blank rel=noopener class=contact-link-item><span class=contact-link-icon>🐦</span><div class=contact-link-text><strong>Twitter（X）</strong><span>@deltrivx</span></div></a></div></div><form class=contact-form action=https://formspree.io/f/placeholder><div class=form-group><input type=text name=name placeholder=你的名字 required></div><div class=form-group><input type=email name=email placeholder=你的邮箱 required></div><div class=form-group><textarea name=message placeholder=你想说什么... required></textarea></div><button type=submit class="btn btn-primary">');function Pr(){const[e,t]=T({text:"🚀 发送消息",bg:""});let n=!1;D(()=>{ae();const r=document.querySelectorAll(".stat-number"),s=new IntersectionObserver(l=>{l.forEach(a=>{if(a.isIntersecting){const i=a.target,c=parseInt(i.dataset.target);let p=0;const d=Math.max(1,Math.floor(c/60)),m=setInterval(()=>{p+=d,p>=c&&(p=c,clearInterval(m)),i.textContent=p.toLocaleString()+"+"},30);s.unobserve(i)}})},{threshold:.5});r.forEach(l=>s.observe(l))});const o=async r=>{if(r.preventDefault(),n)return;n=!0;const s=r.target;t({text:"⏳ 发送中...",bg:""});try{if((await fetch(s.action,{method:"POST",body:new FormData(s),headers:{Accept:"application/json"}})).ok)t({text:"✅ 已发送！",bg:"linear-gradient(135deg, #00b894, #00cec9)"}),s.reset();else throw new Error("发送失败")}catch{t({text:"❌ 发送失败，请直接邮件联系",bg:"linear-gradient(135deg, #d63031, #e17055)"})}setTimeout(()=>{n=!1,t({text:"🚀 发送消息",bg:""})},3e3)};return(()=>{var r=xr(),s=r.firstChild,l=s.nextSibling,a=l.firstChild,i=a.nextSibling,c=i.firstChild,p=c.nextSibling,d=p.nextSibling,m=d.nextSibling;return i.addEventListener("submit",o),m.disabled=n,g(m,()=>e().text),N(h=>it(m,`width:100%;justify-content:center;background:${e().bg}`,h)),r})()}const Cr=[{icon:"🎨",title:"前端开发",description:"构建响应式、交互丰富的现代 Web 应用",tags:[{name:"SolidJS",level:88},{name:"React",level:82},{name:"TypeScript",level:80},{name:"Vite",level:88},{name:"Tailwind CSS",level:75}]},{icon:"⚙️",title:"后端开发",description:"设计高可用、可扩展的服务端架构",tags:[{name:"Node.js",level:85},{name:"Python",level:75},{name:"PostgreSQL",level:70},{name:"REST API",level:82}]},{icon:"☁️",title:"DevOps & 云",description:"自动化部署，保障系统稳定运行",tags:[{name:"Docker",level:85},{name:"Cloudflare",level:80},{name:"Nginx",level:75},{name:"GitHub Actions",level:80},{name:"Linux",level:78}]},{icon:"🤖",title:"AI 应用",description:"大模型应用开发与智能代理系统",tags:[{name:"LLM",level:85},{name:"RAG",level:78},{name:"AI Agent",level:85},{name:"TTS",level:72},{name:"Prompt Engineering",level:80}]},{icon:"🎬",title:"影视媒体",description:"全流程影视资源管理与媒体服务搭建",tags:[{name:"Emby",level:80},{name:"MoviePilot",level:75},{name:"FFmpeg",level:65},{name:"Aria2",level:82},{name:"qBittorrent",level:82},{name:"Transmission",level:78}]},{icon:"🗄️",title:"数据与存储",description:"多类型数据存储方案与私有云基础设施",tags:[{name:"PostgreSQL",level:72},{name:"Redis",level:70},{name:"Kvrocks",level:65},{name:"NAS 私有云",level:75}]}];var Or=w('<section id=skills><div class="section-header reveal"><h2><span class=gradient-text>技能栈</span></h2><p>持续学习，不断突破技术边界</p></div><div class=skills-grid>'),Ar=w('<div class="skill-card reveal tilt-card"><div class=skill-icon></div><h3></h3><p></p><div class=skill-tags></div><div class=skill-bar-group>'),$r=w("<span class=skill-tag>"),kr=w("<div class=skill-bar-item><div class=skill-bar-header><span></span><span>%</span></div><div class=skill-bar-track><div class=skill-bar-fill style=width:0>");function Ir(){return D(()=>{ae(),ve();const e=new IntersectionObserver(t=>{t.forEach(n=>{n.isIntersecting&&(n.target.querySelectorAll(".skill-bar-fill").forEach((r,s)=>{const l=r.dataset.level;setTimeout(()=>{r.style.width=l+"%"},s*80)}),e.unobserve(n.target))})},{threshold:.3});setTimeout(()=>{document.querySelectorAll(".skill-bar-group").forEach(t=>e.observe(t))},100)}),(()=>{var e=Or(),t=e.firstChild,n=t.nextSibling;return g(n,u(xe,{each:Cr,children:o=>(()=>{var r=Ar(),s=r.firstChild,l=s.nextSibling,a=l.nextSibling,i=a.nextSibling,c=i.nextSibling;return g(s,()=>o.icon),g(l,()=>o.title),g(a,()=>o.description),g(i,u(xe,{get each(){return o.tags},children:p=>(()=>{var d=$r();return g(d,()=>p.name),d})()})),g(c,u(xe,{get each(){return o.tags},children:p=>(()=>{var d=kr(),m=d.firstChild,h=m.firstChild,b=h.nextSibling,f=b.firstChild,v=m.nextSibling,_=v.firstChild;return g(h,()=>p.name),g(b,()=>p.level,f),N(()=>J(_,"data-level",p.level)),d})()})),r})()})),e})()}var Er=w('<a target=_blank rel="noopener noreferrer">');function Tr(e){const{isLoggedIn:t}=Me(),n=ft(),o=r=>{t()||(r.preventDefault(),n(`/login?redirect=${encodeURIComponent(e.href)}`))};return(()=>{var r=Er();return r.$$click=o,g(r,()=>e.label),N(()=>J(r,"href",e.href)),r})()}re(["click"]);var Nr=w('<section id=projects><div class="section-header reveal"><h2><span class=gradient-text>精选项目</span></h2><p>一些我引以为豪的作品</p></div><div class=projects-grid>'),Dr=w('<div class="project-card reveal tilt-card"><div class=project-preview><div class=project-preview-bg style=fontSize:3rem;display:flex;alignItems:center;justifyContent:center;height:100%></div></div><div class=project-info><h3></h3><p></p><div class=project-tech></div><div class=project-links>'),Rr=w("<span class=tech-tag>");function Lr(){D(()=>{ae(),ve()});const e=[{icon:"🐮",name:"飞牛系统",desc:"FnOS 私有云系统，提供存储、影音、下载等一站式服务。",tech:["FnOS","NAS"],links:[{url:"https://fnos.deltrivx.com",label:"🌐 公网"},{url:"http://192.168.31.2:5080",label:"🔗 内网"}]},{icon:"🧱",name:"宝塔面板",desc:"服务器运维管理面板，可视化网站、数据库、FTP 管理。",tech:["面板","运维"],links:[{url:"https://baota.deltrivx.com/btpanel",label:"🌐 公网"},{url:"http://192.168.31.5:19190/btpanel",label:"🔗 内网"}]},{icon:"🏠",name:"HomeAssistant",desc:"智能家居控制系统，集成灯光、传感器、自动化场景等设备。",tech:["IoT","智能家居"],links:[{url:"https://homeassistant.deltrivx.com",label:"🌐 公网"},{url:"http://192.168.31.3:8123",label:"🔗 内网"}]},{icon:"🎬",name:"飞牛影视",desc:"FnOS 内置影视中心，支持在线观影与媒体管理。",tech:["FnOS","影视"],links:[{url:"https://fntv.deltrivx.com",label:"🌐 公网"},{url:"http://192.168.31.2:8005",label:"🔗 内网"}]},{icon:"🔱",name:"Hermes",desc:"多平台消息集成网关，支持 QQBot、Telegram 等渠道统一接入。",tech:["Gateway","消息集成"],links:[{url:"https://hermes.deltrivx.com",label:"🌐 公网"},{url:"http://192.168.31.5:8787",label:"🔗 内网"}]},{icon:"🌀",name:"Sub2API",desc:"AI API 网关平台，支持订阅转换与多模型路由。",tech:["API","AI","Gateway"],links:[{url:"https://sub2api.deltrivx.com",label:"🌐 公网"},{url:"http://192.168.31.5:8080",label:"🔗 内网"}]},{icon:"🔗",name:"SubStore",desc:"订阅管理与转换工具，支持多协议节点聚合与规则处理。",tech:["订阅","代理","工具"],links:[{url:"https://substore.deltrivx.com",label:"🌐 公网"},{url:"http://192.168.31.5:3000",label:"🔗 内网"}]},{icon:"🛜",name:"iStoreOS",desc:"软路由与家庭网络管理系统，承载双网接入、插件扩展与局域网服务。",tech:["iStoreOS","软路由","网络"],links:[{url:"https://istoreos.deltrivx.com",label:"🌐 公网"},{url:"http://192.168.31.10:80",label:"🔗 内网"}]},{icon:"🌐",name:"Chromium",desc:"远程 Chromium 浏览器实例，支持自动化脚本和 Web 测试。",tech:["Chromium","浏览器"],links:[{url:"https://chromium.deltrivx.com",label:"🌐 公网"},{url:"https://192.168.31.2:3011",label:"🔗 内网"}]},{icon:"🐻",name:"Aria2",desc:"轻量级命令行下载工具，支持 HTTP/HTTPS/BT/Metalink 协议，搭配 AriaNg WebUI 管理。",tech:["aria2","下载"],links:[{url:"https://aria2.deltrivx.com",label:"🌐 公网"},{url:"http://192.168.31.2:6880",label:"🔗 内网"}]},{icon:"⚡",name:"qBittorrent",desc:"轻量级 BT/PT 下载客户端，功能完善，支持 WebUI 远程管理。",tech:["qBittorrent","BT/PT"],links:[{url:"https://qbittorrent.deltrivx.com",label:"🌐 公网"},{url:"http://192.168.31.2:8080",label:"🔗 内网"}]},{icon:"📡",name:"Transmission",desc:"轻量 BT 下载客户端，资源占用低，适合 7x24 运行。",tech:["Transmission","BT"],links:[{url:"https://transmission.deltrivx.com",label:"🌐 公网"},{url:"http://192.168.31.2:9091",label:"🔗 内网"}]},{icon:"🎛️",name:"Emby 影音中心",desc:"全平台媒体管理与串流服务器，整合影视资源库。",tech:["Emby Server","NAS"],links:[{url:"https://emby.deltrivx.com",label:"🌐 公网"},{url:"http://192.168.31.2:8096",label:"🔗 内网"}]},{icon:"🎯",name:"MoviePilot",desc:"自动化影视资源订阅与下载管理，辅以豆瓣榜单同步。",tech:["MoviePilot","自动化"],links:[{url:"https://moviepilot.deltrivx.com",label:"🌐 公网"},{url:"http://192.168.31.2:3000",label:"🔗 内网"}]},{icon:"📡",name:"PanSou 搜盘引擎",desc:"网盘资源搜索引擎，聚合多方盘源。",tech:["搜索","网盘"],links:[{url:"https://pansou.deltrivx.com",label:"🌐 公网"},{url:"http://192.168.31.2:8880",label:"🔗 内网"}]},{icon:"📥",name:"Telegram 下载器",desc:"自动抓取 Telegram 频道的媒体文件并下载到本地存储。",tech:["Telegram API","自动化"],links:[{url:"https://telegram.deltrivx.com",label:"🌐 公网"},{url:"http://192.168.31.2:5000",label:"🔗 内网"}]},{icon:"📊",name:"Portainer 容器管理",desc:"Docker 容器集群图形化管理面板。",tech:["Docker","管理"],links:[{url:"https://portainer.deltrivx.com",label:"🌐 公网"},{url:"http://192.168.31.2:9000",label:"🔗 内网"}]},{icon:"🔄",name:"DDNS-GO",desc:"自动更新域名解析记录，保障内网服务通过域名可达。",tech:["DNS","自动运维"],links:[{url:"https://ddnsgo.deltrivx.com",label:"🌐 公网"},{url:"http://192.168.31.2:9876",label:"🔗 内网"}]},{icon:"📂",name:"OpenList 目录索引",desc:"轻量级文件目录索引与分享系统。",tech:["文件管理","分享"],links:[{url:"https://openlist.deltrivx.com",label:"🌐 公网"},{url:"http://192.168.31.2:5244",label:"🔗 内网"}]},{icon:"🐧",name:"Xunlei 迅雷远程",desc:"远程迅雷下载服务，支持磁力链接与 BT 下载。",tech:["下载","P2P"],links:[{url:"https://xunlei.deltrivx.com",label:"🌐 公网"},{url:"http://192.168.31.2:2345",label:"🔗 内网"}]},{icon:"🔗",name:"OmniBox 综合工具",desc:"多功能集成工具箱。",tech:["工具","集成"],links:[{url:"https://omnibox.deltrivx.com",label:"🌐 公网"},{url:"http://192.168.31.2:7023",label:"🔗 内网"}]},{icon:"🎥",name:"咪咕视频助手",desc:"咪咕视频资源抓取与下载工具。",tech:["视频","抓取"],links:[{url:"https://migu.deltrivx.com",label:"🌐 公网"},{url:"http://192.168.31.2:1234",label:"🔗 内网"}]},{icon:"📺",name:"MDC 媒体下载中心",desc:"多平台媒体资源下载与聚合中心。",tech:["媒体","下载"],links:[{url:"http://192.168.31.2:9208",label:"🔗 内网"}]},{icon:"🔐",name:"AllInSSL 证书管理",desc:"SSL 证书全生命周期管理工具。",tech:["SSL","证书"],links:[{url:"http://192.168.31.2:8888/allinssl",label:"🔗 内网"}]},{icon:"🖥️",name:"MDCx 图形界面",desc:"MDCx 媒体下载工具 GUI 版，基于 VNC 远程桌面操作。",tech:["媒体","下载","GUI"],links:[{url:"http://192.168.31.2:5800",label:"🔗 内网"}]},{icon:"☁️",name:"Cloud Saver 云盘转存",desc:"115 网盘与阿里云盘自动转存工具。",tech:["网盘","转存","自动化"],links:[{url:"http://192.168.31.2:8032",label:"🔗 内网"}]},{icon:"⚡",name:"KV Rocks 缓存",desc:"Apache Kvrocks 高性能键值存储，兼容 Redis 协议。",tech:["Kvrocks","Redis"],links:[]},{icon:"🤖",name:"OpenClaw AI",desc:"智能 AI 代理系统，支持多模型切换与自动化任务编排。",tech:["AI Agent","LLM"],links:[]},{icon:"🛡️",name:"FlareSolverr",desc:"Cloudflare 挑战解析代理，为自动化工具提供免验证访问。",tech:["代理","反爬"],links:[]},{icon:"🗄️",name:"PostgreSQL 数据库",desc:"PostgreSQL 17 关系型数据库，为各服务提供可靠的数据存储。",tech:["PostgreSQL","数据库"],links:[]},{icon:"📦",name:"Redis 缓存",desc:"高性能内存缓存数据库，加速服务响应。",tech:["Redis","缓存"],links:[]},{icon:"🌐",name:"Nginx 反向代理",desc:"Web 服务反向代理与负载均衡网关。",tech:["Nginx","代理"],links:[]}];return(()=>{var t=Nr(),n=t.firstChild,o=n.nextSibling;return g(o,()=>e.map((r,s)=>(()=>{var l=Dr(),a=l.firstChild,i=a.firstChild,c=a.nextSibling,p=c.firstChild,d=p.nextSibling,m=d.nextSibling,h=m.nextSibling;return sn(l,"animationDelay",s*.1+"s"),g(i,()=>r.icon),g(p,()=>r.name),g(d,()=>r.desc),g(m,()=>r.tech.map(b=>(()=>{var f=Rr();return g(f,b),f})())),g(h,()=>r.links.map(b=>u(Tr,{get href(){return b.url},get label(){return b.label}}))),l})())),t})()}var Fr=w('<section id=articles><div class="section-header reveal"><h2><span class=gradient-text>技术实战</span></h2><p>分享我的思考和见解</p></div><div class=articles-list>'),Mr=w("<div class=article-meta><span class=article-date></span><div class=article-tags>"),Ur=w("<h3>"),jr=w("<p>"),Gr=w("<span class=read-more>阅读更多 →"),Hr=w("<span class=tech-tag>");function Wr(){D(()=>{ae(),ve()});const e=[{title:"宝塔插件 OpenClaw 完全指南：安装配置、环境变量优化与 PM2 进程管理",subtitle:"宝塔软件商店 · 插件面板管理 · 环境变量透传 · PM2 底层运维 · 更新按钮修复",date:"2026-06-01",tags:["OpenClaw","Baota","PM2","TencentOS","Node.js","运维"],summary:"宝塔软件商店一键安装 OpenClaw 插件 → 内置 Vue 控制面板 → 更新按钮底层调用链路与 env 初始化修复 → PM2 进程管理与重启策略 → Telegram 代理配置。完整记录从安装到生产运维。",slug:"openclaw-baota-pm2"},{title:"OpenClaw 记忆优化实战：Ollama Embedding + memory-core 本地化部署",subtitle:"Nomic Embed Text · FnOS Ollama 容器 · 多 OpenClaw 实例 provider 统一管理 · memory-core 语义搜索恢复",date:"2026-06-01",tags:["OpenClaw","Ollama","Embedding","Memory-Core","FnOS","Nomic"],summary:"OpenAI embedding 503 → 自建 Ollama nomic-embed-text 向量化服务。多 OpenClaw 实例 provider 同步管理、Telegram 通道故障排查、ingress 锁文件恢复。从配置到运维全覆盖。",slug:"memory-embed-ollama"},{title:"飞牛系统商店版 OpenClaw 优化实战：启动守护、路径复刻与更新按钮增强",subtitle:"FnOS App Center · trim.openclaw · systemd 兜底自启 · Gateway loopback · 插件优先更新",date:"2026-05-29",tags:["FnOS","OpenClaw","systemd","Bun","Gateway"],summary:"完整记录飞牛系统商店版 OpenClaw 的运行路径、用户权限、systemd 兜底启动脚本、控制面板检查更新按钮逻辑，以及更新前检查商店插件、优先升级渠道插件的优化方案。按文中路径、脚本、运行用户与权限基线，可在另一台 FnOS 设备复刻一致运行环境，避免 root 权限污染。",slug:"fnos-openclaw-store-optimization"},{title:"iOS Quantumult X 异地接入内网：HomeNet 双节点实战指南",subtitle:"Cloudflare Tunnel + Sub-Store + Shadowsocks over WSS · 从零到可用的内网回家方案",date:"2026-05-29",tags:["iOS","Quantumult X","Cloudflare","Sub-Store","内网穿透","Shadowsocks"],summary:"从 Cloudflare Tunnel 创建到 Nginx IPv6 直连加速、Sub-Store 订阅分发，再到 Quantumult X 双节点策略组配置，完整覆盖 iOS 设备异地接入内网的整个链路。双路径冗余：Fast 路径提供最低延迟，CF 路径提供最大兼容性。",slug:"homenet-qx"},{title:"飞牛系统（FnOS）核显温度显示补丁：从原理到实现",subtitle:"Intel iGPU · WebSocket 代理 · JS 注入 · bind-mount · FnOS 资源监控面板适配",date:"2026-05-24",tags:["FnOS","iGPU","Intel","WebSocket","系统补丁"],summary:"Intel 核显在 FnOS 面板中温度显示为空的解决方案。通过 WebSocket 代理拦截资源监控通信，将 CPU 封装温度回填到 GPU 温度字段，配合 JS 注入和 bind-mount 挂载实现无痕补丁。文章附带完整的部署脚本、卸载方法、备份恢复流程和故障排查指南。",slug:"fnos-igpu-temp"},{title:"从零搭建双栈域名体系：Cloudflare Tunnel + 内网穿透完全指南",subtitle:"V4/V6 双栈 · 域名统一接入 · 内外网分流防回环",date:"2026-05-28",tags:["Cloudflare","Tunnel","双栈","内网穿透","DNS"],summary:"详解如何通过 Cloudflare Tunnel 实现域名的 V4+V6 双栈接入，涵盖 CF 前期准备、Tunnel 部署、DNS 批量配置、内网防回环方案，以及最终的双栈验证方法。",slug:"dual-stack-domain"}];return(()=>{var t=Fr(),n=t.firstChild,o=n.nextSibling;return g(o,()=>e.map((r,s)=>u(k,{get href(){return`/article/${r.slug}`},class:"article-card reveal tilt-card",style:{animationDelay:s*.1+"s"},get children(){return[(()=>{var l=Mr(),a=l.firstChild,i=a.nextSibling;return g(a,()=>r.date),g(i,()=>r.tags.map(c=>(()=>{var p=Hr();return g(p,c),p})())),l})(),(()=>{var l=Ur();return g(l,()=>r.title),l})(),(()=>{var l=jr();return g(l,()=>r.summary),l})(),Gr()]}}))),t})()}var Br=w(`<section id=article-detail><div class="article-container reveal"><div class=article-header><h1>从零搭建双栈域名体系：Cloudflare Tunnel + 内网穿透完全指南</h1><p class=article-subtitle>V4/V6 双栈 · 域名统一接入 · 内外网分流防回环</p><div class=article-meta><span class=article-date>2026-05-28</span><div class=article-tags><span class=tech-tag>Cloudflare</span><span class=tech-tag>Tunnel</span><span class=tech-tag>双栈</span><span class=tech-tag>内网穿透</span><span class=tech-tag>DNS</span></div></div></div><div class=article-content><h2>一、为什么要做双栈域名？</h2><p>IPv6 已经普及，但很多服务只配置了 IPv4。双栈（Dual Stack）让域名同时支持 IPv4 和 IPv6 访问，用户无论使用哪种协议都能连通。结合 Cloudflare Tunnel，可以在没有公网 IP 的情况下，实现全域名双栈接入。</p><p>实际场景中，家中服务器可能只有 IPv6 公网地址（由运营商分配），而很多用户的网络环境仅支持 IPv4。双栈域名体系让两种网络环境下的用户都能无缝访问你的服务。</p><h2>二、基础架构设计</h2><p>整体架构分两条路径：外网用户通过 Cloudflare 边缘节点（天然双栈）进入 Tunnel，内网用户通过路由器 DNS 重定向直达本机。两条路径互不干扰，避免回环。</p><pre>┌─────────────────────────────────────────────────────────────┐
│  外网用户（IPv4 / IPv6）                                     │
│       ↓                                                       │
│  Cloudflare 边缘节点（天然双栈）                               │
│       ↓                                                       │
│  Cloudflare Tunnel（内网穿透）                                 │
│       ↓                                                       │
│  本机 cloudflared → ingress 规则匹配                           │
│       ↓                                                       │
│  本机服务（localhost）/ 远程服务（内网 IP）                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  内网用户                                                     │
│       ↓                                                       │
│  路由器 DNS 重定向（如 192.168.31.1）                          │
│       ↓                                                       │
│  本机 nginx → 127.0.0.1:port（防回环）                        │
└─────────────────────────────────────────────────────────────┘</pre><h2>三、Cloudflare 前期准备</h2><h3>3.1 注册与域名接入</h3><p>将域名的 NS 记录指向 Cloudflare，在面板中完成域名添加。这一步是所有后续操作的基础。</p><h3>3.2 创建 API Token</h3><p>进入 Cloudflare 控制台 → My Profile → API Tokens → Create Token。选择 "Edit zone DNS" 模板，生成用于 DNS 管理的 Token。建议仅授权当前域名的 DNS 编辑权限，遵循最小权限原则。</p><pre># API Token 权限模板
Zone - DNS - Edit
Zone - Zone - Read</pre><h3>3.3 获取关键 ID</h3><p>后续操作需要用到 Zone ID 和 Account ID，可在 Cloudflare 控制台右侧栏找到：</p><pre>Zone ID: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Account ID: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</pre><h2>四、部署 Cloudflare Tunnel</h2><h3>4.1 安装 cloudflared</h3><pre>wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.rpm
rpm -ivh cloudflared-linux-x86_64.rpm
cloudflared --version</pre><h3>4.2 认证并创建 Tunnel</h3><pre>cloudflared tunnel login
cloudflared tunnel create my-tunnel</pre><p>登录后会生成凭证文件，创建 Tunnel 后记录 Tunnel ID，后续配置 DNS CNAME 记录时需要用到。</p><h3>4.3 编写 ingress 配置文件</h3><p>创建 /etc/cloudflared/config.yml。本机服务指向 localhost，远程服务指向内网 IP。ingress 规则按顺序匹配，最后一条设为 http_status:404 兜底：</p><pre>token: "你的 Tunnel Token"
ingress:
  # 本机服务
  - hostname: baota.example.com
    service: http://localhost:19190
  - hostname: sub2api.example.com
    service: http://localhost:8080
  - hostname: substore.example.com
    service: http://localhost:3000

  # 远程服务（内网其他设备）
  - hostname: emby.example.com
    service: http://192.168.31.2:8096
  - hostname: fnos.example.com
    service: http://192.168.31.2:5080
  - hostname: homeassistant.example.com
    service: http://192.168.31.3:8123

  # 兜底 404
  - service: http_status:404</pre><h3>4.4 配置 systemd 服务</h3><pre>systemctl enable --now cloudflared
systemctl status cloudflared</pre><h2>五、DNS 记录批量配置</h2><p>所有域名统一添加 CNAME 记录指向 &lt;Tunnel-ID&gt;.cfargotunnel.com，开启代理（🟠）。以多个子域名为例，逐一添加：</p><pre># 单个添加
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/&lt;ZONE_ID>/dns_records" \\
  -H "Authorization: Bearer &lt;API_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "CNAME",
    "name": "emby",
    "content": "&lt;TUNNEL_ID>.cfargotunnel.com",
    "ttl": 1,
    "proxied": true
  }'

# 批量添加（多个域名）
for name in aria2 baota chromium ddnsgo emby fnos fntv \\
          hermes homeassistant istoreos migu moviepilot \\
          omnibox openlist pansou portainer qbittorrent \\
          socks sub2api substore telegram transmission xunlei; do
  curl -s -X POST ".../dns_records" \\
    -H "Authorization: Bearer &lt;API_TOKEN>" \\
    -H "Content-Type: application/json" \\
    -d "{\\"type\\":\\"CNAME\\",\\"name\\":\\"$name\\",\\"content\\":\\"&lt;TUNNEL_ID>.cfargotunnel.com\\",\\"ttl\\":1,\\"proxied\\":true}"
  sleep 0.5
done</pre><p>代理开启后，Cloudflare 边缘节点天然支持 IPv4 + IPv6 双栈，无需额外配置。</p><h2>六、内网防回环</h2><p>内网用户如果也走 CF Tunnel，会形成回环：内网设备 → 路由器 → 外网 → CF 边缘 → Tunnel → 本机。延迟增加且浪费带宽。</p><p>解决方案：在路由器 DNS 中将域名解析到本机 IP，nginx 代理到 127.0.0.1:port：</p><pre>内网设备 → 路由器 DNS 重定向 → 本机 nginx → 本机服务</pre><p>以 FnOS 上的 Nginx 容器为例，在路由器中将 *.example.com 解析到 FnOS 的 IP（如 192.168.31.2），Nginx 再反代到各服务端口。</p><h2>七、双栈验证</h2><p>配置完成后，分别验证 IPv4 和 IPv6 解析：</p><pre># IPv4 解析
dig +short A emby.example.com
# 返回 CF IPv4 地址（如 104.21.x.x）

# IPv6 解析
dig +short AAAA emby.example.com
# 返回 CF IPv6 地址（如 2606:4700::xxx）

# 连通性测试
curl -4 -I https://emby.example.com
curl -6 -I https://emby.example.com</pre><p>如果主域名本身有公网 IPv6（如家中服务器有 /128 的 IPv6 地址），还可以额外添加一条 AAAA 记录直连：</p><pre># 主域名 AAAA 记录（直连 IPv6，不走 CF 代理）
AAAA  example.com  →  2408:8266:xxxx::xxx  ⚪仅 DNS</pre><p>这样 IPv6 用户直连家中服务器，IPv4 用户走 CF Tunnel，实现最优路径。</p><h2>八、最终效果</h2><pre>✅ 外网用户（IPv4）→ CF 边缘 → Tunnel → 各服务
✅ 外网用户（IPv6）→ CF 边缘 → Tunnel → 各服务
✅ 内网用户 → 路由器 DNS → 本机 nginx → 各服务
✅ 无回环、无暴露真实 IP、统一安全防护
✅ 可以多个子域名统一接入，全部双栈可达</pre><h2>九、常见问题</h2><h3>Q: 双栈是否需要单独配置 IPv6？</h3><p>不需要。CF 边缘节点天然双栈，IPv6 访问时自动回源到 Tunnel 的 IPv4 连接。</p><h3>Q: 如何验证双栈？</h3><pre>dig +short A emby.example.com
dig +short AAAA emby.example.com</pre><h3>Q: 部分域名不需要走 CF 代理怎么办？</h3><p>对于已有其他 CDN 或自托管服务的域名，可以关闭代理（⚪仅 DNS），仅保留 DNS 解析功能。例如博客域名 www.example.com 指向 GitHub Pages，可以设为 CNAME → yourname.github.io，关闭代理。</p><h3>Q: Tunnel 最多支持多少域名？</h3><p>Cloudflare 免费版 Tunnel 支持最多 100 个 ingress 规则，对于个人使用完全足够。`);function qr(){return D(()=>{document.querySelectorAll(".reveal").forEach(e=>e.classList.add("visible")),window.scrollTo(0,0)}),(()=>{var e=Br(),t=e.firstChild,n=t.firstChild;return g(t,u(k,{href:"/articles",class:"back-link",children:"← 返回文章列表"}),n),e})()}var Kr=w(`<section id=article-detail><div class="article-container reveal"><div class=article-header><h1>iOS Quantumult X 异地接入内网：HomeNet 双节点实战指南</h1><p class=article-subtitle>Cloudflare Tunnel + Sub-Store + Shadowsocks over WSS · 从零到可用的内网回家方案</p><div class=article-meta><span class=article-date>2026-05-29</span><div class=article-tags><span class=tech-tag>iOS</span><span class=tech-tag>Quantumult X</span><span class=tech-tag>Cloudflare</span><span class=tech-tag>Sub-Store</span><span class=tech-tag>内网穿透</span><span class=tech-tag>Shadowsocks</span></div></div></div><div class=article-content><h2>一、方案概述</h2><p>异地访问家中内网，常见方案有 Tailscale、ZeroTier、frp 等。本文另辟蹊径——利用 Cloudflare Tunnel 的天然双栈穿透能力，结合 Shadowsocks over WebSocket Secure（WSS）协议，在 iOS Quantumult X 上实现双节点自动切换，让手机无论身处何地都能像在家一样访问 192.168.31.0/24 内网。</p><p>整个链路分三层：<strong>Cloudflare 边缘层</strong>（双栈接入）、<strong>隧道与代理层</strong>（cloudflared + gost + Nginx）、<strong>订阅与客户端层</strong>（Sub-Store + Quantumult X）。下面逐层展开。</p><pre>┌─────────────────────────────────────────────────────────┐
│  iOS Quantumult X                                       │
│    ├─ HomeNet-Fast（直连 · IPv6/DDNS）                   │
│    └─ HomeNet-CF  （Cloudflare 中继 · IPv4/IPv6）        │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
   ┌────▼─────┐           ┌──────▼──────┐
   │ Fast 路径 │           │  CF 路径     │
   │          │           │             │
   │ example  │           │ substore.   │
   │ .com     │           │ example.com │
   │ :18443   │           │ .com:443    │
   │          │           │             │
   │ FnOS IPv6│           │ CF 边缘节点  │
   │ 直连     │           │ 双栈接入     │
   └────┬─────┘           └──────┬──────┘
        │                         │
   ┌────▼─────────────────────────▼─────┐
   │  192.168.31.5（TencentOS 服务器）    │
   │    gost :18443（WSS 后端）           │
   │    gost :10089（CF 专用后端）         │
   │    nginx（反代 / PAC）               │
   │    cloudflared（Tunnel 客户端）      │
   └─────────────────────────────────────┘</pre><h2>二、Cloudflare 前期配置</h2><h3>2.1 域名接入与 DNS 准备</h3><p>将域名 NS 记录指向 Cloudflare 后，在控制台完成域名添加。随后创建 API Token（My Profile → API Tokens → Create Token），选择 "Edit zone DNS" 模板——这是后续自动化管理 DNS 记录的基础。</p><h3>2.2 创建 Cloudflare Tunnel</h3><p>在 Cloudflare Zero Trust 控制台中创建 Tunnel，获取 Tunnel ID 和 Token。在本机（192.168.31.5）安装 cloudflared 并配置服务：</p><pre># /etc/cloudflared/config.yml
token: "eyJhIjoi..."  # 替换为你的 Tunnel Token
ingress:
  # HomeNet 直连入口
  - hostname: example.com
    service: https://localhost:18443
    originRequest:
      noTLSVerify: true
  # Sub-Store + HomeNet-CF 入口
  - hostname: substore.example.com
    service: http://localhost:3000
  # 兜底 404
  - service: http_status:404</pre><p>cloudflared 作为 systemd 服务运行，监听 Cloudflare 边缘的入站连接，根据 ingress 规则将流量分发到本机不同端口。</p><h3>2.3 DNS CNAME 记录</h3><p>为每个 Tunnel 子域名添加 CNAME 记录，指向 <code>&lt;tunnel-id&gt;.cfargotunnel.com</code>，并开启代理（🟠）：</p><pre># 通过 CF API 添加 CNAME 记录
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \\
  -H "Authorization: Bearer $CF_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "CNAME",
    "name": "substore",
    "content": "$TUNNEL_ID.cfargotunnel.com",
    "ttl": 1,
    "proxied": true
  }'</pre><h2>三、Nginx 配置：IPv6 直连加速</h2><p>HomeNet 的 Fast 路径依赖 IPv6 直连。家中 FnOS（192.168.31.2）上的 Nginx 容器承担了 WebSocket 流量转发的角色。</p><p>核心配置仅保留 HomeNet Direct Fast 这一个 server 块，负责将 WSS 流量转发到内网 gost 服务：</p><pre># /vol2/1000/Docker/nginx/conf.d/default.conf

# HomeNet Direct Fast
server {
    listen 18443 ssl;
    listen [::]:18443 ssl;    # ← IPv6 双栈监听
    http2 on;
    server_name example.com;

    ssl_certificate     /ssl/example.com/fullchain.pem;
    ssl_certificate_key /ssl/example.com/privkey.pem;

    location = /ss-direct {
        proxy_pass http://192.168.31.5:18443;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}</pre><p>关键点：<code>listen [::]:18443 ssl</code> 同时监听 IPv4 和 IPv6。当 iOS 设备通过 IPv6 访问时，流量直接到达 FnOS Nginx，再转发到 192.168.31.5 的 gost 服务，全程不经 Cloudflare，延迟最低。</p><p>WebSocket 路径统一为 <code>/ss-direct</code>，这是 Shadowsocks over WSS 的约定路径，后续在 Quantumult X 节点配置中会用到。</p><h2>四、Sub-Store 搭建与订阅分发</h2><h3>4.1 部署 Sub-Store</h3><p>Sub-Store 是一个订阅管理工具，可以将节点信息以标准格式分发给各类客户端。在本机（192.168.31.5）直接以 Node.js 进程方式运行：</p><pre># 目录结构
/opt/Sub-Store/
├── backend/
│   ├── sub-store.min.js    # 主程序（单文件编译版）
│   ├── sub-store.json      # 订阅与制品配置
│   ├── root.json           # 缓存资源
│   └── substore.log        # 运行日志
├── config/                 # 客户端模板
│   ├── QX.snippet          # Quantumult X 片段
│   ├── QX-Task.json        # QX 定时任务
│   ├── Loon.plugin         # Loon 插件
│   ├── Surge.sgmodule      # Surge 模块
│   └── ...
└── scripts/                # 辅助脚本

# 启动方式（systemd 或直接 node）
node /opt/Sub-Store/backend/sub-store.min.js
# 监听端口：3000（前端/通用）、3001（后端 API）</pre><h3>4.2 配置 HomeNet 双节点订阅</h3><p>在 Sub-Store 中创建名为 <code>HomeNet-QX</code> 的订阅，包含两个 Shadowsocks 节点：</p><pre># HomeNet-QX 订阅内容（QX 格式）

# 节点一：HomeNet-Fast（直连 · 优先）
shadowsocks=example.com:18443,method=chacha20-ietf-poly1305,\\
  password=your_password,obfs=wss,obfs-host=example.com,\\
  obfs-uri=/ss-direct,fast-open=true,udp-relay=false,\\
  tag=HomeNet-Fast

# 节点二：HomeNet-CF（Cloudflare 中继 · 备用）
shadowsocks=substore.example.com:443,method=chacha20-ietf-poly1305,\\
  password=your_password,obfs=wss,obfs-host=substore.example.com,\\
  obfs-uri=/ss-direct,fast-open=true,udp-relay=false,\\
  tag=HomeNet-CF</pre><p>两个节点的加密方式和密码完全相同，区别仅在于入口域名和端口：</p><ul><li><strong>HomeNet-Fast</strong>：<code>example.com:18443</code> → FnOS IPv6 直连 → gost :18443</li><li><strong>HomeNet-CF</strong>：<code>substore.example.com:443</code> → Cloudflare 边缘 → cloudflared → gost :10089</li></ul><h3>4.3 创建 QX 专用订阅端点</h3><p>Sub-Store 的 <code>/download/&lt;订阅名&gt;?target=QX</code> 接口可以直接输出 Quantumult X 格式的订阅。但由于目标解析的换行问题，更稳妥的方式是通过 Nginx 创建静态端点：</p><pre># Nginx 配置
location = /qx {
    proxy_pass http://127.0.0.1:3001/download/HomeNet-QX?target=QX;
    proxy_set_header Host $host;
}

# QX 订阅地址
# https://substore.example.com/qx</pre><p>订阅 URL 为 <code>https://substore.example.com/qx</code>，Quantumult X 通过此地址拉取节点列表。</p><h2>五、Quantumult X 配置</h2><h3>5.1 添加订阅</h3><p>在 Quantumult X 中，进入「订阅」→「添加」，填入订阅地址：</p><pre>https://substore.example.com/qx</pre><p>Quantumult X 会自动解析出 HomeNet-Fast 和 HomeNet-CF 两个节点。</p><h3>5.2 配置策略组</h3><p>要实现双节点自动切换（优先 Fast，CF 兜底），需要创建一个策略组。在 QX 配置文件中添加：</p><pre># 策略组：自动选择可用节点
[policy]
available=HomeNet, server-tag-regex=^HomeNet-(Fast|CF)$, \\
  check-interval=300, alive-checking=true, \\
  img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Proxy.png</pre><p>参数说明：</p><ul><li><code>available</code>：自动选择策略组，优先选取第一个可用节点</li><li><code>server-tag-regex=^HomeNet-(Fast|CF)$</code>：匹配 HomeNet-Fast 和 HomeNet-CF</li><li><code>check-interval=300</code>：每 300 秒检测一次节点存活</li><li><code>alive-checking=true</code>：启用存活检测</li></ul><p><strong>注意</strong>：<code>available</code> 策略组按订阅中的节点顺序选择，因此订阅中 <strong>HomeNet-Fast 必须排在 HomeNet-CF 前面</strong>，否则会优先走 Cloudflare 中继。</p><p>如果需要<strong>手动切换</strong>节点，将策略组类型改为 <code>static</code>：</p><pre>[policy]
static=HomeNet, server-tag-regex=^HomeNet-(Fast|CF)$, \\
  img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Proxy.png</pre><h3>5.3 配置分流规则</h3><p>HomeNet 只应路由内网流量，其他流量走用户原有的科学上网节点。在 QX 配置中添加分流规则：</p><pre>[filter_local]
# 内网 IP 段走 HomeNet（必须放在其他 private-IP DIRECT 规则之前）
ip-cidr, 192.168.31.0/24, HomeNet, no-resolve

# 其他内网段直连
ip-cidr, 192.168.0.0/16, DIRECT
ip-cidr, 10.0.0.0/8, DIRECT
ip-cidr, 172.16.0.0/12, DIRECT</pre><p><code>no-resolve</code> 参数表示不解析域名，直接匹配 IP 范围，避免 DNS 泄漏。</p><h3>5.4 完整配置片段</h3><p>以下是可直接导入 Quantumult X 的完整配置片段：</p><pre># HomeNet 内网回家配置
# 订阅地址：https://substore.example.com/qx

[server_remote]
https://substore.example.com/qx, tag=HomeNet, \\
  update-interval=86400, opt-parser=false, \\
  enabled=true

[policy]
# 自动切换（Fast 优先，CF 兜底）
available=HomeNet, server-tag-regex=^HomeNet-(Fast|CF)$, \\
  check-interval=300, alive-checking=true, \\
  img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Proxy.png

[filter_local]
# 内网流量走 HomeNet
ip-cidr, 192.168.31.0/24, HomeNet, no-resolve

[rewrite_local]
# 可选：拦截内网域名的 DNS 解析
# ^https?://.+\\.local reject</pre><h2>六、连接优化与排障</h2><h3>6.1 双节点切换逻辑</h3><p>Quantumult X 的 <code>available</code> 策略组行为：</p><ul><li>按订阅中节点顺序依次检测可用性</li><li>选择第一个可用的节点</li><li>每 <code>check-interval</code> 秒重新检测一次</li><li>当当前节点不可用时，自动切换到下一个可用节点</li></ul><p>因此，<strong>订阅中节点顺序至关重要</strong>。HomeNet-Fast 在前、HomeNet-CF 在后，确保优先走直连路径。</p><h3>6.2 Fast 路径排障</h3><p>如果 HomeNet-Fast 无法连接，按以下顺序排查：</p><ol><li><strong>IPv6 连通性</strong>：确认 iOS 设备当前网络支持 IPv6（蜂窝网络通常支持）</li><li><strong>DDNS 解析</strong>：<code>nslookup example.com</code> 应返回 IPv6 地址</li><li><strong>端口可达性</strong>：<code>curl -6 https://example.com:18443</code> 应返回 WebSocket 握手响应</li><li><strong>证书有效性</strong>：确认 <code>/ssl/example.com/fullchain.pem</code> 未过期</li><li><strong>gost 服务</strong>：<code>ss -tlnp | grep 18443</code> 确认 gost 正在监听</li></ol><h3>6.3 CF 路径排障</h3><p>HomeNet-CF 经过 Cloudflare 边缘，排查重点不同：</p><ol><li><strong>Tunnel 状态</strong>：<code>systemctl status cloudflared</code> 确认 Tunnel 在线</li><li><strong>Ingress 规则</strong>：确认 <code>substore.example.com</code> 的 ingress 正确指向 <code>http://localhost:10089</code>（gost CF 专用端口）</li><li><strong>路径分流</strong>：CF 路径下 <code>/ss-direct</code> 应直达 gost，不经过 Nginx</li></ol><h3>6.4 常见连接问题与解决</h3><table><thead><tr><th>现象</th><th>原因</th><th>解决</th></tr></thead><tbody><tr><td>两个节点都显示不可达</td><td>订阅地址不通或密码错误</td><td>检查订阅 URL 和密码配置</td></tr><tr><td>只能连 CF，连不上 Fast</td><td>IPv6 不通或 DDNS 未更新</td><td>检查 IPv6 连通性和 DNS 解析</td></tr><tr><td>连接后无法访问内网 IP</td><td>分流规则顺序错误</td><td>将 HomeNet 规则放在其他 private-IP 规则之前</td></tr><tr><td>手动切换不生效</td><td>策略组类型为 available</td><td>改为 static 类型</td></tr><tr><td>连接后所有流量都走 HomeNet</td><td>分流规则范围过大</td><td>确认 ip-cidr 仅匹配 192.168.31.0/24</td></tr></tbody></table><h2>七、安全建议</h2><ul><li><strong>密码强度</strong>：Shadowsocks 密码应使用随机字符串，避免使用弱密码</li><li><strong>TLS 证书</strong>：使用 Let's Encrypt 或 Cloudflare Origin CA 签名的有效证书</li><li><strong>分流精确</strong>：仅将内网 IP 段（192.168.31.0/24）路由到 HomeNet，避免全局代理</li><li><strong>订阅保护</strong>：Sub-Store 订阅地址建议添加 token 参数，防止未授权访问</li><li><strong>日志审计</strong>：定期检查 gost 和 cloudflared 日志，排查异常连接</li></ul><h2>八、总结</h2><p>本文从 Cloudflare Tunnel 的创建出发，经 Nginx IPv6 直连加速、Sub-Store 订阅分发，到 Quantumult X 双节点策略组配置，完整覆盖了 iOS 设备异地接入内网的整个链路。</p><p>核心设计思想是<strong>双路径冗余</strong>：Fast 路径（IPv6 直连）提供最低延迟，CF 路径（Cloudflare 中继）提供最大兼容性。Quantumult X 的 <code>available</code> 策略组自动在两者之间切换，用户无需手动干预。</p><p>整个方案无需公网 IP、无需额外硬件，仅利用 Cloudflare 免费 Tunnel 和家中现有服务器即可实现。对于需要随时访问家中 NAS、HomeAssistant、开发环境等内网服务的场景，这是一个简洁而可靠的解决方案。`);function Qr(){return D(()=>{document.querySelectorAll(".reveal").forEach(e=>e.classList.add("visible")),window.scrollTo(0,0)}),(()=>{var e=Kr(),t=e.firstChild,n=t.firstChild;return g(t,u(k,{href:"/articles",class:"back-link",children:"← 返回文章列表"}),n),e})()}var Xr=w(`<section id=article-detail><div class="article-container reveal"><div class=article-header><h1>飞牛系统商店版 OpenClaw 优化实战：开机自启、状态修复、备份复用与更新按钮增强</h1><p class=article-subtitle>FnOS App Center · trim.openclaw · systemd 兜底自启 · Gateway loopback · root Monitor 根治 · 一键备份恢复</p><div class=article-meta><span class=article-date>2026-05-29</span><div class=article-tags><span class=tech-tag>FnOS</span><span class=tech-tag>OpenClaw</span><span class=tech-tag>systemd</span><span class=tech-tag>Bun</span><span class=tech-tag>Node.js</span><span class=tech-tag>Gateway</span></div></div></div><div class=article-content><h2>一、写在前面：本文解决什么问题</h2><p>飞牛系统（FnOS）商店版 OpenClaw 的运行方式与普通 Docker 部署不同。它不是直接由 root 启动一个裸进程，而是由 FnOS App Center 管理应用包，再由商店版 Monitor 启动 OpenClaw Gateway。本文记录一次完整的商店版 OpenClaw 优化过程：反向定位运行路径、修复开机自启、根治 root Monitor 残留、修复控制面板卡“启动中”、梳理“检查更新”按钮的真实逻辑，并沉淀出一份可一键还原或迁移复用的完整备份方案。</p><p>本文所有域名、Token、用户名、内网地址均做脱敏处理。示例中的 <code>example.com</code>、<code>192.168.x.x</code>、<code>&lt;TOKEN&gt;</code> 等请替换为你自己的环境。</p><h2>二、目标架构</h2><p>优化后的商店版 OpenClaw 采用以下链路：</p><pre>FnOS systemd / App Center
  ├─ FnOS App Center
  │   → /var/apps/trim.openclaw/cmd/main start
  │     → bun /vol1/@appcenter/trim.openclaw/server/index.js
  │       → Monitor Unix Socket: /vol1/@appcenter/trim.openclaw/trim.openclaw.sock
  │
  └─ openclaw-ensure.service
      → /usr/local/sbin/openclaw-ensure.sh
        → 等待 trim.openclaw 用户下的 Monitor 就绪
        → runuser -u trim.openclaw -- openclaw gateway run --port 25730 --bind loopback
          → Gateway: 127.0.0.1:25730 / [::1]:25730</pre><p>关键设计原则：</p><ul><li><strong>商店版独立用户运行</strong>：使用 <code>trim.openclaw</code> 用户，不与 root 或 Docker 版混用。</li><li><strong>Gateway 仅监听 loopback</strong>：默认 <code>127.0.0.1:25730</code>，避免直接暴露到局域网或公网。</li><li><strong>Monitor 归 FnOS App Center</strong>：<code>cmd/main</code> 由商店体系调用，避免 systemd/root 直接拉起 Monitor。</li><li><strong>systemd 只兜底 Gateway</strong>：<code>openclaw-ensure.service</code> 等待 Monitor 后，仅以 <code>trim.openclaw</code> 启动 Gateway。</li><li><strong>更新前优雅停止 Gateway</strong>：避免安装包替换过程中进程仍占用旧文件。</li><li><strong>更新 OpenClaw 前先检查商店插件</strong>：如果 FnOS 商店包本身有更新，优先提示先升级商店包。</li><li><strong>OpenClaw 升级前先更新渠道插件</strong>：例如 QQBot，避免 OpenClaw 基底升级后插件 SDK 不兼容。</li></ul><h2>三、路径与运行环境定位</h2><p>在 FnOS 中，商店应用通常由 <code>/var/apps/&lt;appname&gt;</code> 暴露入口，再通过软链接指向 <code>/vol1/@appcenter</code> 与 <code>/vol1/@apphome</code>。以商店版 OpenClaw 为例：</p><pre># 商店应用入口
/var/apps/trim.openclaw

# 实际程序目录（App Center 管理）
/vol1/@appcenter/trim.openclaw

# 实际数据目录（用户数据与运行态）
/vol1/@apphome/trim.openclaw/data

# OpenClaw 安装目录
/vol1/@apphome/trim.openclaw/data/openclaw

# OpenClaw HOME
/vol1/@apphome/trim.openclaw/data/home

# OpenClaw 配置文件
/vol1/@apphome/trim.openclaw/data/home/.openclaw/openclaw.json

# 工作区
/vol1/@apphome/trim.openclaw/data/workspace

# 状态目录
/vol1/@apphome/trim.openclaw/data/state

# 运行目录
/vol1/@apphome/trim.openclaw/data/runtime</pre><p>商店版依赖 FnOS 提供的 Bun 与 Node.js：</p><pre># Bun
/var/apps/bunjs/target/bin/bun
# 通常指向：/vol1/@appcenter/bunjs/bin/bun

# Node.js
/var/apps/nodejs_v24/target/bin/node
# 通常指向：/vol1/@appcenter/nodejs_v24/bin/node</pre><p>建议先确认版本：</p><pre>/var/apps/bunjs/target/bin/bun --version
/var/apps/nodejs_v24/target/bin/node --version</pre><p>在本次环境中，Bun 为 1.3.x，Node.js 为 v24.x。你不必强求小版本完全一致，但建议 Bun ≥ 1.3.9，Node.js 使用 FnOS 商店依赖中声明的 v24 系列。</p><h3>3.1 本次修复后的运行快照</h3><p>以下是本文最终落地后的真实运行状态，可作为排查时的基准线：</p><pre>主机：FnOS
内核：Linux 6.18.18-trim x86_64
商店应用：trim.openclaw
商店包版本：0.0.10
OpenClaw Gateway：127.0.0.1:25730 / [::1]:25730
Monitor Socket：/vol1/@appcenter/trim.openclaw/trim.openclaw.sock
systemd：openclaw-ensure.service enabled / active (exited)

Monitor:
  用户：trim.openclaw
  进程：bun /vol1/@appcenter/trim.openclaw/server/index.js
  PID 文件：/vol1/@appdata/trim.openclaw/app.pid

Gateway:
  用户：trim.openclaw
  工作目录：/vol1/@apphome/trim.openclaw/data/openclaw
  PID 文件：/vol1/@apphome/trim.openclaw/data/runtime/gateway.pid
  配置：/vol1/@apphome/trim.openclaw/data/home/.openclaw/openclaw.json

Monitor DB:
  /vol1/@apphome/trim.openclaw/data/monitor/monitor.sqlite
  instances.default.status = running
  instances.default.gateway_port = 25730</pre><p>注意：如果同时存在 Docker 版或手工版 OpenClaw，例如 root 用户、cwd 为 <code>/app</code>、监听 <code>0.0.0.0:18789</code>，它不是本文所说的 FnOS 商店版。排查商店版时必须把这一路排除。</p><h2>四、商店版主启动脚本 cmd/main</h2><p>商店版主脚本位于：</p><pre>/var/apps/trim.openclaw/cmd/main</pre><p>它的职责不是直接跑 Gateway，而是启动商店版 Monitor：</p><pre>#!/bin/bash

LOG_FILE="\${TRIM_PKGVAR}/info.log"
PID_FILE="\${TRIM_PKGVAR}/app.pid"

# Bun / Node.js path
export PATH=/var/apps/bunjs/target/bin:/var/apps/nodejs_v24/target/bin:$PATH

# Data directory (@apphome)
OPENCLAW_DATA_DIR="\${TRIM_PKGHOME}/data"

# Static files directory (frontend)
STATIC_DIR="\${TRIM_APPDEST}/ui"
SOCKET_PATH="\${TRIM_APPDEST}/trim.openclaw.sock"
OPENCLAW_PATCHES_DIR="\${TRIM_APPDEST}/vendor/openclaw-patches/dist"

# Custom SOUL.md shipped with this package
SOUL_MD_SRC="\${TRIM_APPDEST}/../config/prompts/SOUL.md"

# Monitor command
CMD="env OPENCLAW_DATA_DIR="\${OPENCLAW_DATA_DIR}" STATIC_DIR="\${STATIC_DIR}" SOUL_MD_SRC="\${SOUL_MD_SRC}" MONITOR_SOCKET_PATH="\${SOCKET_PATH}" MONITOR_ACCESS_MODE="public" OPENCLAW_PATCHES_DIR="\${OPENCLAW_PATCHES_DIR}" bun "\${TRIM_APPDEST}/server/index.js""

log_msg() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> \${LOG_FILE}
}

check_process() {
    local pid=$1
    if kill -0 "\${pid}" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

status() {
    if [ -f "\${PID_FILE}" ]; then
        pid=$(head -n 1 "\${PID_FILE}" | tr -d '[:space:]')
        if check_process "\${pid}"; then
            return 0
        else
            rm -f "\${PID_FILE}"
        fi
    fi
    return 1
}

start_process() {
    if status; then
        return 0
    fi

    if ! command -v bun >/dev/null 2>&amp;1; then
        log_msg "bun command not found in PATH"
        return 1
    fi

    log_msg "Starting process ..."
    rm -f "\${SOCKET_PATH}"
    bash -c "\${CMD}" >> \${LOG_FILE} 2>&amp;1 &amp;
    printf "%s" "$!" > \${PID_FILE}
    return 0
}

stop_process() {
    log_msg "Stopping process ..."

    if [ -r "\${PID_FILE}" ]; then
        pid=$(head -n 1 "\${PID_FILE}" | tr -d '[:space:]')

        log_msg "pid=\${pid}"
        if ! check_process "\${pid}"; then
            rm -f "\${PID_FILE}"
            log_msg "remove pid file 1"
            return
        fi

        log_msg "send TERM signal to PID:\${pid}..."
        kill -TERM \${pid} >> \${LOG_FILE} 2>&amp;1

        local count=0
        while check_process "\${pid}" &amp;&amp; [ $count -lt 10 ]; do
            sleep 1
            count=$((count + 1))
            log_msg "waiting process terminal... (\${count}s/10s)"
        done

        if check_process "\${pid}"; then
            log_msg "send KILL signal to PID:\${pid}..."
            kill -KILL "\${pid}"
            sleep 1
            rm -f "\${PID_FILE}"
        else
            log_msg "process killed... "
        fi
    fi

    rm -f "\${SOCKET_PATH}"
    return 0
}

case $1 in
start)
    start_process
    ;;
stop)
    stop_process
    ;;
status)
    if status; then
        exit 0
    else
        exit 3
    fi
    ;;
*)
    exit 1
    ;;
esac</pre><p>这个脚本依赖 FnOS 注入的环境变量：</p><ul><li><code>TRIM_PKGVAR</code>：应用运行状态目录，如日志与 pid 文件。</li><li><code>TRIM_PKGHOME</code>：应用 home 目录，通常映射到 <code>/vol1/@apphome/trim.openclaw</code>。</li><li><code>TRIM_APPDEST</code>：应用程序目录，通常映射到 <code>/vol1/@appcenter/trim.openclaw</code>。</li></ul><h2>五、OpenClaw CLI wrapper</h2><p>商店版还应提供一个 wrapper，用于保证 OpenClaw 以正确 HOME、配置路径和依赖目录运行：</p><pre>/var/apps/trim.openclaw/target/bin/openclaw</pre><p>建议内容如下：</p><pre>#!/bin/bash
set -e

export PATH="/var/apps/bunjs/target/bin:/var/apps/nodejs_v24/target/bin:/vol1/@apphome/trim.openclaw/data/openclaw/node_modules/.bin:$PATH"
export OPENCLAW_DATA_DIR="/vol1/@apphome/trim.openclaw/data"
export HOME="/vol1/@apphome/trim.openclaw/data/home"
export OPENCLAW_CONFIG_PATH="/vol1/@apphome/trim.openclaw/data/home/.openclaw/openclaw.json"
export OPENCLAW_HIDE_BANNER="1"

exec "/vol1/@apphome/trim.openclaw/data/openclaw/node_modules/.bin/openclaw" "$@"</pre><p>权限建议：</p><pre>chown trim.openclaw:trim.openclaw /var/apps/trim.openclaw/target/bin/openclaw
chmod 770 /var/apps/trim.openclaw/target/bin/openclaw</pre><h2>六、systemd 兜底启动脚本：只拉 Gateway，不拉 Monitor</h2><p>这一节是本文后半段修复的核心。最初的兜底脚本直接以 root 调用 <code>/var/apps/trim.openclaw/cmd/main start</code>，结果导致同一台机器上出现两个 Monitor：一个 root 拉起，一个 FnOS App Center 以 <code>trim.openclaw</code> 拉起。最终方案是：<strong>Monitor 交给 FnOS App Center，systemd ensure 只等待 Monitor，然后只负责以 <code>trim.openclaw</code> 启动 Gateway。</strong></p><h3>6.1 systemd unit</h3><p>创建：</p><pre>/etc/systemd/system/openclaw-ensure.service</pre><p>内容：</p><pre>[Unit]
Description=Ensure OpenClaw Gateway is running
After=network-online.target trim_open_gateway.service trim_app_center.service
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/usr/local/sbin/openclaw-ensure.sh
TimeoutStartSec=120
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target</pre><h3>6.2 ensure 脚本</h3><p>创建：</p><pre>/usr/local/sbin/openclaw-ensure.sh</pre><p>推荐代码如下。它会读取商店版路径、清理旧 lock、等待 <code>trim.openclaw</code> 用户下的 Monitor，再用 <code>runuser</code> 启动 Gateway。注意：这里故意不再调用 <code>cmd/main start</code>。</p><pre>#!/bin/bash
# OpenClaw Gateway Ensure Script
# Called by systemd at boot to ensure FnOS store Monitor + Gateway are running.

set -e

LOG="/var/log/openclaw-ensure.log"
APP_MAIN="/var/apps/trim.openclaw/cmd/main"
PORT="25730"
OC_USER="trim.openclaw"
OC_DATA_DIR="/vol1/@apphome/trim.openclaw/data"
OC_INSTALL_DIR="\${OC_DATA_DIR}/openclaw"
OC_HOME_DIR="\${OC_DATA_DIR}/home"
OC_CONFIG_PATH="\${OC_HOME_DIR}/.openclaw/openclaw.json"
OC_BINARY="\${OC_INSTALL_DIR}/node_modules/.bin/openclaw"
OC_GATEWAY_LOG="\${OC_INSTALL_DIR}/gateway.log"
OC_RUNTIME_DIR="\${OC_DATA_DIR}/runtime"
OC_PID_PATH="\${OC_RUNTIME_DIR}/gateway.pid"
OC_ENV_PATH="\${OC_INSTALL_DIR}/.env"

log() {
    echo "$(date '+%F %T') $*" >> "$LOG"
}

port_listening() {
    ss -tln 2>/dev/null | grep -q ":\${PORT} "
}

find_gateway_pid() {
    ss -tlnp 2>/dev/null | grep ":\${PORT} " | grep -oP 'pid=K[0-9]+' | head -1
}

if [ -z "$TRIM_PKGVAR" ]; then
    export TRIM_PKGVAR="/vol1/@appdata/trim.openclaw"
    export TRIM_PKGHOME="/vol1/@apphome/trim.openclaw"
    export TRIM_APPDEST="/vol1/@appcenter/trim.openclaw"
fi

mkdir -p "$(dirname "$LOG")" "$OC_RUNTIME_DIR"
touch "$LOG" "$OC_GATEWAY_LOG"
chown "$OC_USER:$OC_USER" "$OC_RUNTIME_DIR" "$OC_GATEWAY_LOG" 2>/dev/null || true

if [ -f "$OC_ENV_PATH" ]; then
    env_port=$(grep -E '^PORT=' "$OC_ENV_PATH" 2>/dev/null | head -1 | cut -d= -f2- | tr -d "'")
    if [ -n "$env_port" ]; then PORT="$env_port"; fi
fi

if port_listening; then
    pid=$(find_gateway_pid || true)
    if [ -n "$pid" ]; then
        printf "%s" "$pid" > "$OC_PID_PATH"
        chown "$OC_USER:$OC_USER" "$OC_PID_PATH" 2>/dev/null || true
    fi
    log "Gateway already running on port \${PORT}, skipping"
    exit 0
fi

log "Gateway not running, ensuring monitor and starting store gateway"

if [ ! -x "$APP_MAIN" ]; then
    log "ERROR: $APP_MAIN not found or not executable"
    exit 1
fi
if [ ! -x "$OC_BINARY" ]; then
    log "ERROR: $OC_BINARY not found or not executable"
    exit 1
fi

rm -f /tmp/openclaw-*/gateway.*.lock 2>/dev/null || true
rm -f "$OC_PID_PATH" 2>/dev/null || true

# Do not call cmd/main from ensure. FnOS App Center owns Monitor startup.
for i in $(seq 1 15); do
    if pgrep -u "$OC_USER" -f "bun \${TRIM_APPDEST}/server/index.js" >/dev/null 2>&amp;1; then
        log "Monitor already running as \${OC_USER}"
        break
    fi
    sleep 1
done

log "Starting Gateway directly as \${OC_USER} on 127.0.0.1:\${PORT}"
/usr/sbin/runuser -u "$OC_USER" -- /bin/bash -lc "
    export HOME='\${OC_HOME_DIR}'
    export OPENCLAW_DATA_DIR='\${OC_DATA_DIR}'
    export OPENCLAW_CONFIG_PATH='\${OC_CONFIG_PATH}'
    export OPENCLAW_HIDE_BANNER=1
    export PATH='\${OC_INSTALL_DIR}/node_modules/.bin:/var/apps/bunjs/target/bin:/var/apps/nodejs_v24/target/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'
    cd '\${OC_INSTALL_DIR}'
    exec '\${OC_BINARY}' gateway run --port '\${PORT}' --bind loopback
" >> "$OC_GATEWAY_LOG" 2>&amp;1 &amp;

for i in $(seq 1 90); do
    sleep 1
    if port_listening; then
        pid=$(find_gateway_pid || true)
        if [ -n "$pid" ]; then
            printf "%s" "$pid" > "$OC_PID_PATH"
            chown "$OC_USER:$OC_USER" "$OC_PID_PATH" 2>/dev/null || true
            log "Gateway is now running on port \${PORT} (PID \${pid})"
        else
            log "Gateway is now running on port \${PORT}"
        fi
        exit 0
    fi
done

log "ERROR: Gateway still not listening on port \${PORT} after 90s"
exit 1</pre><p>启用：</p><pre>chmod +x /usr/local/sbin/openclaw-ensure.sh
systemctl daemon-reload
systemctl enable openclaw-ensure.service
systemctl start openclaw-ensure.service
systemctl status openclaw-ensure.service --no-pager</pre><h3>6.3 为什么不能让 ensure 调 cmd/main start</h3><p><code>openclaw-ensure.service</code> 是 root 身份运行。若它直接调用 <code>cmd/main start</code>，Monitor 会以 root 身份启动，随后 FnOS App Center 又会以 <code>trim.openclaw</code> 启动正确 Monitor，形成双进程与权限污染。判断是否踩坑：</p><pre>ps -eo pid,ppid,user,group,cmd   | grep "bun /vol1/@appcenter/trim.openclaw/server/index.js"   | grep -v grep

# 正确：只应有 trim.openclaw
# 错误：出现 root 用户的 Monitor</pre><h2>七、权限统一：复刻成功的关键</h2><p><strong>这是整套方案最容易踩坑、也最必须强调的部分：</strong>商店版 OpenClaw 的运行用户不是 root，而是 FnOS 为商店应用创建的独立用户 <code>trim.openclaw</code>。如果用 root 运行过安装、更新或修复命令，很容易把 <code>node_modules</code>、<code>.openclaw</code>、<code>sessions</code>、<code>runtime</code> 等目录污染成 root 属主，最终导致商店版进程读写失败、更新失败、会话不可写，或者出现“root 版能跑、商店版不能跑”的混乱状态。</p><p>复刻环境时应坚持一条铁律：</p><pre>商店版 OpenClaw 的数据目录、配置目录、安装目录、运行目录、workspace，统一归 trim.openclaw:trim.openclaw。
root 只负责 systemd、FnOS 应用脚本、必要的文件修复；不要让 root 成为 OpenClaw 运行态文件的属主。</pre><h3>7.1 先确认商店用户存在</h3><p>另一台设备上，<code>trim.openclaw</code> 用户通常由 FnOS App Center 安装商店包时自动创建。不要优先手工创建用户；如果用户不存在，优先重新安装或修复商店包。</p><pre>id trim.openclaw
getent passwd trim.openclaw
getent group trim.openclaw</pre><p>预期结果类似：</p><pre>uid=xxx(trim.openclaw) gid=xxx(trim.openclaw) groups=...,AppUsers,OfficialAppUsers,trim.openclaw</pre><h3>7.2 统一属主范围</h3><p>需要统一归属的核心目录：</p><pre>/vol1/@apphome/trim.openclaw/data
/vol1/@apphome/trim.openclaw/data/openclaw
/vol1/@apphome/trim.openclaw/data/openclaw/node_modules
/vol1/@apphome/trim.openclaw/data/home
/vol1/@apphome/trim.openclaw/data/home/.openclaw
/vol1/@apphome/trim.openclaw/data/runtime
/vol1/@apphome/trim.openclaw/data/state
/vol1/@apphome/trim.openclaw/data/workspace
/vol1/@apphome/trim.openclaw/data/monitor</pre><p>检查命令：</p><pre>find /vol1/@apphome/trim.openclaw/data   -maxdepth 4   ( ! -user trim.openclaw -o ! -group trim.openclaw )   -printf '%u:%g %m %p
' | head -n 100</pre><p>如果有输出，说明存在 root 或其他用户污染。修复：</p><pre>chown -R trim.openclaw:trim.openclaw /vol1/@apphome/trim.openclaw/data
chmod -R u+rwX,g+rX,o-rwx /vol1/@apphome/trim.openclaw/data</pre><h3>7.3 推荐权限基线</h3><p>为了既能让商店版运行，又避免过度开放权限，推荐基线如下：</p><pre># 数据根目录：商店用户可读写，组可读进，其他用户不可访问
chown -R trim.openclaw:trim.openclaw /vol1/@apphome/trim.openclaw/data
chmod 750 /vol1/@apphome/trim.openclaw/data
chmod 750 /vol1/@apphome/trim.openclaw/data/openclaw
chmod 750 /vol1/@apphome/trim.openclaw/data/home
chmod 700 /vol1/@apphome/trim.openclaw/data/home/.openclaw
chmod 750 /vol1/@apphome/trim.openclaw/data/runtime
chmod 750 /vol1/@apphome/trim.openclaw/data/state
chmod 750 /vol1/@apphome/trim.openclaw/data/workspace

# 配置文件：含模型、渠道、Gateway 等配置，禁止其他用户读取
chmod 640 /vol1/@apphome/trim.openclaw/data/home/.openclaw/openclaw.json

# CLI wrapper：由商店用户执行
chown trim.openclaw:trim.openclaw /var/apps/trim.openclaw/target/bin/openclaw
chmod 770 /var/apps/trim.openclaw/target/bin/openclaw</pre><h3>7.4 所有 OpenClaw CLI 操作都应以商店用户执行</h3><p>需要查看版本、安装插件、执行诊断时，不要直接 root 执行 <code>openclaw</code>。正确方式是用 <code>runuser</code> 切到 <code>trim.openclaw</code>，并显式带上商店版 HOME 与配置路径：</p><pre>runuser -u trim.openclaw -- env   HOME=/vol1/@apphome/trim.openclaw/data/home   OPENCLAW_DATA_DIR=/vol1/@apphome/trim.openclaw/data   OPENCLAW_CONFIG_PATH=/vol1/@apphome/trim.openclaw/data/home/.openclaw/openclaw.json   PATH=/var/apps/bunjs/target/bin:/var/apps/nodejs_v24/target/bin:/vol1/@apphome/trim.openclaw/data/openclaw/node_modules/.bin:$PATH   /var/apps/trim.openclaw/target/bin/openclaw --version</pre><p>插件安装也同理：</p><pre>runuser -u trim.openclaw -- env   HOME=/vol1/@apphome/trim.openclaw/data/home   OPENCLAW_DATA_DIR=/vol1/@apphome/trim.openclaw/data   OPENCLAW_CONFIG_PATH=/vol1/@apphome/trim.openclaw/data/home/.openclaw/openclaw.json   PATH=/var/apps/bunjs/target/bin:/var/apps/nodejs_v24/target/bin:/vol1/@apphome/trim.openclaw/data/openclaw/node_modules/.bin:$PATH   /var/apps/trim.openclaw/target/bin/openclaw plugins install @openclaw/qqbot@latest --force</pre><h3>7.5 验证进程绝不能跑成 root</h3><p>Gateway 进程应满足：</p><pre># 进程用户应为 trim.openclaw
ps -eo pid,ppid,user,group,cwd,cmd | grep -E 'trim.openclaw|server/index.js|openclaw' | grep -v grep

# 端口应只监听 loopback 的商店版端口
ss -ltnp | grep 25730

# 当前工作目录应是商店版安装目录
readlink -f /proc/&lt;GATEWAY_PID>/cwd
# 预期：/vol1/@apphome/trim.openclaw/data/openclaw</pre><p>如果看到 <code>root</code> 用户运行的 <code>openclaw</code>，或者 cwd 是 <code>/app</code>、端口是其他值，那通常不是商店版，排查时必须排除，避免将 Docker 版或手工版误认为商店版。</p><h2>八、控制面板“检查更新”按钮的真实逻辑</h2><p>商店版控制面板前端按钮位于 UI bundle 中，点击“检查更新”后并不是只检查版本，而是弹出确认框，确认后调用后端安装接口：</p><pre>POST /app/trim-openclaw/api/install
Content-Type: application/json

{
  "method": "bun",
  "action": "update"
}</pre><p>前端会切换到运行日志页面，通过 SSE 持续接收后端日志。后端入口在：</p><pre>/vol1/@appcenter/trim.openclaw/server/index.js</pre><p>更新目标由以下常量决定：</p><pre>const OPENCLAW_NPM_REGISTRY =
  process.env.OPENCLAW_NPM_REGISTRY || "https://registry.npmmirror.com/";

const OPENCLAW_VERSION =
  process.env.OPENCLAW_VERSION || "2026.5.4";

const OPENCLAW_PACKAGE_SPEC =
  \`openclaw@\${OPENCLAW_VERSION}\`;

const OPENCLAW_UPDATE_PACKAGE_SPEC =
  process.env.OPENCLAW_UPDATE_PACKAGE_SPEC || "openclaw@latest";</pre><p>当 <code>action === "update"</code> 时，实际目标是：</p><pre>openclaw@latest</pre><p>核心更新流程：</p><pre>确认更新
  → POST /api/install action=update
  → gracefulStopGateway()
  → 准备 Bun / npm registry / cache 环境
  → ensureInstanceDirectories()
  → ensureManagedInstallPackageJson()
  → bun add --cwd &lt;installDir> --registry &lt;registry> openclaw@latest
  → refreshOpenClawVersionMetadata()
  → deploySoulMd()
  → startOpenclaw()
  → refreshChannelPlugins()
  → refreshModelsCatalogSnapshot()
  → SSE complete</pre><p>在本文路径中，等价命令为：</p><pre>/var/apps/bunjs/target/bin/bun add   --cwd /vol1/@apphome/trim.openclaw/data/openclaw   --registry https://registry.npmmirror.com/   openclaw@latest</pre><h2>九、优化一：更新前检查 FnOS 商店插件版本</h2><p>如果商店包 <code>trim.openclaw</code> 自身已有新版，而用户直接在 OpenClaw 控制面板里升级 npm 包，可能出现“基底已经升级，但商店 Monitor/UI/脚本仍是旧版”的错配。因此可在 OpenClaw 升级前先检查 FnOS App Center 数据库。</p><p>新增脚本：</p><pre>/vol1/@apphome/trim.openclaw/data/openclaw/scripts/check-store-plugin-update.sh</pre><p>示例代码如下。不同 FnOS 版本的 PostgreSQL 连接方式可能不同，需按实际 appcenter 数据库配置调整。</p><pre>#!/usr/bin/env bash
set -euo pipefail

APP_NAME="trim.openclaw"
PSQL_BIN="\${PSQL_BIN:-/usr/bin/psql}"
DB_NAME="\${DB_NAME:-appcenter}"

log() {
  printf '%s
' "$*"
}

if ! command -v "\${PSQL_BIN}" >/dev/null 2>&amp;1; then
  log "未找到 psql，跳过 FnOS 商店插件更新检查"
  exit 0
fi

SQL="
SELECT
  COALESCE(installed.version, '') AS installed_version,
  COALESCE(candidate.version, '') AS candidate_version
FROM
  (SELECT version FROM app_package WHERE app_name = '\${APP_NAME}' AND installed = true ORDER BY id DESC LIMIT 1) installed
FULL JOIN
  (SELECT version FROM app_package WHERE app_name = '\${APP_NAME}' AND installed = false ORDER BY id DESC LIMIT 1) candidate
ON true;
"

RESULT=$("\${PSQL_BIN}" -d "\${DB_NAME}" -Atc "\${SQL}" 2>/dev/null || true)

if [ -z "\${RESULT}" ]; then
  log "未查询到 \${APP_NAME} 的商店更新信息，继续 OpenClaw 更新流程"
  exit 0
fi

INSTALLED=$(printf '%s' "\${RESULT}" | awk -F '|' '{print $1}')
CANDIDATE=$(printf '%s' "\${RESULT}" | awk -F '|' '{print $2}')

if [ -n "\${CANDIDATE}" ] &amp;&amp; [ "\${CANDIDATE}" != "\${INSTALLED}" ]; then
  log "发现飞牛商店插件新版本: \${INSTALLED:-unknown} → \${CANDIDATE}"
  log "请先在 FnOS App Center 中更新『飞牛 OpenClaw』插件，再回到控制面板升级 OpenClaw。"
  exit 2
fi

log "飞牛商店插件已是最新版本，无需先更新商店包"
exit 0</pre><p>接入后端更新流程时，建议只在 <code>action === "update"</code> 时执行：</p><pre>if (action === "update") {
  enqueue("检查 FnOS 商店插件是否有更新...");
  const check = Bun.spawnSync({
    cmd: ["bash", instance.installDir + "/scripts/check-store-plugin-update.sh"],
    stdout: "pipe",
    stderr: "pipe",
    env: process.env,
  });

  const output = new TextDecoder().decode(check.stdout || new Uint8Array()).trim();
  if (output) enqueue(output);

  if (check.exitCode === 2) {
    throw new Error("检测到 FnOS 商店插件有新版本，请先更新商店插件");
  }
}</pre><h2>十、优化二：OpenClaw 基底更新前先更新渠道插件</h2><p>OpenClaw 升级后，渠道插件可能因 SDK 或 API 变化而不兼容。尤其是 QQBot 这类插件，建议在升级 OpenClaw 基底前先更新到最新版本。</p><p>后端可加入：</p><pre>const channelPkgs = ["@openclaw/qqbot@latest"];

if (action === "update") {
  for (const pkg of channelPkgs) {
    enqueue("升级渠道插件 " + pkg + " ...");
    const pluginResult = Bun.spawnSync({
      cmd: [
        bunPath,
        "add",
        "--cwd",
        instance.installDir,
        "--registry",
        registry,
        pkg,
      ],
      stdout: "pipe",
      stderr: "pipe",
      env: installEnv,
    });

    const stdout = new TextDecoder().decode(pluginResult.stdout || new Uint8Array()).trim();
    const stderr = new TextDecoder().decode(pluginResult.stderr || new Uint8Array()).trim();
    if (stdout) enqueue(stdout);
    if (stderr) enqueue(stderr);

    if (pluginResult.exitCode !== 0) {
      throw new Error("渠道插件 " + pkg + " 更新失败");
    }
  }
}</pre><p>这样完整顺序变为：</p><pre>点击“检查更新”
  → 确认弹窗
  → 停止 Gateway
  → Step 1：检测 FnOS 商店插件更新
  → Step 2：bun add @openclaw/qqbot@latest
  → Step 3：bun add openclaw@latest
  → 刷新渠道插件列表
  → 刷新模型目录快照
  → 启动 Gateway</pre><h2>十一、Gateway 启停与配置写入</h2><p>更新前应优雅停止 Gateway：</p><pre>gracefulStopGateway(instance, enqueue, action)</pre><p>建议逻辑：</p><pre>1. 读取当前 Gateway 端口
2. 查找监听端口 PID 与 pid 文件 PID
3. 校验 PID 是否确为 OpenClaw 进程
4. 发送 SIGTERM
5. 最多等待 15 秒
6. 若未退出，发送 SIGKILL
7. 清理 pid 文件
8. 标记 stopped</pre><p>更新后启动：</p><pre>openclaw gateway run --port 25730 --bind loopback</pre><p>配置建议写入：</p><pre>gateway.mode = "local"
gateway.port = 25730
gateway.bind = "loopback"
gateway.trustedProxies = ["127.0.0.1", "::1"]
gateway.controlUi.enabled = true
gateway.controlUi.basePath = "/app/trim-openclaw"
gateway.controlUi.allowInsecureAuth = true
gateway.controlUi.dangerouslyDisableDeviceAuth = true
gateway.controlUi.allowedOrigins = ["*"]
agents.defaults.workspace = "/vol1/@apphome/trim.openclaw/data/workspace"
update.checkOnStart = false
cli.banner.taglineMode = "off"</pre><p><strong>安全提醒：</strong><code>allowInsecureAuth</code> 与 <code>dangerouslyDisableDeviceAuth</code> 只适用于 FnOS App Center 已经提供外层认证、且 Gateway 仅 loopback 监听的场景。若你把 Gateway 暴露到局域网或公网，不应这样配置。</p><h2>十二、复刻步骤总览</h2><p>在另一台 FnOS 设备复刻时，推荐顺序如下：</p><pre># 1. 通过 FnOS App Center 安装飞牛 OpenClaw
# 确认 trim.openclaw 用户、应用目录与依赖已创建
id trim.openclaw
ls -ld /var/apps/trim.openclaw /vol1/@appcenter/trim.openclaw /vol1/@apphome/trim.openclaw

# 2. 确认 Bun / Node.js
/var/apps/bunjs/target/bin/bun --version
/var/apps/nodejs_v24/target/bin/node --version

# 3. 确认主脚本
sed -n '1,220p' /var/apps/trim.openclaw/cmd/main

# 4. 确认 OpenClaw wrapper
sed -n '1,120p' /var/apps/trim.openclaw/target/bin/openclaw

# 5. 修正数据目录权限
chown -R trim.openclaw:trim.openclaw /vol1/@apphome/trim.openclaw/data
chmod -R 750 /vol1/@apphome/trim.openclaw/data
chmod 700 /vol1/@apphome/trim.openclaw/data/home/.openclaw
chmod 640 /vol1/@apphome/trim.openclaw/data/home/.openclaw/openclaw.json

# 6. 安装 ensure 脚本与 systemd unit
chmod +x /usr/local/sbin/openclaw-ensure.sh
systemctl daemon-reload
systemctl enable --now openclaw-ensure.service

# 7. 验证商店版进程与端口
ps -eo pid,ppid,user,group,cmd | grep -E 'trim.openclaw|server/index.js|openclaw' | grep -v grep
ss -ltnp | grep 25730
curl -I http://127.0.0.1:25730/</pre><h2>十三、完整备份、一键还原与新机复用</h2><p>修复完成后，建议立即做一份完整备份。本文环境最终备份位于：</p><pre>/vol2/1000/Backup/OpenClaw/store-openclaw-20260529-215247

openclaw-store-full.tar.zst   # 完整归档，约 464M
restore-openclaw-store.sh     # 一键恢复/新机复用脚本
checksums.sha256              # 校验文件
backup-info.txt               # 备份说明
manifest.txt                  # 路径清单
README.md                     # 使用说明</pre><p>latest 指针：</p><pre>/vol2/1000/Backup/OpenClaw/LATEST_STORE.txt
/vol2/1000/Backup/OpenClaw/restore-latest-openclaw-store.sh</pre><p>恢复最新备份：</p><pre>/vol2/1000/Backup/OpenClaw/restore-latest-openclaw-store.sh</pre><p>无人值守恢复：</p><pre>/vol2/1000/Backup/OpenClaw/restore-latest-openclaw-store.sh --yes</pre><p>备份应至少包含：</p><pre>/var/apps/trim.openclaw/
/vol1/@appcenter/trim.openclaw/
/vol1/@apphome/trim.openclaw/
/vol1/@appdata/trim.openclaw/
/usr/local/bin/openclaw
/usr/local/sbin/openclaw-ensure.sh
/etc/systemd/system/openclaw-ensure.service</pre><p>新机复用时，建议先在 FnOS 商店安装一次 <code>trim.openclaw</code>，确保系统用户、App Center 注册与 nginx/socket 路由存在，再运行恢复脚本。完整运行态备份会包含 sessions、credentials、identity、plugin-state、media/outbound 等数据，适合自用迁移，不适合公开分享。</p><h2>十四、排错清单</h2><h3>1. 控制面板能打开，但 Gateway 不在线</h3><pre>systemctl status openclaw-ensure.service --no-pager
cat /var/log/openclaw-ensure.log
tail -n 100 /vol1/@appdata/trim.openclaw/info.log
ss -ltnp | grep 25730</pre><h3>2. bun command not found</h3><p>检查 <code>cmd/main</code> 与 wrapper 的 PATH：</p><pre>export PATH=/var/apps/bunjs/target/bin:/var/apps/nodejs_v24/target/bin:$PATH
command -v bun
command -v node</pre><h3>3. 配置文件读不到</h3><p>确认 HOME 与 OPENCLAW_CONFIG_PATH：</p><pre>runuser -u trim.openclaw -- env   HOME=/vol1/@apphome/trim.openclaw/data/home   OPENCLAW_CONFIG_PATH=/vol1/@apphome/trim.openclaw/data/home/.openclaw/openclaw.json   /var/apps/trim.openclaw/target/bin/openclaw --version</pre><h3>4. 误把 Docker 版和商店版混在一起</h3><p>判断标准：</p><pre># 商店版
用户：trim.openclaw
端口：127.0.0.1:25730
cwd：/vol1/@apphome/trim.openclaw/data/openclaw

# Docker 或其他自建版
用户：通常为 root 或容器用户
端口：可能是 18789 或其他
cwd：通常是 /app 或容器内路径</pre><h2>十五、最终效果</h2><p>完成优化后，你会得到一个更稳的商店版 OpenClaw：</p><pre>✅ FnOS 商店包负责 UI / Monitor / 生命周期入口
✅ openclaw-ensure 不再以 root 调用 cmd/main start
✅ OpenClaw Gateway 以 trim.openclaw 用户运行
✅ Gateway 仅监听 127.0.0.1:25730
✅ systemd 只负责开机后兜底拉起 Gateway
✅ 控制面板“检查更新”可升级 openclaw@latest
✅ 更新前可检测 FnOS 商店插件版本
✅ 更新 OpenClaw 前可先升级渠道插件
✅ 更新后自动刷新渠道插件与模型目录
✅ 完整备份可一键还原或新机复用
✅ 整体路径清晰，便于备份、恢复和迁移</pre><p>这套方案的关键不是“把 OpenClaw 跑起来”，而是让它符合 FnOS 商店应用的运行范式：程序归 App Center，数据归 @apphome，权限归独立用户，Gateway 不直接暴露，升级逻辑有顺序、有日志、可回滚。这样迁移到另一台设备时，只需按目录、用户、wrapper、systemd、更新逻辑逐项复刻，就能得到一致的运行环境。`);function Vr(){return D(()=>{document.querySelectorAll(".reveal").forEach(e=>e.classList.add("visible")),window.scrollTo(0,0)}),(()=>{var e=Xr(),t=e.firstChild,n=t.firstChild;return g(t,u(k,{href:"/articles",class:"back-link",children:"← 返回文章列表"}),n),e})()}var Yr=w(`<section id=article-detail><div class="article-container reveal"><div class=article-header><h1>飞牛系统（FnOS）核显温度显示补丁：从原理到实现</h1><p class=article-subtitle>Intel iGPU · WebSocket 代理 · JS 注入 · bind-mount · FnOS 资源监控面板适配</p><div class=article-meta><span class=article-date>2026-05-24</span><div class=article-tags><span class=tech-tag>FnOS</span><span class=tech-tag>iGPU</span><span class=tech-tag>Intel</span><span class=tech-tag>WebSocket</span><span class=tech-tag>系统补丁</span></div></div></div><div class=article-content><h2>一、背景</h2><p>飞牛系统（FnOS）基于 Linux 深度定制，其 Web 管理面板内置了资源监控功能，可显示 CPU、内存、磁盘、网络、GPU 等设备的实时状态。然而，对于部分 Intel 处理器（特别是 10th/11th 代及更新型号），核显（iGPU）的温度在 FnOS 面板中显示为空或 0，因为 FnOS 的 GPU 监控逻辑只读取了独立显卡的温度传感器，而 Intel 核显的温度输出方式与独显不同。</p><p>问题的本质：Intel 核显（i915 驱动）通常不暴露独立的温度传感器（thermal zone），核显温度实际包含在 CPU 封装温度包（Package Temperature）中。FnOS 的资源监控通过「核心系统资源 API」（trim_cgi）获取 GPU 数据时，读取到的 GPU 温度为空，导致面板中 GPU 温度项无显示值。</p><p>本方案通过 WebSocket 代理注入 + JavaScript 补丁 + bind-mount 的方式，在完全不修改 FnOS 核心文件的前提下，将 CPU 封装温度回填到 GPU 温度显示字段中。</p><h2>二、方案架构</h2><pre>┌─────────────────────────────────────────────────────────────────┐
│                   FnOS Web 管理面板 (浏览器端)                    │
│  资源监控页面                                                    │
│  ┌─ ResourceMonitor.js (已补丁) ──────────────────────────────┐ │
│  │  GPU 温度显示逻辑：如果 GPU 返回 temp 为空，使用             │ │
│  │  window.__xiaIgpuTemp（来自 CPU Package 温度）回填          │ │
│  └───────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────────┘
                           │ WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              fnos-igpu-ws-proxy.py (WebSocket 代理)              │
│  监听 /run/trim_cgi.socket                                       │
│  收到 GPU 查询请求 → 从 CPU 响应中提取 Package 温度               │
│  → 回填到 GPU 响应数据中 → 转发给浏览器                           │
│  直接读取 /sys/class/hwmon 作为 fallback                          │
└───────────┬──────────────────────────────┬───────────────────────┘
            │                              │
            ▼                              ▼
┌─────────────────────────┐  ┌──────────────────────────────┐
│ trim_cgi (FnOS 后端)     │  │ /sys/class/hwmon 传感器       │
│ 通过 /run/trim_cgi.socket│  │ coretemp → CPU Package 温度  │
│ .orig 接收原始请求        │  │ pch_cometlake → PCH 温度    │
└─────────────────────────┘  └──────────────────────────────┘</pre><p>三个核心组件：</p><ol><li><strong>WebSocket 代理</strong>（Python）：拦截 FnOS 资源监控的前后端 WebSocket 通信，在 GPU 数据中注入 CPU Package 温度</li><li><strong>JavaScript 补丁</strong>：修改 FnOS 前端的 GPU 温度显示逻辑，当温度值为空时接受来自代理的回填值</li><li><strong>bind-mount 挂载</strong>：将补丁后的文件覆盖原始文件，不修改原始系统分区</li></ol><h2>三、前置条件与系统检查</h2><h3>3.1 确认硬件</h3><p>本方案适用于搭载 Intel 核显的 FnOS 设备。检查方法：</p><pre># 检查 i915 驱动是否加载
lsmod | grep i915
# 输出示例：
# i915                 4739072  39 kvmgt
# drm_buddy              28672  1 i915
# ttm                   118784  1 i915

# 检查 GPU 设备是否存在
ls /sys/class/drm/
# 输出包含 card0、renderD128 等

# 检查 CPU 型号（带核显）
cat /proc/cpuinfo | grep "model name" | head -1
# Intel(R) Celeron(R) N5095 / Intel(R) Core(TM) i3-10100 等

# 检查 lm-sensors 是否安装
which sensors
sensors | grep -i "Package id"
# Package id 0:  +79.0°C  (high = +100.0°C, crit = +100.0°C)</pre><h3>3.2 确认问题</h3><p>打开 FnOS Web 面板 → 资源监控 → 查看 GPU 区域。如果核显类型/负载/显存有显示但温度为空白或 0，说明需要打此补丁。</p><h3>3.3 需要的东西</h3><ul><li>FnOS 设备（Debian 12 内核 6.x）with root 权限</li><li>Intel 核显（i915 驱动已加载）</li><li>Python 3.7+（FnOS 自带）</li><li>lm-sensors 包（用于手动验证温度，非必须）</li></ul><h2>四、核心组件详解</h2><h3>4.1 WebSocket 代理（fnos-igpu-ws-proxy.py）</h3><p>这是整个方案的核心。FnOS 的资源监控前端通过 WebSocket 与后端服务通信，WebSocket 请求通过 Unix Socket（/run/trim_cgi.socket）传输。代理程序做了两件事：</p><p><strong>socket 接管</strong>：启动时，代理程序将原始 FnOS 的监听 socket 重命名为 /run/trim_cgi.socket.orig，然后自己在 /run/trim_cgi.socket 上监听。这样所有 WebSocket 连接先经过代理，再转发到原始后端。</p><pre># 启动时
mv /run/trim_cgi.socket /run/trim_cgi.socket.orig
python3 fnos-igpu-ws-proxy.py   # 监听 /run/trim_cgi.socket

# 停止时恢复
rm -f /run/trim_cgi.socket
mv /run/trim_cgi.socket.orig /run/trim_cgi.socket</pre><p><strong>数据注入</strong>：代理程序在转发 WebSocket 帧时，拦截两类请求：</p><ul><li><code>appcgi.resmon.cpu</code>：提取 CPU 响应数据中的 Package 温度（coretemp 的第一个温度值），缓存到变量</li><li><code>appcgi.resmon.gpu</code>：遍历 GPU 列表，如果某个 GPU 的 temp 字段为空或无效，用缓存的 CPU Package 温度回填</li></ul><p>同时，代理程序还直接读取 <code>/sys/class/hwmon</code> 作为 fallback 温度来源，优先级为 coretemp > pch_cometlake，确保温度值始终在 0-130°C 范围内才采用。</p><pre># 温度读取策略
1. 优先从 appcgi.resmon.cpu 响应中提取（正常运行时）
2. 如果上述不可用，从 /sys/class/hwmon 读取
   2a. coretemp/temp1_input → CPU Package 温度
   2b. pch_cometlake → PCH 温度（备选）
3. 温度值必须在 0-130°C 范围，否则丢弃</pre><h3>4.2 JavaScript 补丁</h3><p>对 FnOS 前端文件做了三处修改：</p><p><strong>补丁一：GPU 温度显示条件（ResourceMonitor.js）</strong></p><p>原始代码中，GPU 温度显示的条件判断是 <code>r.temp</code>，当 temp 为空或 0 时不显示元素。修改后增加 <code>r.temp === 0</code> 的判断，即温度值即使为 0 也应显示，这样 WebSocket 代理注入的温度值才能被面板展示。</p><pre>// 修改前
dt=(e,r)=>{var s;r.temp&amp;&amp;e.add(U.Temp)

// 修改后
dt=(e,r)=>{var s;(r.temp||r.temp===0)&amp;&amp;e.add(U.Temp)</pre><p><strong>补丁二：CPU 温度捕获与缓存（ResourceMonitor.js）</strong></p><p>在资源监控的 CPU 数据请求回调中，将 CPU Package 温度保存到全局变量 window.__xiaIgpuTemp，供 GPU 数据注入使用。</p><pre>// window.__xiaIgpuTemp 全局变量
try{window.__xiaIgpuTemp=Array.isArray(a.data.cpu.temp)?
  a.data.cpu.temp[0]:void 0}catch{}</pre><p><strong>补丁三：核心 WebSocket 注入（index.js - 核心入口）</strong></p><p>在 FnOS 前端 WebSocket 底层框架中，对收到的每个消息尝试提取 CPU 温度和回填 GPU 温度。这里还读取 Cookie 中的 xia_igpu_temp 作为额外 fallback 来源。</p><h3>4.3 bind-mount 挂载</h3><p>为避免修改原始文件、防止 FnOS 系统更新时被覆盖，所有补丁文件通过 bind-mount 方式覆盖：</p><pre># 将补丁后的 JS 文件 mount 到原始路径
mount --bind /usr/local/share/fnos-igpu-temp-patch/ResourceMonitor-BacdZkk_.js \\
  /usr/trim/www/assets/ResourceMonitor-BacdZkk_.js

mount --bind /usr/local/share/fnos-igpu-temp-patch/index-CMZOY5-G.js \\
  /usr/trim/www/assets/index-CMZOY5-G.js

# 取消挂载
umount /usr/trim/www/assets/ResourceMonitor-BacdZkk_.js
umount /usr/trim/www/assets/index-CMZOY5-G.js</pre><h2>五、完整部署脚本</h2><p>以下为完整的 setup 脚本。逐行执行即可完成部署。本仓库也提供了完整的恢复脚本（见第八节）。</p><h3>5.1 安装 WebSocket 代理脚本</h3><pre>cat > /usr/local/sbin/fnos-igpu-ws-proxy.py &lt;&lt; 'PYEOF'
#!/usr/bin/env python3
import asyncio, base64, hashlib, json, os, re, socket, struct, time

LISTEN = os.environ.get('XIA_IGPU_LISTEN', '/run/trim_cgi.socket')
UPSTREAM = os.environ.get('XIA_IGPU_UPSTREAM', '/run/trim_cgi.socket.orig')
LOG = '/var/log/fnos-igpu-ws-proxy.log'
GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
TEMP_COOKIE = re.compile(r'(?:^|;s*)xia_igpu_temp=([0-9.]+)')

last_temp = None

def log(msg):
    try:
        with open(LOG, 'a') as f:
            f.write(time.strftime('%F %T ') + msg + '
')
    except Exception:
        pass

def read_temp():
    candidates = []
    try:
        for name_path in sorted(os.listdir('/sys/class/hwmon')):
            base = '/sys/class/hwmon/' + name_path
            try:
                name = open(base + '/name').read().strip()
            except Exception:
                continue
            if name == 'coretemp':
                candidates.insert(0, base + '/temp1_input')
            elif name == 'pch_cometlake':
                candidates.append(base + '/temp1_input')
        for p in candidates:
            try:
                v = int(open(p).read().strip()) / 1000.0
                if 0 &lt; v &lt; 130:
                    return round(v, 1)
            except Exception:
                pass
    except Exception:
        pass
    return None

def inject_payload(text):
    global last_temp
    try:
        obj = json.loads(text)
    except Exception:
        return text
    try:
        req = obj.get('req')
        data = obj.get('data')
        if req == 'appcgi.resmon.cpu':
            cpu = (data or {}).get('cpu') or {}
            temps = cpu.get('temp')
            if isinstance(temps, list) and temps:
                t = temps[0]
                if isinstance(t, (int, float)) and t >= 0:
                    last_temp = t
        elif req == 'appcgi.resmon.gpu':
            gpu = (data or {}).get('gpu')
            if isinstance(gpu, list):
                t = last_temp if isinstance(last_temp, (int, float)) and last_temp >= 0 else read_temp()
                if isinstance(t, (int, float)) and t >= 0:
                    changed = False
                    for g in gpu:
                        if isinstance(g, dict):
                            gt = g.get('temp')
                            if not isinstance(gt, (int, float)) or gt &lt; 0:
                                g['temp'] = t
                                changed = True
                    if changed:
                        obj['data']['gpu'] = gpu
                        return json.dumps(obj, ensure_ascii=False, separators=(',', ':'))
    except Exception as e:
        log('inject error: %r' % (e,))
    return text

# --- WebSocket 帧解析和转发 ---

def encode_frame(payload, opcode=1, mask=False):
    if isinstance(payload, str):
        payload = payload.encode()
    ln = len(payload)
    first = 0x80 | opcode
    if ln &lt; 126:
        hdr = bytes([first, (0x80 if mask else 0) | ln])
    elif ln &lt; 65536:
        hdr = bytes([first, (0x80 if mask else 0) | 126]) + struct.pack('!H', ln)
    else:
        hdr = bytes([first, (0x80 if mask else 0) | 127]) + struct.pack('!Q', ln)
    if mask:
        key = os.urandom(4)
        payload = bytes(b ^ key[i % 4] for i, b in enumerate(payload))
        return hdr + key + payload
    return hdr + payload

async def read_frame(reader):
    h = await reader.readexactly(2)
    b1, b2 = h[0], h[1]
    opcode = b1 &amp; 0x0f
    masked, ln = b2 &amp; 0x80, b2 &amp; 0x7f
    if ln == 126:
        ln = struct.unpack('!H', await reader.readexactly(2))[0]
    elif ln == 127:
        ln = struct.unpack('!Q', await reader.readexactly(8))[0]
    key = await reader.readexactly(4) if masked else b''
    data = await reader.readexactly(ln) if ln else b''
    if masked:
        data = bytes(b ^ key[i % 4] for i, b in enumerate(data))
    return opcode, data

async def pipe_client_to_upstream(cr, uw):
    try:
        while True:
            op, data = await read_frame(cr)
            uw.write(encode_frame(data, op, mask=True))
            await uw.drain()
            if op == 8: break
    except Exception: pass
    try: uw.close()
    except: pass

async def pipe_upstream_to_client(ur, cw):
    try:
        while True:
            op, data = await read_frame(ur)
            if op == 1:
                try:
                    data = inject_payload(data.decode('utf-8', 'ignore')).encode('utf-8')
                except: pass
            cw.write(encode_frame(data, op, mask=False))
            await cw.drain()
            if op == 8: break
    except Exception: pass
    try: cw.close()
    except: pass

async def handle(reader, writer):
    try:
        buf = b''
        while b'\r
\r
' not in buf:
            chunk = await reader.read(4096)
            if not chunk: return
            buf += chunk
            if len(buf) > 65536: return
        # 解析 WebSocket 握手
        head, rest = buf.split(b'\r
\r
', 1)
        lines = head.decode('iso-8859-1', 'ignore').split('\r
')
        headers = {}
        for line in lines[1:]:
            if ':' in line:
                k, v = line.split(':', 1)
                headers[k.lower().strip()] = v.strip()
        key = headers.get('sec-websocket-key')
        if not key:
            writer.write(b'HTTP/1.1 400 Bad Request\r
Content-Length: 0\r
\r
')
            await writer.drain()
            return
        accept = base64.b64encode(hashlib.sha1((key + GUID).encode()).digest()).decode()
        writer.write(('HTTP/1.1 101 Switching Protocols\r
'
            'Upgrade: websocket\r
Connection: Upgrade\r
'
            'Sec-WebSocket-Accept: %s\r
\r
') % accept)
        await writer.drain()

        ur, uw = await asyncio.open_unix_connection(UPSTREAM)
        up_key = base64.b64encode(os.urandom(16)).decode()
        req = ('GET / HTTP/1.1\r
Host: localhost\r
'
            'Upgrade: websocket\r
Connection: Upgrade\r
'
            'Sec-WebSocket-Key: ' + up_key + '\r
Sec-WebSocket-Version: 13\r
\r
').encode()
        uw.write(req); await uw.drain()
        resp = b''
        while b'\r
\r
' not in resp:
            resp += await ur.read(4096)
            if len(resp) > 65536:
                raise RuntimeError('bad upstream handshake')
        await asyncio.gather(
            pipe_client_to_upstream(reader, uw),
            pipe_upstream_to_client(ur, writer))
    except Exception as e:
        log('handle error: %r' % (e,))
    finally:
        try: writer.close(); await writer.wait_closed()
        except: pass

async def main():
    try: os.unlink(LISTEN)
    except FileNotFoundError: pass
    server = await asyncio.start_unix_server(handle, LISTEN)
    os.chmod(LISTEN, 0o666)
    log('listening ' + LISTEN)
    async with server:
        await server.serve_forever()

if __name__ == '__main__':
    asyncio.run(main())
PYEOF
chmod +x /usr/local/sbin/fnos-igpu-ws-proxy.py</pre><h3>5.2 安装补丁脚本</h3><pre>mkdir -p /usr/local/share/fnos-igpu-temp-patch

# ==== patch 脚本 ====
cat > /usr/local/sbin/fnos-igpu-temp-patch &lt;&lt; 'SHEOF'
#!/bin/sh
set -eu
SRC=/usr/trim/www/assets/ResourceMonitor-BacdZkk_.js
DIR=/usr/local/share/fnos-igpu-temp-patch
PATCHED=$DIR/ResourceMonitor-BacdZkk_.js
LOG=/var/log/fnos-igpu-temp-patch.log
now(){ date "+%F %T"; }
mkdir -p "$DIR"
if [ ! -f "$SRC" ]; then echo "$(now) source missing: $SRC" >> "$LOG"; exit 0; fi
if findmnt -n "$SRC" >/dev/null 2>&amp;1; then umount "$SRC" || true; fi
python3 - "$SRC" "$PATCHED" "$LOG" &lt;&lt;"PY"
from pathlib import Path; from datetime import datetime; import sys
src=Path(sys.argv[1]); dst=Path(sys.argv[2]); log=Path(sys.argv[3])
s=src.read_text(errors="ignore")
now=datetime.now().strftime("%F %T")
changes=[]
repls=[
 ("gpu-temp-option",
  "dt=(e,r)=>{var s;r.temp&amp;&amp;e.add(U.Temp)",
  "dt=(e,r)=>{var s;(r.temp||r.temp===0)&amp;&amp;e.add(U.Temp)"),
 ("capture-cpu-package-temp",
  "ne.resmoCpu({},{timeout:1e3}).then(a=>{r(n=>(n.shift(),[...n,a.data.cpu]))}",
  "ne.resmoCpu({},{timeout:1e3}).then(a=>{try{window.__xiaIgpuTemp=Array.isArray(a.data.cpu.temp)?a.data.cpu.temp[0]:void 0}catch{}r(n=>(n.shift(),[...n,a.data.cpu]))}"),
 ("inject-gpu-temp",
  "ne.resmoGpu({},{timeout:1e3}).then(n=>{r(o=>(o.shift(),[...o,n.data]))}",
  "ne.resmoGpu({},{timeout:1e3}).then(n=>{try{const x=window.__xiaIgpuTemp;if(n&amp;&amp;n.data&amp;&amp;Array.isArray(n.data.gpu))n.data.gpu=n.data.gpu.map(g=>g&amp;&amp;(!(g.temp>=0)||Number.isNaN(g.temp))?{...g,temp:x}:g)}catch{}r(o=>(o.shift(),[...o,n.data]))}"),
]
for name,old,new in repls:
    if new in s: changes.append(f"{name}:already")
    elif old in s:
        s=s.replace(old,new,1); changes.append(f"{name}:patched")
    else: changes.append(f"{name}:missing")
dst.write_text(s)
log.open("a").write(f"{now} generated patched asset: {dst}; " + ", ".join(changes) + chr(10))
PY
mount --bind "$PATCHED" "$SRC"
echo "$(now) bind-mounted patched asset over $SRC" >> "$LOG"
SHEOF

# ==== core-patch 脚本 ====
cat > /usr/local/sbin/fnos-igpu-temp-core-patch &lt;&lt; 'SHEOF'
#!/bin/sh
set -eu
SRC=/usr/trim/www/assets/index-CMZOY5-G.js
DIR=/usr/local/share/fnos-igpu-temp-patch
PATCHED=$DIR/index-CMZOY5-G.js
LOG=/var/log/fnos-igpu-temp-patch.log
now(){ date "+%F %T"; }
mkdir -p "$DIR"
if [ ! -f "$SRC" ]; then echo "$(now) core source missing: $SRC" >> "$LOG"; exit 0; fi
python3 - "$SRC" "$PATCHED" "$LOG" &lt;&lt;'PY'
from pathlib import Path; from datetime import datetime; import sys
src=Path(sys.argv[1]); dst=Path(sys.argv[2]); log=Path(sys.argv[3])
s=src.read_text(errors="ignore")
old='const n=JSON.parse(e.data);if(this.emit("message",e),n.res==="pong")'
inject='const n=JSON.parse(e.data);try{if(n&amp;&amp;n.req==="appcgi.resmon.cpu"&amp;&amp;n.data&amp;&amp;n.data.cpu&amp;&amp;Array.isArray(n.data.cpu.temp))window.__xiaIgpuTemp=n.data.cpu.temp[0];if(n&amp;&amp;n.req==="appcgi.resmon.gpu"&amp;&amp;n.data&amp;&amp;Array.isArray(n.data.gpu)){let x=window.__xiaIgpuTemp;if(!(x>=0)){let c=document.cookie.match(/(?:^|; )xia_igpu_temp=([0-9.]+)/);x=c?Number(c[1]):void 0}if(x>=0)n.data.gpu=n.data.gpu.map(g=>g&amp;&amp;(!(g.temp>=0)||Number.isNaN(g.temp))?{...g,temp:x}:g)}}catch{}if(this.emit("message",e),n.res==="pong")'
now=datetime.now().strftime("%F %T")
if inject in s: st="already"
elif old in s:
    s=s.replace(old,inject,1); st="patched"
else: st="missing"
dst.write_text(s)
log.open("a").write(f"{now} generated core patched asset: {dst}; websocket-inject:{st}" + chr(10))
PY
mount --bind "$PATCHED" "$SRC"
SHEOF

# ==== refresh 脚本 ====
cat > /usr/local/sbin/fnos-igpu-temp-refresh &lt;&lt; 'SHEOF'
#!/bin/sh
set -eu
/usr/local/sbin/fnos-igpu-temp-patch
/usr/local/sbin/fnos-igpu-temp-core-patch
SHEOF

# ==== unpatch 脚本 ====
cat > /usr/local/sbin/fnos-igpu-temp-unpatch &lt;&lt; 'SHEOF'
#!/bin/sh
set -eu
systemctl disable --now fnos-igpu-temp-patch.service >/dev/null 2>&amp;1 || true
systemctl disable --now fnos-igpu-ws-proxy.service >/dev/null 2>&amp;1 || true
for f in /usr/trim/www/assets/ResourceMonitor-BacdZkk_.js   /usr/trim/www/assets/index-CMZOY5-G.js   /usr/trim/nginx/conf/nginx.conf; do
  if findmnt -n "$f" >/dev/null 2>&amp;1; then umount "$f"; fi
done
echo "unpatched FnOS iGPU temperature proxy and web assets"
SHEOF

chmod +x /usr/local/sbin/fnos-igpu-temp-patch   /usr/local/sbin/fnos-igpu-temp-core-patch   /usr/local/sbin/fnos-igpu-temp-refresh   /usr/local/sbin/fnos-igpu-temp-unpatch</pre><h3>5.3 安装 systemd 服务</h3><pre>cat > /etc/systemd/system/fnos-igpu-ws-proxy.service &lt;&lt; 'SERVEOF'
[Unit]
Description=FnOS Intel iGPU temperature WebSocket injection proxy
After=trim_main.service trim_nginx.service resmon_service.service
Requires=trim_main.service

[Service]
Type=simple
ExecStartPre=/bin/sh -c 'for i in $(seq 1 60); do \\
  if [ -S /run/trim_cgi.socket ] &amp;&amp; ss -lxnp | grep -q "/run/trim_cgi.socket.*trim"; then exit 0; fi; \\
  sleep 1; done; echo "trim_cgi.socket not ready" >&amp;2; exit 1'
ExecStartPre=/bin/sh -c 'if [ -S /run/trim_cgi.socket.orig ]; then rm -f /run/trim_cgi.socket.orig; fi; \\
  mv /run/trim_cgi.socket /run/trim_cgi.socket.orig; rm -f /run/trim_cgi.socket'
Environment=XIA_IGPU_LISTEN=/run/trim_cgi.socket
Environment=XIA_IGPU_UPSTREAM=/run/trim_cgi.socket.orig
ExecStart=/usr/local/sbin/fnos-igpu-ws-proxy.py
ExecStopPost=/bin/sh -c 'rm -f /run/trim_cgi.socket; \\
  if [ -S /run/trim_cgi.socket.orig ]; then mv /run/trim_cgi.socket.orig /run/trim_cgi.socket; fi'
Restart=always
RestartSec=2

[Install]
WantedBy=multi-user.target
SERVEOF

cat > /etc/systemd/system/fnos-igpu-temp-patch.service &lt;&lt; 'SERVEOF'
[Unit]
Description=Bind-mount patched FnOS web assets for Intel iGPU temperature display
After=local-fs.target trim_file_monitor.service trim_nginx.service
Wants=trim_nginx.service

[Service]
Type=oneshot
ExecStart=/usr/local/sbin/fnos-igpu-temp-refresh
RemainAfterExit=yes
ExecStop=/bin/sh -c 'for f in \\
  /usr/trim/www/assets/ResourceMonitor-BacdZkk_.js \\
  /usr/trim/www/assets/index-CMZOY5-G.js; do \\
  findmnt -n "$f" >/dev/null 2>&amp;1 &amp;&amp; umount "$f" || true; done'

[Install]
WantedBy=multi-user.target
SERVEOF

systemctl daemon-reload</pre><h2>六、启动与验证</h2><h3>6.1 启动服务</h3><p>注意：必须先启动 WebSocket 代理服务，再刷新补丁（JS 补丁依赖原始前端文件）：</p><pre>systemctl enable --now fnos-igpu-ws-proxy.service
systemctl enable --now fnos-igpu-temp-patch.service
# 等待几秒后刷新 FnOS Web 面板

# 检查服务状态
systemctl status fnos-igpu-ws-proxy.service --no-pager
systemctl status fnos-igpu-temp-patch.service --no-pager</pre><h3>6.2 验证</h3><p>打开 FnOS Web 面板 → 资源监控 → GPU 区域，应能看到温度值。温度值来源于 CPU 封装温度（Package Temperature），并非独立 GPU 传感器，但已足够反映核显的散热状态。</p><p>也可以通过日志确认注入是否生效：</p><pre># WS 代理日志
tail -f /var/log/fnos-igpu-ws-proxy.log
# listening /run/trim_cgi.socket

# 补丁日志
cat /var/log/fnos-igpu-temp-patch.log
# gpu-temp-option:patched, capture-cpu-package-temp:patched, inject-gpu-temp:patched
# websocket-inject:patched</pre><h2>七、卸载</h2><pre># 一键卸载
bash /usr/local/sbin/fnos-igpu-temp-unpatch
# 或
systemctl disable --now fnos-igpu-ws-proxy.service
systemctl disable --now fnos-igpu-temp-patch.service
rm -f /etc/systemd/system/fnos-igpu-ws-proxy.service
rm -f /etc/systemd/system/fnos-igpu-temp-patch.service
systemctl daemon-reload
systemctl restart trim_nginx.service</pre><h2>八、Fnos系统更新后的处理</h2><p>FnOS 更新时可能会替换前端 JS 文件，导致 bind-mount 挂载点失效或补丁的文件名发生变化。更新后的处理步骤：</p><pre># 1. 检查补丁状态
cat /var/log/fnos-igpu-temp-patch.log | tail -5
# 如果有 "missing" 字样，说明前端文件名或代码结构已变化

# 2. 重新应用补丁
systemctl restart fnos-igpu-temp-patch.service

# 3. 如果仍不行，可能需要手动检查新的 JS 文件名
ls /usr/trim/www/assets/
# 找到新的 ResourceMonitor 和 index 文件，更新脚本中的文件名</pre><h2>九、备份与恢复</h2><h3>9.1 备份现有补丁</h3><pre># 完整备份所有补丁文件
BACKUP_DIR=/vol2/Backups/fnos-igpu-temp-patch-$(date +%Y%m%d-%H%M%S)
mkdir -p "$BACKUP_DIR"

# 收集所有相关文件
tar --zstd -cpf "$BACKUP_DIR/fnos-igpu-temp-patch-full.tar.zst" \\
  -C / etc/systemd/system/fnos-igpu-temp-patch.service \\
  -C / etc/systemd/system/fnos-igpu-ws-proxy.service \\
  -C / usr/local/sbin/fnos-igpu-ws-proxy.py \\
  -C / usr/local/sbin/fnos-igpu-temp-patch \\
  -C / usr/local/sbin/fnos-igpu-temp-core-patch \\
  -C / usr/local/sbin/fnos-igpu-temp-refresh \\
  -C / usr/local/sbin/fnos-igpu-temp-unpatch \\
  -C / usr/local/share/fnos-igpu-temp-patch \\
  -C / var/log/fnos-igpu-temp-patch.log \\
  -C / var/log/fnos-igpu-ws-proxy.log

# 生成摘要
cd "$BACKUP_DIR"
sha256sum fnos-igpu-temp-patch-full.tar.zst > checksums.sha256
echo "backup saved to $BACKUP_DIR"</pre><h3>9.2 在新设备上恢复</h3><pre># 从备份恢复
tar --zstd -xpf fnos-igpu-temp-patch-full.tar.zst -C /
chmod +x /usr/local/sbin/fnos-igpu-ws-proxy.py \\
  /usr/local/sbin/fnos-igpu-temp-patch \\
  /usr/local/sbin/fnos-igpu-temp-core-patch \\
  /usr/local/sbin/fnos-igpu-temp-refresh \\
  /usr/local/sbin/fnos-igpu-temp-unpatch

systemctl daemon-reload
systemctl enable --now fnos-igpu-ws-proxy.service
systemctl enable --now fnos-igpu-temp-patch.service
/usr/local/sbin/fnos-igpu-temp-refresh

# 验证
systemctl status fnos-igpu-ws-proxy.service --no-pager</pre><h2>十、技术原理深析</h2><h3>10.1 为什么 Intel 核显没有独立温度传感器？</h3><p>Intel 从 Sandy Bridge（第2代）开始将核显集成到 CPU 封装中，核显和 CPU 核心共用散热通道。从 Linux 4.15 开始，i915 驱动通过 hwmon 接口暴露了 GPU 温度（通过 GPU GT 热区），但这取决于硬件平台和驱动版本。在 10th Gen Comet Lake 及之前的部分平台上，i915 hwmon 接口可能缺失或返回无效值。</p><p>本方案将 CPU Package 温度（coretemp/temp1_input）复用给 GPU 显示，因为两者在同一封装中，温度高度相关，差异通常在 3-5°C 以内。</p><h3>10.2 WebSocket 代理原理</h3><p>FnOS 的前端与后端的 WebSocket 通信使用非标准的 WebSocket 协议（区别于标准 HTTP Upgrade 握手）。在实现中需要注意：</p><ul><li>客户端到代理的帧通常带 mask（masked = true），代理到上游的帧也需要 mask</li><li>上游返回的帧不带 mask（masked = false），代理到客户端也不带 mask</li><li>帧类型 opcode 1 = text, 8 = close</li></ul><h3>10.3 bind-mount 的优势</h3><ul><li>不修改原始文件系统，原始 JS 文件保持原样</li><li>系统更新时，如果原始文件被替换，bind-mount 挂载点变为孤儿挂载，下次重启服务时会自动 umount 并重新挂载</li><li>卸载时只需 umount + 移除 systemd 服务，不留痕迹</li></ul><h3>10.4 为什么有两个 JS 补丁？</h3><p>ResourceMonitor.js 负责资源监控页面的展示逻辑，index.js 是 FnOS 前端 WebSocket 底层通信框架。两个补丁的职责分工：</p><ul><li><strong>ResourceMonitor</strong>：修改 GPU 温度显示条件 + 捕获 CPU 温度 + 回填 GPU 数据</li><li><strong>index.js</strong>：在更低层的 WebSocket 消息处理中注入，确保所有通过 WebSocket 的 GPU 数据都被处理，与框架耦合更深、更可靠</li></ul><h2>十一、常见问题</h2><h3>Q: 补丁后 GPU 温度显示仍为空？</h3><p>检查以下项目：</p><pre># 1. 检查 WebSocket 代理是否运行
ss -lxnp | grep trim_cgi.socket
# 应看到 /run/trim_cgi.socket（代理）和 /run/trim_cgi.socket.orig（上游）

# 2. 检查补丁日志
cat /var/log/fnos-igpu-temp-patch.log
# 确认所有标记都是 "patched" 而非 "missing"

# 3. 检查 CPU 温度获取
cat /sys/class/hwmon/*/name 2>/dev/null | grep coretemp
cat /sys/class/hwmon/*/temp1_input 2>/dev/null
# 应返回一个三位数（如 79000 表示 79.0°C）

# 4. 清除浏览器缓存，或使用无痕模式刷新面板</pre><h3>Q: 补丁后温度值异常（过高或过低）？</h3><p>CPU Package 温度在 30-100°C 为正常范围。如果显示 0 或负值，可能是 hwmon 路径不正确。检查 /sys/class/hwmon 中的传感器列表，调整 fallback 逻辑。</p><h3>Q: FnOS 系统更新后补丁失效？</h3><p>FnOS 更新时前端 JS 文件的哈希值（文件名中的 BacdZkk_ 等字符串）会发生变化。需要重新运行 <code>systemctl restart fnos-igpu-temp-patch.service</code>。如果文件名已变，需要更新脚本中的文件名。</p><h3>Q: 是否支持 AMD 核显？</h3><p>AMD APU（如 4700U、5700G 等）的核显温度可能有独立的 hwmon 接口（amdgpu 驱动），本方案需要适配 AMD 的温度路径。AMD 用户应检查 /sys/class/hwmon 中是否有 amdgpu 相关传感器。</p><h3>Q: 是否影响 FnOS 其他功能？</h3><p>不影响。补丁仅修改资源监控页面的 GPU 温度显示逻辑，不涉及存储、网络、权限管理等核心功能。WebSocket 代理仅透传和修改 GPU 相关数据帧，其他消息完全无感知。</p><h3>Q: 可以还原至原始状态吗？</h3><p>可以。运行 <code>bash /usr/local/sbin/fnos-igpu-temp-unpatch</code> 即可一键卸载，系统恢复至完全原始状态。</p><h2>十二、总结</h2><p>本方案在没有 Intel 独立 GPU 温度传感器的情况下，通过巧妙的 WebSocket 代理 + JS 注入方式，将 CPU 封装温度复用到核显温度显示槽位，使 FnOS 的资源监控更加完整。所有操作通过 bind-mount 实现，不修改系统原始文件，可完整卸载还原。完整的备份和恢复机制保证了方案的可迁移性。</p><p>对于同样使用 FnOS + Intel 核显的用户，只需按照本文步骤操作即可实现核显温度显示。对于其他 Linux 发行版的类似需求，也可以借鉴 WebSocket 代理注入的思路加以适配。`);function zr(){return D(()=>{document.querySelectorAll(".reveal").forEach(e=>e.classList.add("visible")),window.scrollTo(0,0)}),(()=>{var e=Yr(),t=e.firstChild,n=t.firstChild;return g(t,u(k,{href:"/articles",class:"back-link",children:"← 返回文章列表"}),n),e})()}var Zr=w(`<section id=article-detail><div class="article-container reveal"><div class=article-header><h1>OpenClaw 记忆优化实战：Ollama Embedding + memory-core 本地化部署</h1><p class=article-subtitle>Nomic Embed Text · Ollama 容器 · 多 OpenClaw 实例 provider 统一管理 · memory-core 语义搜索</p><div class=article-meta><span class=article-date>2026-06-01</span><div class=article-tags><span class=tech-tag>OpenClaw</span><span class=tech-tag>Ollama</span><span class=tech-tag>FnOS</span><span class=tech-tag>Docker</span><span class=tech-tag>Embedding</span><span class=tech-tag>Memory-Core</span><span class=tech-tag>Nomic</span></div></div></div><div class=article-content><h2>一、缘起：OpenAI 不可用之后</h2><p>OpenClaw 的 <code>memory-core</code> 插件负责对话记忆、语义搜索和 dreaming。默认使用 OpenAI <code>text-embedding-3-small</code> 作为嵌入模型。</p><p>但由于网络限制 + API 配额耗尽，OpenAI 嵌入接口持续返回 503，导致：</p><ul><li>记忆搜索（memory search）不可用</li><li>Dreaming 自动摘要无法写入</li><li>语义向量库（sqlite-vec）无法增量更新</li></ul><p>解决方案：用本地 Ollama 容器中的 <code>nomic-embed-text</code> 模型替代 OpenAI 嵌入服务，单机运行，零费用。</p><h2>二、整体架构</h2><p>本文涉及三个 OpenClaw 实例和一个 Ollama 容器：</p><pre>                          ┌───────────────────┐
                          │  Ollama Container  │
                          │  nomic-embed-text  │
                          │  127.0.0.1:11434   │
                          └────────┬──────────┘
                                   │
               ┌───────────────────┼───────────────────┐
               ▼                   ▼                   ▼
    ┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
    │  TencentOS 本机  │ │ FnOS Docker  │ │ FnOS 商店版      │
    │  del_openclaw_bot│ │del_xiaoxia_bot│ │ del_jinger_bot   │
    └──────────────────┘ └──────────────┘ └──────────────────┘</pre><p>三个独立的 OpenClaw 实例各自连接同一个 Ollama 容器，由 <code>memorySearch</code> 配置统一指向。Ollama 不参与对话推理，仅提供向量化嵌入服务。</p><h2>三、Ollama 容器部署</h2><h3>3.1 Docker Compose</h3><pre>services:
  ollama:
    container_name: ollama
    image: ollama/ollama:0.30.0-rc31
    restart: always
    network_mode: host
    hostname: ollama
    environment:
      - TZ=Asia/Shanghai
      - OLLAMA_KEEP_ALIVE=24h
      - OLLAMA_NUM_PARALLEL=4
      - OLLAMA_MAX_LOADED_MODELS=2
    volumes:
      - ./data:/root/.ollama
    cpus: 2
    mem_limit: 2g</pre><p>注意事项：</p><ul><li><strong>不要挂载 /dev/dri 设备</strong>：Intel 核显在 LLM 推理中反而慢于 CPU，Ollama 0.30 会自动丢弃 iGPU</li><li><strong>CPU 限额设为 2 核足够</strong>：embedding 模型仅 137M 参数，推理极快，单次毫秒级</li><li><strong>内存 2G 足够</strong>：nomic-embed-text 加载仅占 ~300MB</li><li><strong>network_mode: host</strong>：方便其他容器/主机通过 localhost 访问</li><li><strong>cgroup v2 警告</strong>：0.30 版本已修复</li></ul><h3>3.2 拉取嵌入模型</h3><pre># 进入容器
docker exec -it ollama ollama pull nomic-embed-text

# 验证
curl http://127.0.0.1:11434/api/tags
# 输出应包含 nomic-embed-text (274MB, embedding-capable)

# 测试嵌入
curl http://127.0.0.1:11434/api/embed \\
  -d '{"model":"nomic-embed-text","input":["测试消息"]}'
# 输出: embeddings: 1x768</pre><p><code>nomic-embed-text</code> 是一个 137M 参数的 BERT 类模型，输出 768 维向量，完全本地运行，满足语义搜索需求。</p><h2>四、OpenClaw Provider 统一管理</h2><h3>4.1 核心概念</h3><p>OpenClaw 有两层模型配置：</p><ul><li><strong>openclaw.json</strong> → <code>models.providers</code> 是权威配置源</li><li><strong>models.json</strong> → 由 openclaw.json 通过 merge 模式生成的运行时产物</li></ul><p>两个文件的结构是完全一致的，只是存放位置不同。修改时必须同时保持两者同步。</p><h3>4.2 配置 Ollama Provider</h3><p>在 openclaw.json 和 models.json 的 providers 中添加：</p><pre>"ollama": {
  "baseUrl": "http://127.0.0.1:11434/v1",
  "apiKey": "ollama",
  "api": "openai-completions",
  "models": [
    {
      "id": "nomic-embed-text",
      "name": "nomic-embed-text",
      "input": ["text"]
    }
  ]
}</pre><p>注意：</p><ul><li>Ollama 不需要真实 API Key，填入任意占位即可</li><li>baseUrl 使用 <code>/v1</code> 后缀以兼容 OpenAI 接口格式</li><li><code>models</code> 列表填入 nomic-embed-text，使 OpenClaw 能自动发现嵌入模型</li><li>不要加 <code>capabilities</code> 字段——旧版 schema 不识别</li></ul><h3>4.3 memorySearch 配置</h3><p>在 agents.defaults 中配置 memorySearch：</p><pre>"memorySearch": {
  "provider": "ollama",
  "model": "nomic-embed-text"
}</pre><p>显式指定 <code>model</code> 是可选的——memory-core 能自动发现 provider 下的嵌入模型，但显式指定更安全可靠。</p><h3>4.4 不显示在模型切换列表</h3><p>Ollama 只用于嵌入，不应出现在对话模型的切换列表中。做法是不把 ollama/nomic-embed-text 加入 <code>agents.defaults.models</code> allowlist：</p><pre>"models": {
  "longcat-flash/LongCat-2.0-Preview": {},
  "openai/mimo-v2.5-pro": {},
  "openai/mimo-v2.5": {},
  "anthropic/claude-sonnet-4-6": {},
  // ... 不含 ollama
}</pre><p>ollama 保留在 <code>models.providers</code> 中供 embedding 使用，但在 allowlist 中不出现，模型切换器就不会展示它。</p><h2>五、多 OpenClaw 实例统一管理</h2><h3>5.1 实例总结</h3><table><thead><tr><th>实例</th><th>Host</th><th>用户</th><th>Telegram Bot</th><th>端口</th><th>Embedding</th></tr></thead><tbody><tr><td>TencentOS 本机</td><td>TentcentOS</td><td>root</td><td>del_openclaw_bot</td><td>18789</td><td>Ollama (192.168.31.2)</td></tr><tr><td>FnOS Docker</td><td>FnOS</td><td>root (容器内)</td><td>del_xiaoxia_bot</td><td>host 网络</td><td>Ollama (127.0.0.1)</td></tr><tr><td>FnOS 商店版</td><td>FnOS</td><td>trim.openclaw</td><td>del_jinger_bot</td><td>25730 (loopback)</td><td>Ollama (127.0.0.1)</td></tr></tbody></table><h3>5.2 Provider 同步策略</h3><p>多个实例使用同一套 provider 配置时，必须确保：</p><ul><li>两个文件都要改：<code>openclaw.json</code> 中的 <code>models.providers</code></li><li>和 <code>models.json</code> 中的 <code>providers</code></li><li>两个文件顺序也要一致</li></ul><p>推荐做法：先改 openclaw.json，然后</p><pre># Python 同步两文件
import json
with open('openclaw.json') as f:
    cfg = json.load(f)
with open('models.json') as f:
    m = json.load(f)
# 复制 providers 并保持顺序
order = list(cfg['models']['providers'].keys())
m['providers'] = {k: m['providers'][k]
    for k in order if k in m['providers']}
# 补缺失的
for k in order:
    if k not in m['providers']:
        m['providers'][k] = cfg['models']['providers'][k]
with open('models.json', 'w') as f:
    json.dump(m, f, indent=2)</pre><p>注意：不要手动分别编辑两个文件，否则配置会失步导致 Gateway 报 Invalid config。</p><h3>5.3 ollama 地址差异</h3><p>同一个 Ollama 容器在不同实例中地址不同：</p><ul><li><strong>TencentOS 本机</strong>：<code>http://192.168.31.2:11434/v1</code>（跨主机访问）</li><li><strong>FnOS 上实例（Docker/商店版）</strong>：<code>http://127.0.0.1:11434/v1</code>（同机 localhost）</li></ul><p>这是唯一需要区分的地方，其余配置完全一致。</p><h2>六、Telegram 通道问题排查</h2><h3>6.1 代理依赖</h3><p>所有 OpenClaw 实例的 Telegram API 请求都经过代理 <code>192.168.31.10:7890</code>（某内网代理节点）。代理不稳时会表现为：</p><ul><li><code>fetch timeout after 15000ms</code></li><li><code>deleteWebhook failed: Network request failed</code></li><li><code>sendChatAction failed: Network request failed</code></li><li>Bot 看起来"没反应"</li></ul><p>Docker 版和商店版都需要在启动环境中设置代理变量：</p><pre>export http_proxy=http://192.168.31.10:7890
export https_proxy=http://192.168.31.10:7890
export no_proxy=localhost,127.0.0.1,192.168.0.0/16,10.0.0.0/8</pre><h3>6.2 Ingress 队列卡死</h3><p>容器重启时，若 Telegram 消息正在处理，会留下 <code>.json.processing</code> 锁文件阻塞后续所有消息：</p><pre>ingress-spool-default/
├── 0000000220042926.json.processing  ← ⛔ 锁残留
├── 0000000220042927.json             ← 排队等待
├── 0000000220042930.json  ("刚刚回复我了吗")
├── 0000000220042933.json  ("embedding接入成功了吗？")</pre><p>修复方法：删除锁文件即可自动恢复。</p><pre>find /telegram/ingress-spool-default/ \\
  -name '*.processing' -mmin +5 -delete</pre><h2>七、效果验证</h2><p>配置完成后，memory-core 的 embedding 状态从 unavailable 变为 ready：</p><pre>变更前:
  Provider: openai  (requested: openai)
  Model: text-embedding-3-small
  Embeddings: unavailable ❌
  Error: 503 Service Unavailable

变更后:
  Provider: ollama  (requested: ollama)
  Model: nomic-embed-text
  Embeddings: ready ✅</pre><p>此外还可通过 API 直接验证：</p><pre>$ curl http://127.0.0.1:11434/api/embed \\
  -d '{"model":"nomic-embed-text","input":["测试消息"]}'
→ embeddings: 1 x 768</pre><p>768 维向量正确返回，sqlite-vec 语义搜索库即可正常工作。</p><h2>八、总结</h2><p>通过将 OpenAI 嵌入模型替换为本地 Ollama 的 nomic-embed-text，实现了：</p><ul><li><strong>零成本</strong>：完全本地运行，无 API 调用费用</li><li><strong>零延迟</strong>：同机推理，毫秒级返回</li><li><strong>统一管理</strong>：三个 OpenClaw 实例共享同一嵌入服务</li><li><strong>Provider 维护规范</strong>：openclaw.json 与 models.json 保持同步，避免 Invalid config</li><li><strong>高可用</strong>：避免 OpenAI 503 导致记忆服务中断</li></ul><p>同时本文也记录了多 OpenClaw 实例的统一管理模式、Telegram 通道常见问题及修复方法，可作为 FnOS 上 OpenClaw 运维的参考。`);function Jr(){return D(()=>{document.querySelectorAll(".reveal").forEach(e=>e.classList.add("visible")),window.scrollTo(0,0)}),(()=>{var e=Zr(),t=e.firstChild,n=t.firstChild;return g(t,u(k,{href:"/articles",class:"back-link",children:"← 返回文章列表"}),n),e})()}var eo=w(`<section id=article-detail><div class="article-container reveal"><div class=article-header><h1>宝塔插件 OpenClaw 完全指南：安装配置、环境变量优化与 PM2 进程管理</h1><p class=article-subtitle>宝塔软件商店 · 插件面板管理 · 环境变量透传 · PM2 底层运维 · 更新按钮修复</p><div class=article-meta><span class=article-date>2026-06-01</span><div class=article-tags><span class=tech-tag>OpenClaw</span><span class=tech-tag>宝塔面板</span><span class=tech-tag>PM2</span><span class=tech-tag>TencentOS</span><span class=tech-tag>Node.js</span><span class=tech-tag>运维</span></div></div></div><div class=article-content><h2>一、概述</h2><p>OpenClaw 提供多种安装方式。对于国内服务器（TencentOS / CentOS）使用者，最便捷的方式是通过<strong>宝塔软件商店</strong>安装插件版 OpenClaw。</p><p>该方案的特点是：</p><ul><li><strong>宝塔插件面板</strong>：一个功能完整的 Vue 面板，集成在宝塔左侧菜单中</li><li><strong>内置 PM2 管理</strong>：OpenClaw Gateway 由 PM2 守护，自动重启、日志轮转</li><li><strong>更新按钮</strong>：面板内置「检查更新」功能，可一键升级</li><li><strong>备份/恢复</strong>：面板自带一键备份与恢复功能</li><li><strong>技能管理</strong>：支持在线安装/卸载技能（Skills）</li></ul><h2>二、安装后的组件结构</h2><h3>2.1 插件目录</h3><pre>/www/server/panel/plugin/openclaw/
├── index.html           # Vue 编译后的面板前端
├── openclaw_main.py     # Python 后端（宝塔插件接口）
├── install.sh           # 安装脚本
├── info.json            # 插件元信息
├── icon.png
├── rules/               # 安全检测规则
├── data/backup/         # 备份目录
└── clawhub_registry.json</pre><h3>2.2 OpenClaw 核心组件</h3><pre># 全局安装路径（由插件 install.sh 执行 npm i -g openclaw）
/www/server/nvm/versions/node/v24.16.0/lib/node_modules/openclaw/
└── openclaw.mjs      # 入口
└── dist/             # 编译产物
└── CHANGELOG.md      # 版本记录

# 可执行文件
/usr/local/bin/openclaw -> /www/server/nvm/versions/node/v24.16.0/bin/openclaw
  -> ../lib/node_modules/openclaw/openclaw.mjs

# 数据目录
~/.openclaw/
└── openclaw.json     # 核心配置
└── agents/           # Agent 配置
└── workspace/        # 工作区</pre><h3>2.3 PM2 进程管理</h3><p>安装后，Gateway 以 PM2 进程形式运行：</p><pre>$ pm2 list
┌────┬───────────┬──────────┬──────┬──────────┬──────┬───────────┐
│ id │ name      │ version  │ pid  │ uptime   │ ↺    │ status    │
├────┼───────────┼──────────┼──────┼──────────┼──────┼───────────┤
│ 2  │ openclaw  │ 2026.5.…│409876│ 3h       │ 23   │ online    │
└────┴───────────┴──────────┴──────┴──────────┴──────┴───────────┘

$ pm2 show openclaw
script path: .../node_modules/openclaw/dist/index.js
script args: gateway --port 18789</pre><p><strong>注意 restart 计数（↺）</strong>：重启次数过多说明有异常（如配置错误、代理超时等）。</p><h2>三、更新按钮与环境变量优化</h2><h3>3.1 更新按钮的调用链路</h3><p>宝塔插件面板的「检查更新」按钮走的是 <strong>Python 后端 → npm update → PM2 重启</strong> 链路：</p><pre>宝塔面板前端 (Vue)
  → openclaw_main.py (Python)
    → ExecShell("npm update -g openclaw")
      → ExecShell("pm2 restart openclaw")
        → Gateway 使用新版本启动</pre><h3>3.2 更新失败的原因</h3><p>更新按钮可能失效，原因是 npm 更新命令或 PM2 命令缺少正确的<strong>环境变量</strong>：</p><ul><li><code>PATH</code> 中缺少 Node.js 的 bin 目录 → 找不到 npm 命令</li><li>缺少 <code>NVM_BIN</code> / <code>NVM_DIR</code> → npm 找不到全局模块</li><li>PM2 进程环境变量不完整 → Gateway 启动后配置错误</li><li>代理变量未设置 → 无法连接 Telegram API</li></ul><h3>3.3 解决方案</h3><p>需要在 PM2 的 ecosystem 或启动环境中显式设置以下变量：</p><pre># 在 PM2 启动命令或 ecosystem 中配置
export NVM_DIR="/www/server/nvm"
export NVM_BIN="/www/server/nvm/versions/node/v24.16.0/bin"
export PATH="$NVM_BIN:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
export OPENCLAW_GATEWAY_PORT="18789"

# 代理变量（如需 Telegram 等外连通道）
export http_proxy="http://192.168.31.10:7890"
export https_proxy="http://192.168.31.10:7890"
export no_proxy="localhost,127.0.0.1,192.168.0.0/16,10.0.0.0/8"</pre><p>如果使用 PM2 ecosystem 配置文件：</p><pre>module.exports = {
  apps: [{
    name: 'openclaw',
    script: '/www/server/nvm/versions/node/v24.16.0/bin/openclaw',
    args: 'gateway --port 18789',
    cwd: '/root/.openclaw',
    env: {
      OPENCLAW_HIDE_BANNER: '1',
      OPENCLAW_GATEWAY_PORT: '18789',
      NVM_DIR: '/www/server/nvm',
      NVM_BIN: '/www/server/nvm/versions/node/v24.16.0/bin',
      http_proxy: 'http://192.168.31.10:7890',
      https_proxy: 'http://192.168.31.10:7890',
      no_proxy: 'localhost,127.0.0.1,192.168.0.0/16,10.0.0.0/8',
    },
    error_file: '/root/logs/openclaw-error.log',
    out_file: '/root/logs/openclaw-out.log',
    max_restarts: 10,
    min_uptime: '30s',
    restart_delay: 5000,
  }]
};</pre><p>配置后执行：</p><pre>$ pm2 reload openclaw        # 零停机重载
$ pm2 restart openclaw       # 完全重启</pre><h2>四、控制面板优化</h2><h3>4.1 端口与反代</h3><p>Gateway 默认监听 <code>0.0.0.0:18789</code>（LAN 模式）。可通过宝塔面板的「反向代理」功能，将域名绑定到该端口：</p><pre># 宝塔 → 网站 → 添加反向代理
目标 URL: http://127.0.0.1:18789
SSL: 自动申请 Let's Encrypt 证书</pre><p>同时在 openclaw.json 中确保 controlUi 允许跨域来源：</p><pre>"gateway": {
  "port": 18789,
  "bind": "lan",
  "controlUi": {
    "enabled": true,
    "allowedOrigins": ["*"]
  }
}</pre><h3>4.2 安全加固</h3><ul><li><strong>Token 认证</strong>：设置 gateway.auth.token</li><li><strong>设备绑定</strong>：开启设备确认模式</li><li><strong>禁止 IP 直访</strong>：仅允许通过域名 HTTPS 访问控制面板</li></ul><h3>4.3 日志与监控</h3><pre># PM2 日志管理
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 5

# 实时监控
pm2 monit          # 终端实时面板
pm2 show openclaw  # 进程详情

# 查看日志
pm2 logs openclaw --lines 100
pm2 logs openclaw --err          # 仅错误日志</pre><h2>五、常见问题排查</h2><h3>5.1 Gateway 频繁重启（↺ 数字过高）</h3><p>查看 PM2 错误日志：</p><pre>$ tail -50 /root/.pm2/logs/openclaw-error.log</pre><p>常见原因：</p><ul><li><strong>Invalid config</strong>：openclaw.json 或 models.json 包含 schema 不认识的字段</li><li><strong>端口被占用</strong>：18789 被其他进程占用</li><li><strong>models.json 失步</strong>：openclaw.json 和 models.json 的 providers 列表不一致</li><li><strong>代理超时</strong>：Telegram/DingTalk 初始化时 fetch timeout</li></ul><h3>5.2 Telegram 通道无响应</h3><p>国内服务器无法直连 Telegram API，必须配置代理环境变量。在 PM2 ecosystem 中填入正确的 <code>http_proxy</code> 即可。</p><h3>5.3 更新后版本号未变</h3><pre># 清除 npm 缓存重试
npm cache clean --force
npm install -g openclaw@latest

# 强制指定版本
npm install -g openclaw@2026.5.30

# 验证
openclaw --version
pm2 restart openclaw</pre><h2>六、完整运维命令</h2><pre># 进程管理
pm2 list                        # 查看所有进程
pm2 show openclaw               # 进程详情
pm2 restart openclaw            # 重启
pm2 reload openclaw             # 零停机重载
pm2 stop openclaw               # 停止
pm2 delete openclaw             # 删除进程记录

# 日志
pm2 logs openclaw --lines 100   # 最近日志
pm2 logs openclaw --err         # 错误日志

# 更新
npm update -g openclaw          # npm 更新
pm2 restart openclaw            # 应用新版本

# 开机自启
pm2 startup                     # 生成 systemd 单元
pm2 save                        # 保存进程列表

# 资源监控
pm2 monit                       # 实时监控面板

# 宝塔插件接口
/www/server/panel/plugin/openclaw/openclaw_main.py  # Python 后端
/www/server/panel/plugin/openclaw/index.html        # Vue 前端</pre><h2>七、总结</h2><p>宝塔插件版 OpenClaw 提供了一个开箱即用的方案：</p><ul><li>安装即用：宝塔软件商店一键安装，底层 PM2 自动守护</li><li>面板管理：技能安装、模型配置、安全扫描、备份恢复一应俱全</li><li>更新修复：配置正确的环境变量后，面板更新按钮可正常使用</li><li>运维体系：PM2 + npm + 宝塔面板三位一体</li></ul><p>这套方案已在 TencentOS + 宝塔面板 9.x 环境中生产运行，适合国内服务器用户。`);function to(){return D(()=>{document.querySelectorAll(".reveal").forEach(e=>e.classList.add("visible")),window.scrollTo(0,0)}),(()=>{var e=eo(),t=e.firstChild,n=t.firstChild;return g(t,u(k,{href:"/articles",class:"back-link",children:"← 返回文章列表"}),n),e})()}var no=w('<div style="max-width:400px;margin:100px auto;padding:40px 20px"><h1 style=text-align:center;margin-bottom:30px>登录</h1><form><div style=margin-bottom:20px><label style=display:block;margin-bottom:6px>用户名</label><input type=text style="width:100%;padding:10px;background:#1a1a2e;border:1px solid #333;color:#fff;border-radius:6px"></div><div style=margin-bottom:20px><label style=display:block;margin-bottom:6px>密码</label><input type=password style="width:100%;padding:10px;background:#1a1a2e;border:1px solid #333;color:#fff;border-radius:6px"></div><button type=submit style=width:100%;padding:12px;background:#00d4ff;color:#000;border:none;border-radius:6px;font-weight:bold;cursor:pointer>登录'),ro=w("<p style=color:#ff4444;margin-bottom:15px>");function oo(){if(typeof window>"u")return"/";const e=window.location.hash,t=e.indexOf("?");return t===-1?"/":new URLSearchParams(e.slice(t+1)).get("redirect")||"/"}function ao(e){return e.startsWith("http://")||e.startsWith("https://")}function so(){const[e,t]=T("DeltrivX"),[n,o]=T(""),[r,s]=T(""),l=ft(),{login:a}=Me(),i=async c=>{if(c.preventDefault(),s(""),!e().trim()){s("请输入用户名");return}if(await a(e(),n())){const d=oo();ao(d)?(window.open(d,"_blank"),l("/projects",{replace:!0})):d!=="/"?l(d,{replace:!0}):l("/",{replace:!0})}else s("用户名或密码错误，请重试")};return(()=>{var c=no(),p=c.firstChild,d=p.nextSibling,m=d.firstChild,h=m.firstChild,b=h.nextSibling,f=m.nextSibling,v=f.firstChild,_=v.nextSibling,y=f.nextSibling;return d.addEventListener("submit",i),b.$$input=O=>t(O.target.value),_.$$input=O=>o(O.target.value),g(d,(()=>{var O=z(()=>!!r());return()=>O()&&(()=>{var A=ro();return g(A,r),A})()})(),y),N(()=>b.value=e()),N(()=>_.value=n()),c})()}re(["input"]);var lo=w('<div class=content style=display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:70vh;text-align:center><div class=code style="font-size:clamp(6rem, 20vw, 10rem);font-weight:900;background:linear-gradient(135deg, var(--accent-1), var(--accent-2), var(--accent-3));-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1;margin-bottom:1rem">404</div><h1 style=font-size:1.5rem;margin-bottom:0.8rem;font-weight:600>页面未找到</h1><p style=color:var(--text-secondary);margin-bottom:2rem;font-size:1rem;line-height:1.6>你访问的页面不存在或已被移除。<br>别担心，让我们回到正轨。');function io(){return(()=>{var e=lo(),t=e.firstChild,n=t.nextSibling;return n.nextSibling,g(e,u(k,{href:"/",class:"btn btn-primary",children:"🏠 返回首页"}),null),e})()}en(()=>u(Vn,{get children(){return u(qn,{get children(){return u(Gn,{root:lr,get children(){return[u(R,{path:"/",component:()=>[u(L,{children:"Kris | 个人主页"}),u(V,{name:"description",content:"Kris - 全栈开发者、AI探索者、开源贡献者"}),u(Sr,{})]}),u(R,{path:"/about",component:()=>[u(L,{children:"Kris | 关于我"}),u(V,{name:"description",content:"了解 Kris 的背景和经历"}),u(Pr,{})]}),u(R,{path:"/skills",component:()=>[u(L,{children:"Kris | 技能栈"}),u(V,{name:"description",content:"Kris 掌握的技术和工具"}),u(Ir,{})]}),u(R,{path:"/projects",component:()=>[u(L,{children:"Kris | 精选项目"}),u(V,{name:"description",content:"Kris 引以为豪的作品"}),u(Lr,{})]}),u(R,{path:"/articles",component:()=>[u(L,{children:"Kris | 文章"}),u(V,{name:"description",content:"Kris 分享的技术文章与思考"}),u(Wr,{})]}),u(R,{path:"/article/openclaw-baota-pm2",component:()=>[u(L,{children:"Kris | 宝塔插件 OpenClaw 安装配置与运维"}),u(to,{})]}),u(R,{path:"/article/fnos-openclaw-store-optimization",component:()=>[u(L,{children:"Kris | 飞牛系统商店版 OpenClaw 优化实战"}),u(Vr,{})]}),u(R,{path:"/article/homenet-qx",component:()=>[u(L,{children:"Kris | iOS Quantumult X 异地接入内网：HomeNet 双节点实战指南"}),u(Qr,{})]}),u(R,{path:"/article/dual-stack-domain",component:()=>[u(L,{children:"Kris | 双栈域名体系完全指南"}),u(qr,{})]}),u(R,{path:"/article/memory-embed-ollama",component:()=>[u(L,{children:"Kris | OpenClaw 记忆优化：Ollama Embedding + memory-core"}),u(Jr,{})]}),u(R,{path:"/article/fnos-igpu-temp",component:()=>[u(L,{children:"Kris | FnOS 核显温度显示补丁：从原理到实现"}),u(zr,{})]}),u(R,{path:"/login",component:()=>[u(L,{children:"Kris | 登录"}),u(so,{})]}),u(R,{path:"*paramName",component:()=>[u(L,{children:"404 - 页面未找到"}),u(io,{})]})]}})}})}}),document.getElementById("root"));
