import{g as h}from"./@transloadit-9E5jGfYO.js";var m=function(){var f={},e=f._fns={};f.emit=function(t,a,r,o,n,c,s){var u=l(t);u.length&&g(t,u,[a,r,o,n,c,s])},f.on=function(t,a){e[t]||(e[t]=[]),e[t].push(a)},f.once=function(t,a){function r(){a.apply(this,arguments),f.off(t,r)}this.on(t,r)},f.off=function(t,a){var r=[];if(t&&a){var o=this._fns[t],n=0,c=o?o.length:0;for(n;n<c;n++)o[n]!==a&&r.push(o[n])}r.length?this._fns[t]=r:delete this._fns[t]};function l(i){var t=e[i]?e[i]:[],a=i.indexOf(":"),r=a===-1?[i]:[i.substring(0,a),i.substring(a+1)],o=Object.keys(e),n=0,c=o.length;for(n;n<c;n++){var s=o[n];if(s==="*"&&(t=t.concat(e[s])),r.length===2&&r[0]===s){t=t.concat(e[s]);break}}return t}function g(i,t,a){var r=0,o=t.length;for(r;r<o&&t[r];r++)t[r].event=i,t[r].apply(t[r],a)}return f};const b=h(m);export{b as e};
