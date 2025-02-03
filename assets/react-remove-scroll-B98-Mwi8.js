import{_ as z,a as B,b as j}from"./tslib-CDuPK5Eb.js";import{r as a}from"./react-D5qV_qlN.js";import{f as p,z as K,R as O}from"./react-remove-scroll-bar-ZkbZZSpp.js";import{c as Q,e as _}from"./use-sidecar-Du6JRwds.js";import{u as q}from"./use-callback-ref-BINR6QVg.js";import{s as G}from"./react-style-singleton-CllCdcSB.js";var V=Q(),Y=function(){},X=a.forwardRef(function(e,t){var c=a.useRef(null),l=a.useState({onScrollCapture:Y,onWheelCapture:Y,onTouchMoveCapture:Y}),u=l[0],s=l[1],v=e.forwardProps,o=e.children,m=e.className,g=e.removeScrollBar,w=e.enabled,C=e.shards,y=e.sideCar,b=e.noIsolation,R=e.inert,r=e.allowPinchZoom,n=e.as,f=n===void 0?"div":n,h=e.gapMode,d=z(e,["forwardProps","children","className","removeScrollBar","enabled","shards","sideCar","noIsolation","inert","allowPinchZoom","as","gapMode"]),S=y,i=q([c,t]),E=B(B({},d),u);return a.createElement(a.Fragment,null,w&&a.createElement(S,{sideCar:V,removeScrollBar:g,shards:C,noIsolation:b,inert:R,setCallbacks:s,allowPinchZoom:!!r,lockRef:c,gapMode:h}),v?a.cloneElement(a.Children.only(o),B(B({},E),{ref:i})):a.createElement(f,B({},E,{className:m,ref:i}),o))});X.defaultProps={enabled:!0,removeScrollBar:!0,inert:!1};X.classNames={fullWidth:p,zeroRight:K};var D=!1;if(typeof window<"u")try{var N=Object.defineProperty({},"passive",{get:function(){return D=!0,!0}});window.addEventListener("test",N,N),window.removeEventListener("test",N,N)}catch{D=!1}var k=D?{passive:!1}:!1,J=function(e){return e.tagName==="TEXTAREA"},Z=function(e,t){if(!(e instanceof Element))return!1;var c=window.getComputedStyle(e);return c[t]!=="hidden"&&!(c.overflowY===c.overflowX&&!J(e)&&c[t]==="visible")},U=function(e){return Z(e,"overflowY")},$=function(e){return Z(e,"overflowX")},I=function(e,t){var c=t.ownerDocument,l=t;do{typeof ShadowRoot<"u"&&l instanceof ShadowRoot&&(l=l.host);var u=F(e,l);if(u){var s=x(e,l),v=s[1],o=s[2];if(v>o)return!0}l=l.parentNode}while(l&&l!==c.body);return!1},ee=function(e){var t=e.scrollTop,c=e.scrollHeight,l=e.clientHeight;return[t,c,l]},re=function(e){var t=e.scrollLeft,c=e.scrollWidth,l=e.clientWidth;return[t,c,l]},F=function(e,t){return e==="v"?U(t):$(t)},x=function(e,t){return e==="v"?ee(t):re(t)},te=function(e,t){return e==="h"&&t==="rtl"?-1:1},ae=function(e,t,c,l,u){var s=te(e,window.getComputedStyle(t).direction),v=s*l,o=c.target,m=t.contains(o),g=!1,w=v>0,C=0,y=0;do{var b=x(e,o),R=b[0],r=b[1],n=b[2],f=r-n-s*R;(R||f)&&F(e,o)&&(C+=f,y+=R),o instanceof ShadowRoot?o=o.host:o=o.parentNode}while(!m&&o!==document.body||m&&(t.contains(o)||t===o));return(w&&(Math.abs(C)<1||!u)||!w&&(Math.abs(y)<1||!u))&&(g=!0),g},T=function(e){return"changedTouches"in e?[e.changedTouches[0].clientX,e.changedTouches[0].clientY]:[0,0]},A=function(e){return[e.deltaX,e.deltaY]},H=function(e){return e&&"current"in e?e.current:e},ne=function(e,t){return e[0]===t[0]&&e[1]===t[1]},le=function(e){return`
  .block-interactivity-`.concat(e,` {pointer-events: none;}
  .allow-interactivity-`).concat(e,` {pointer-events: all;}
`)},oe=0,P=[];function ce(e){var t=a.useRef([]),c=a.useRef([0,0]),l=a.useRef(),u=a.useState(oe++)[0],s=a.useState(G)[0],v=a.useRef(e);a.useEffect(function(){v.current=e},[e]),a.useEffect(function(){if(e.inert){document.body.classList.add("block-interactivity-".concat(u));var r=j([e.lockRef.current],(e.shards||[]).map(H),!0).filter(Boolean);return r.forEach(function(n){return n.classList.add("allow-interactivity-".concat(u))}),function(){document.body.classList.remove("block-interactivity-".concat(u)),r.forEach(function(n){return n.classList.remove("allow-interactivity-".concat(u))})}}},[e.inert,e.lockRef.current,e.shards]);var o=a.useCallback(function(r,n){if("touches"in r&&r.touches.length===2||r.type==="wheel"&&r.ctrlKey)return!v.current.allowPinchZoom;var f=T(r),h=c.current,d="deltaX"in r?r.deltaX:h[0]-f[0],S="deltaY"in r?r.deltaY:h[1]-f[1],i,E=r.target,M=Math.abs(d)>Math.abs(S)?"h":"v";if("touches"in r&&M==="h"&&E.type==="range")return!1;var L=I(M,E);if(!L)return!0;if(L?i=M:(i=M==="v"?"h":"v",L=I(M,E)),!L)return!1;if(!l.current&&"changedTouches"in r&&(d||S)&&(l.current=i),!i)return!0;var W=l.current||i;return ae(W,n,r,W==="h"?d:S,!0)},[]),m=a.useCallback(function(r){var n=r;if(!(!P.length||P[P.length-1]!==s)){var f="deltaY"in n?A(n):T(n),h=t.current.filter(function(i){return i.name===n.type&&(i.target===n.target||n.target===i.shadowParent)&&ne(i.delta,f)})[0];if(h&&h.should){n.cancelable&&n.preventDefault();return}if(!h){var d=(v.current.shards||[]).map(H).filter(Boolean).filter(function(i){return i.contains(n.target)}),S=d.length>0?o(n,d[0]):!v.current.noIsolation;S&&n.cancelable&&n.preventDefault()}}},[]),g=a.useCallback(function(r,n,f,h){var d={name:r,delta:n,target:f,should:h,shadowParent:ie(f)};t.current.push(d),setTimeout(function(){t.current=t.current.filter(function(S){return S!==d})},1)},[]),w=a.useCallback(function(r){c.current=T(r),l.current=void 0},[]),C=a.useCallback(function(r){g(r.type,A(r),r.target,o(r,e.lockRef.current))},[]),y=a.useCallback(function(r){g(r.type,T(r),r.target,o(r,e.lockRef.current))},[]);a.useEffect(function(){return P.push(s),e.setCallbacks({onScrollCapture:C,onWheelCapture:C,onTouchMoveCapture:y}),document.addEventListener("wheel",m,k),document.addEventListener("touchmove",m,k),document.addEventListener("touchstart",w,k),function(){P=P.filter(function(r){return r!==s}),document.removeEventListener("wheel",m,k),document.removeEventListener("touchmove",m,k),document.removeEventListener("touchstart",w,k)}},[]);var b=e.removeScrollBar,R=e.inert;return a.createElement(a.Fragment,null,R?a.createElement(s,{styles:le(u)}):null,b?a.createElement(O,{gapMode:e.gapMode}):null)}function ie(e){for(var t=null;e!==null;)e instanceof ShadowRoot&&(t=e.host,e=e.host),e=e.parentNode;return t}const ue=_(V,ce);var se=a.forwardRef(function(e,t){return a.createElement(X,B({},e,{ref:t,sideCar:ue}))});se.classNames=X.classNames;export{se as R};
