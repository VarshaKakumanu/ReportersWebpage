var i=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function f(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var u=function(t){if(typeof t!="number"||Number.isNaN(t))throw new TypeError(`Expected a number, got ${typeof t}`);const l=t<0;let o=Math.abs(t);if(l&&(o=-o),o===0)return"0 B";const r=["B","KB","MB","GB","TB","PB","EB","ZB","YB"],a=Math.min(Math.floor(Math.log(o)/Math.log(1024)),r.length-1),n=Number(o/1024**a),s=r[a];return`${n>=10||n%1===0?Math.round(n):n.toFixed(1)} ${s}`};const d=f(u);export{i as c,f as g,d as p};
