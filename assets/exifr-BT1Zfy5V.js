function f(n,t,e){return t in n?Object.defineProperty(n,t,{value:e,enumerable:!0,configurable:!0,writable:!0}):n[t]=e,n}var Z=typeof self<"u"?self:global;const v=typeof navigator<"u",ht=v&&typeof HTMLImageElement>"u",R=!(typeof global>"u"||typeof process>"u"||!process.versions||!process.versions.node),tt=Z.Buffer,et=!!tt,ft=n=>n!==void 0;function it(n){return n===void 0||(n instanceof Map?n.size===0:Object.values(n).filter(ft).length===0)}function c(n){let t=new Error(n);throw delete t.stack,t}function W(n){let t=function(e){let i=0;return e.ifd0.enabled&&(i+=1024),e.exif.enabled&&(i+=2048),e.makerNote&&(i+=2048),e.userComment&&(i+=1024),e.gps.enabled&&(i+=512),e.interop.enabled&&(i+=100),e.ifd1.enabled&&(i+=1024),i+2048}(n);return n.jfif.enabled&&(t+=50),n.xmp.enabled&&(t+=2e4),n.iptc.enabled&&(t+=14e3),n.icc.enabled&&(t+=6e3),t}const L=n=>String.fromCharCode.apply(null,n),X=typeof TextDecoder<"u"?new TextDecoder("utf-8"):void 0;class y{static from(t,e){return t instanceof this&&t.le===e?t:new y(t,void 0,void 0,e)}constructor(t,e=0,i,s){if(typeof s=="boolean"&&(this.le=s),Array.isArray(t)&&(t=new Uint8Array(t)),t===0)this.byteOffset=0,this.byteLength=0;else if(t instanceof ArrayBuffer){i===void 0&&(i=t.byteLength-e);let r=new DataView(t,e,i);this._swapDataView(r)}else if(t instanceof Uint8Array||t instanceof DataView||t instanceof y){i===void 0&&(i=t.byteLength-e),(e+=t.byteOffset)+i>t.byteOffset+t.byteLength&&c("Creating view outside of available memory in ArrayBuffer");let r=new DataView(t.buffer,e,i);this._swapDataView(r)}else if(typeof t=="number"){let r=new DataView(new ArrayBuffer(t));this._swapDataView(r)}else c("Invalid input argument for BufferView: "+t)}_swapArrayBuffer(t){this._swapDataView(new DataView(t))}_swapBuffer(t){this._swapDataView(new DataView(t.buffer,t.byteOffset,t.byteLength))}_swapDataView(t){this.dataView=t,this.buffer=t.buffer,this.byteOffset=t.byteOffset,this.byteLength=t.byteLength}_lengthToEnd(t){return this.byteLength-t}set(t,e,i=y){return t instanceof DataView||t instanceof y?t=new Uint8Array(t.buffer,t.byteOffset,t.byteLength):t instanceof ArrayBuffer&&(t=new Uint8Array(t)),t instanceof Uint8Array||c("BufferView.set(): Invalid data argument."),this.toUint8().set(t,e),new i(this,e,t.byteLength)}subarray(t,e){return e=e||this._lengthToEnd(t),new y(this,t,e)}toUint8(){return new Uint8Array(this.buffer,this.byteOffset,this.byteLength)}getUint8Array(t,e){return new Uint8Array(this.buffer,this.byteOffset+t,e)}getString(t=0,e=this.byteLength){return s=this.getUint8Array(t,e),X?X.decode(s):et?Buffer.from(s).toString("utf8"):decodeURIComponent(escape(L(s)));var s}getLatin1String(t=0,e=this.byteLength){let i=this.getUint8Array(t,e);return L(i)}getUnicodeString(t=0,e=this.byteLength){const i=[];for(let s=0;s<e&&t+s<this.byteLength;s+=2)i.push(this.getUint16(t+s));return L(i)}getInt8(t){return this.dataView.getInt8(t)}getUint8(t){return this.dataView.getUint8(t)}getInt16(t,e=this.le){return this.dataView.getInt16(t,e)}getInt32(t,e=this.le){return this.dataView.getInt32(t,e)}getUint16(t,e=this.le){return this.dataView.getUint16(t,e)}getUint32(t,e=this.le){return this.dataView.getUint32(t,e)}getFloat32(t,e=this.le){return this.dataView.getFloat32(t,e)}getFloat64(t,e=this.le){return this.dataView.getFloat64(t,e)}getFloat(t,e=this.le){return this.dataView.getFloat32(t,e)}getDouble(t,e=this.le){return this.dataView.getFloat64(t,e)}getUintBytes(t,e,i){switch(e){case 1:return this.getUint8(t,i);case 2:return this.getUint16(t,i);case 4:return this.getUint32(t,i);case 8:return this.getUint64&&this.getUint64(t,i)}}getUint(t,e,i){switch(e){case 8:return this.getUint8(t,i);case 16:return this.getUint16(t,i);case 32:return this.getUint32(t,i);case 64:return this.getUint64&&this.getUint64(t,i)}}toString(t){return this.dataView.toString(t,this.constructor.name)}ensureChunk(){}}function z(n,t){c(`${n} '${t}' was not loaded, try using full build of exifr.`)}class M extends Map{constructor(t){super(),this.kind=t}get(t,e){return this.has(t)||z(this.kind,t),e&&(t in e||function(i,s){c(`Unknown ${i} '${s}'.`)}(this.kind,t),e[t].enabled||z(this.kind,t)),super.get(t)}keyList(){return Array.from(this.keys())}}var st=new M("file parser"),m=new M("segment parser"),N=new M("file reader");let lt=Z.fetch;function H(n,t){return(e=n).startsWith("data:")||e.length>1e4?P(n,t,"base64"):R&&n.includes("://")?F(n,t,"url",K):R?P(n,t,"fs"):v?F(n,t,"url",K):void c("Invalid input argument");var e}async function F(n,t,e,i){return N.has(e)?P(n,t,e):i?async function(s,r){let a=await r(s);return new y(a)}(n,i):void c(`Parser ${e} is not loaded`)}async function P(n,t,e){let i=new(N.get(e))(n,t);return await i.read(),i}const K=n=>lt(n).then(t=>t.arrayBuffer()),j=n=>new Promise((t,e)=>{let i=new FileReader;i.onloadend=()=>t(i.result||new ArrayBuffer),i.onerror=e,i.readAsArrayBuffer(n)}),D=new Map,ot=new Map,ut=new Map,A=["chunked","firstChunkSize","firstChunkSizeNode","firstChunkSizeBrowser","chunkSize","chunkLimit"],nt=["jfif","xmp","icc","iptc","ihdr"],E=["tiff",...nt],d=["ifd0","ifd1","exif","gps","interop"],x=[...E,...d],C=["makerNote","userComment"],rt=["translateKeys","translateValues","reviveValues","multiSegment"],I=[...rt,"sanitize","mergeOutput","silentErrors"];class at{get translate(){return this.translateKeys||this.translateValues||this.reviveValues}}class k extends at{get needed(){return this.enabled||this.deps.size>0}constructor(t,e,i,s){if(super(),f(this,"enabled",!1),f(this,"skip",new Set),f(this,"pick",new Set),f(this,"deps",new Set),f(this,"translateKeys",!1),f(this,"translateValues",!1),f(this,"reviveValues",!1),this.key=t,this.enabled=e,this.parse=this.enabled,this.applyInheritables(s),this.canBeFiltered=d.includes(t),this.canBeFiltered&&(this.dict=D.get(t)),i!==void 0)if(Array.isArray(i))this.parse=this.enabled=!0,this.canBeFiltered&&i.length>0&&this.translateTagSet(i,this.pick);else if(typeof i=="object"){if(this.enabled=!0,this.parse=i.parse!==!1,this.canBeFiltered){let{pick:r,skip:a}=i;r&&r.length>0&&this.translateTagSet(r,this.pick),a&&a.length>0&&this.translateTagSet(a,this.skip)}this.applyInheritables(i)}else i===!0||i===!1?this.parse=this.enabled=i:c(`Invalid options argument: ${i}`)}applyInheritables(t){let e,i;for(e of rt)i=t[e],i!==void 0&&(this[e]=i)}translateTagSet(t,e){if(this.dict){let i,s,{tagKeys:r,tagValues:a}=this.dict;for(i of t)typeof i=="string"?(s=a.indexOf(i),s===-1&&(s=r.indexOf(Number(i))),s!==-1&&e.add(Number(r[s]))):e.add(i)}else for(let i of t)e.add(i)}finalizeFilters(){!this.enabled&&this.deps.size>0?(this.enabled=!0,V(this.pick,this.deps)):this.enabled&&this.pick.size>0&&V(this.pick,this.deps)}}var g={jfif:!1,tiff:!0,xmp:!1,icc:!1,iptc:!1,ifd0:!0,ifd1:!1,exif:!0,gps:!0,interop:!1,ihdr:void 0,makerNote:!1,userComment:!1,multiSegment:!1,skip:[],pick:[],translateKeys:!0,translateValues:!0,reviveValues:!0,sanitize:!0,mergeOutput:!0,silentErrors:!0,chunked:!0,firstChunkSize:void 0,firstChunkSizeNode:512,firstChunkSizeBrowser:65536,chunkSize:65536,chunkLimit:5},Y=new Map;class $ extends at{static useCached(t){let e=Y.get(t);return e!==void 0||(e=new this(t),Y.set(t,e)),e}constructor(t){super(),t===!0?this.setupFromTrue():t===void 0?this.setupFromUndefined():Array.isArray(t)?this.setupFromArray(t):typeof t=="object"?this.setupFromObject(t):c(`Invalid options argument ${t}`),this.firstChunkSize===void 0&&(this.firstChunkSize=v?this.firstChunkSizeBrowser:this.firstChunkSizeNode),this.mergeOutput&&(this.ifd1.enabled=!1),this.filterNestedSegmentTags(),this.traverseTiffDependencyTree(),this.checkLoadedPlugins()}setupFromUndefined(){let t;for(t of A)this[t]=g[t];for(t of I)this[t]=g[t];for(t of C)this[t]=g[t];for(t of x)this[t]=new k(t,g[t],void 0,this)}setupFromTrue(){let t;for(t of A)this[t]=g[t];for(t of I)this[t]=g[t];for(t of C)this[t]=!0;for(t of x)this[t]=new k(t,!0,void 0,this)}setupFromArray(t){let e;for(e of A)this[e]=g[e];for(e of I)this[e]=g[e];for(e of C)this[e]=g[e];for(e of x)this[e]=new k(e,!1,void 0,this);this.setupGlobalFilters(t,void 0,d)}setupFromObject(t){let e;for(e of(d.ifd0=d.ifd0||d.image,d.ifd1=d.ifd1||d.thumbnail,Object.assign(this,t),A))this[e]=B(t[e],g[e]);for(e of I)this[e]=B(t[e],g[e]);for(e of C)this[e]=B(t[e],g[e]);for(e of E)this[e]=new k(e,g[e],t[e],this);for(e of d)this[e]=new k(e,g[e],t[e],this.tiff);this.setupGlobalFilters(t.pick,t.skip,d,x),t.tiff===!0?this.batchEnableWithBool(d,!0):t.tiff===!1?this.batchEnableWithUserValue(d,t):Array.isArray(t.tiff)?this.setupGlobalFilters(t.tiff,void 0,d):typeof t.tiff=="object"&&this.setupGlobalFilters(t.tiff.pick,t.tiff.skip,d)}batchEnableWithBool(t,e){for(let i of t)this[i].enabled=e}batchEnableWithUserValue(t,e){for(let i of t){let s=e[i];this[i].enabled=s!==!1&&s!==void 0}}setupGlobalFilters(t,e,i,s=i){if(t&&t.length){for(let a of s)this[a].enabled=!1;let r=G(t,i);for(let[a,h]of r)V(this[a].pick,h),this[a].enabled=!0}else if(e&&e.length){let r=G(e,i);for(let[a,h]of r)V(this[a].skip,h)}}filterNestedSegmentTags(){let{ifd0:t,exif:e,xmp:i,iptc:s,icc:r}=this;this.makerNote?e.deps.add(37500):e.skip.add(37500),this.userComment?e.deps.add(37510):e.skip.add(37510),i.enabled||t.skip.add(700),s.enabled||t.skip.add(33723),r.enabled||t.skip.add(34675)}traverseTiffDependencyTree(){let{ifd0:t,exif:e,gps:i,interop:s}=this;s.needed&&(e.deps.add(40965),t.deps.add(40965)),e.needed&&t.deps.add(34665),i.needed&&t.deps.add(34853),this.tiff.enabled=d.some(r=>this[r].enabled===!0)||this.makerNote||this.userComment;for(let r of d)this[r].finalizeFilters()}get onlyTiff(){return!nt.map(t=>this[t].enabled).some(t=>t===!0)&&this.tiff.enabled}checkLoadedPlugins(){for(let t of E)this[t].enabled&&!m.has(t)&&z("segment parser",t)}}function G(n,t){let e,i,s,r,a=[];for(s of t){for(r of(e=D.get(s),i=[],e))(n.includes(r[0])||n.includes(r[1]))&&i.push(r[0]);i.length&&a.push([s,i])}return a}function B(n,t){return n!==void 0?n:t!==void 0?t:void 0}function V(n,t){for(let e of t)n.add(e)}f($,"default",g);class dt{constructor(t){f(this,"parsers",{}),f(this,"output",{}),f(this,"errors",[]),f(this,"pushToErrors",e=>this.errors.push(e)),this.options=$.useCached(t)}async read(t){this.file=await function(e,i){return typeof e=="string"?H(e,i):v&&!ht&&e instanceof HTMLImageElement?H(e.src,i):e instanceof Uint8Array||e instanceof ArrayBuffer||e instanceof DataView?new y(e):v&&e instanceof Blob?F(e,i,"blob",j):void c("Invalid input argument")}(t,this.options)}setup(){if(this.fileParser)return;let{file:t}=this,e=t.getUint16(0);for(let[i,s]of st)if(s.canHandle(t,e))return this.fileParser=new s(this.options,this.file,this.parsers),t[i]=!0;this.file.close&&this.file.close(),c("Unknown file format")}async parse(){let{output:t,errors:e}=this;return this.setup(),this.options.silentErrors?(await this.executeParsers().catch(this.pushToErrors),e.push(...this.fileParser.errors)):await this.executeParsers(),this.file.close&&this.file.close(),this.options.silentErrors&&e.length>0&&(t.errors=e),it(i=t)?void 0:i;var i}async executeParsers(){let{output:t}=this;await this.fileParser.parse();let e=Object.values(this.parsers).map(async i=>{let s=await i.parse();i.assignToOutput(t,s)});this.options.silentErrors&&(e=e.map(i=>i.catch(this.pushToErrors))),await Promise.all(e)}async extractThumbnail(){this.setup();let{options:t,file:e}=this,i=m.get("tiff",t);var s;if(e.tiff?s={start:0,type:"tiff"}:e.jpeg&&(s=await this.fileParser.getOrFindSegment("tiff")),s===void 0)return;let r=await this.fileParser.ensureSegmentChunk(s),a=this.parsers.tiff=new i(r,t,e),h=await a.extractThumbnail();return e.close&&e.close(),h}}class w{static findPosition(t,e){let i=t.getUint16(e+2)+2,s=typeof this.headerLength=="function"?this.headerLength(t,e,i):this.headerLength,r=e+s,a=i-s;return{offset:e,length:i,headerLength:s,start:r,size:a,end:r+a}}static parse(t,e={}){return new this(t,new $({[this.type]:e}),t).parse()}normalizeInput(t){return t instanceof y?t:new y(t)}constructor(t,e={},i){f(this,"errors",[]),f(this,"raw",new Map),f(this,"handleError",s=>{if(!this.options.silentErrors)throw s;this.errors.push(s.message)}),this.chunk=this.normalizeInput(t),this.file=i,this.type=this.constructor.type,this.globalOptions=this.options=e,this.localOptions=e[this.type],this.canTranslate=this.localOptions&&this.localOptions.translate}translate(){this.canTranslate&&(this.translated=this.translateBlock(this.raw,this.type))}get output(){return this.translated?this.translated:this.raw?Object.fromEntries(this.raw):void 0}translateBlock(t,e){let i=ut.get(e),s=ot.get(e),r=D.get(e),a=this.options[e],h=a.reviveValues&&!!i,o=a.translateValues&&!!s,l=a.translateKeys&&!!r,u={};for(let[p,b]of t)h&&i.has(p)?b=i.get(p)(b):o&&s.has(p)&&(b=this.translateValue(b,s.get(p))),l&&r.has(p)&&(p=r.get(p)||p),u[p]=b;return u}translateValue(t,e){return e[t]||e.DEFAULT||t}assignToOutput(t,e){this.assignObjectToOutput(t,this.constructor.type,e)}assignObjectToOutput(t,e,i){if(this.globalOptions.mergeOutput)return Object.assign(t,i);t[e]?Object.assign(t[e],i):t[e]=i}}f(w,"headerLength",4),f(w,"type",void 0),f(w,"multiSegment",!1),f(w,"canHandle",()=>!1);function ct(n){return n===192||n===194||n===196||n===219||n===221||n===218||n===254}function pt(n){return n>=224&&n<=239}function gt(n,t,e){for(let[i,s]of m)if(s.canHandle(n,t,e))return i}class J extends class{constructor(t,e,i){f(this,"errors",[]),f(this,"ensureSegmentChunk",async s=>{let r=s.start,a=s.size||65536;if(this.file.chunked)if(this.file.available(r,a))s.chunk=this.file.subarray(r,a);else try{s.chunk=await this.file.readChunk(r,a)}catch(h){c(`Couldn't read segment: ${JSON.stringify(s)}. ${h.message}`)}else this.file.byteLength>r+a?s.chunk=this.file.subarray(r,a):s.size===void 0?s.chunk=this.file.subarray(r):c("Segment unreachable: "+JSON.stringify(s));return s.chunk}),this.extendOptions&&this.extendOptions(t),this.options=t,this.file=e,this.parsers=i}injectSegment(t,e){this.options[t].enabled&&this.createParser(t,e)}createParser(t,e){let i=new(m.get(t))(e,this.options,this.file);return this.parsers[t]=i}createParsers(t){for(let e of t){let{type:i,chunk:s}=e,r=this.options[i];if(r&&r.enabled){let a=this.parsers[i];a&&a.append||a||this.createParser(i,s)}}}async readSegments(t){let e=t.map(this.ensureSegmentChunk);await Promise.all(e)}}{constructor(...t){super(...t),f(this,"appSegments",[]),f(this,"jpegSegments",[]),f(this,"unknownSegments",[])}static canHandle(t,e){return e===65496}async parse(){await this.findAppSegments(),await this.readSegments(this.appSegments),this.mergeMultiSegments(),this.createParsers(this.mergedAppSegments||this.appSegments)}setupSegmentFinderArgs(t){t===!0?(this.findAll=!0,this.wanted=new Set(m.keyList())):(t=t===void 0?m.keyList().filter(e=>this.options[e].enabled):t.filter(e=>this.options[e].enabled&&m.has(e)),this.findAll=!1,this.remaining=new Set(t),this.wanted=new Set(t)),this.unfinishedMultiSegment=!1}async findAppSegments(t=0,e){this.setupSegmentFinderArgs(e);let{file:i,findAll:s,wanted:r,remaining:a}=this;if(!s&&this.file.chunked&&(s=Array.from(r).some(h=>{let o=m.get(h),l=this.options[h];return o.multiSegment&&l.multiSegment}),s&&await this.file.readWhole()),t=this.findAppSegmentsInRange(t,i.byteLength),!this.options.onlyTiff&&i.chunked){let h=!1;for(;a.size>0&&!h&&(i.canReadNextChunk||this.unfinishedMultiSegment);){let{nextChunkOffset:o}=i,l=this.appSegments.some(u=>!this.file.available(u.offset||u.start,u.length||u.size));if(h=t>o&&!l?!await i.readNextChunk(t):!await i.readNextChunk(o),(t=this.findAppSegmentsInRange(t,i.byteLength))===void 0)return}}}findAppSegmentsInRange(t,e){e-=2;let i,s,r,a,h,o,{file:l,findAll:u,wanted:p,remaining:b,options:U}=this;for(;t<e;t++)if(l.getUint8(t)===255){if(i=l.getUint8(t+1),pt(i)){if(s=l.getUint16(t+2),r=gt(l,t,s),r&&p.has(r)&&(a=m.get(r),h=a.findPosition(l,t),o=U[r],h.type=r,this.appSegments.push(h),!u&&(a.multiSegment&&o.multiSegment?(this.unfinishedMultiSegment=h.chunkNumber<h.chunkCount,this.unfinishedMultiSegment||b.delete(r)):b.delete(r),b.size===0)))break;U.recordUnknownSegments&&(h=w.findPosition(l,t),h.marker=i,this.unknownSegments.push(h)),t+=s+1}else if(ct(i)){if(s=l.getUint16(t+2),i===218&&U.stopAfterSos!==!1)return;U.recordJpegSegments&&this.jpegSegments.push({offset:t,length:s,marker:i}),t+=s+1}}return t}mergeMultiSegments(){if(!this.appSegments.some(e=>e.multiSegment))return;let t=function(e,i){let s,r,a,h=new Map;for(let o=0;o<e.length;o++)s=e[o],r=s[i],h.has(r)?a=h.get(r):h.set(r,a=[]),a.push(s);return Array.from(h)}(this.appSegments,"type");this.mergedAppSegments=t.map(([e,i])=>{let s=m.get(e,this.options);return s.handleMultiSegments?{type:e,chunk:s.handleMultiSegments(i)}:i[0]})}getSegment(t){return this.appSegments.find(e=>e.type===t)}async getOrFindSegment(t){let e=this.getSegment(t);return e===void 0&&(await this.findAppSegments(0,[t]),e=this.getSegment(t)),e}}f(J,"type","jpeg"),st.set("jpeg",J);const mt=[void 0,1,1,2,4,8,1,1,2,4,8,4,8,4];class yt extends w{parseHeader(){var t=this.chunk.getUint16();t===18761?this.le=!0:t===19789&&(this.le=!1),this.chunk.le=this.le,this.headerParsed=!0}parseTags(t,e,i=new Map){let{pick:s,skip:r}=this.options[e];s=new Set(s);let a=s.size>0,h=r.size===0,o=this.chunk.getUint16(t);t+=2;for(let l=0;l<o;l++){let u=this.chunk.getUint16(t);if(a){if(s.has(u)&&(i.set(u,this.parseTag(t,u,e)),s.delete(u),s.size===0))break}else!h&&r.has(u)||i.set(u,this.parseTag(t,u,e));t+=12}return i}parseTag(t,e,i){let{chunk:s}=this,r=s.getUint16(t+2),a=s.getUint32(t+4),h=mt[r];if(h*a<=4?t+=8:t=s.getUint32(t+8),(r<1||r>13)&&c(`Invalid TIFF value type. block: ${i.toUpperCase()}, tag: ${e.toString(16)}, type: ${r}, offset ${t}`),t>s.byteLength&&c(`Invalid TIFF value offset. block: ${i.toUpperCase()}, tag: ${e.toString(16)}, type: ${r}, offset ${t} is outside of chunk size ${s.byteLength}`),r===1)return s.getUint8Array(t,a);if(r===2)return(o=function(l){for(;l.endsWith("\0");)l=l.slice(0,-1);return l}(o=s.getString(t,a)).trim())===""?void 0:o;var o;if(r===7)return s.getUint8Array(t,a);if(a===1)return this.parseTagValue(r,t);{let l=new(function(p){switch(p){case 1:return Uint8Array;case 3:return Uint16Array;case 4:return Uint32Array;case 5:return Array;case 6:return Int8Array;case 8:return Int16Array;case 9:return Int32Array;case 10:return Array;case 11:return Float32Array;case 12:return Float64Array;default:return Array}}(r))(a),u=h;for(let p=0;p<a;p++)l[p]=this.parseTagValue(r,t),t+=u;return l}}parseTagValue(t,e){let{chunk:i}=this;switch(t){case 1:return i.getUint8(e);case 3:return i.getUint16(e);case 4:return i.getUint32(e);case 5:return i.getUint32(e)/i.getUint32(e+4);case 6:return i.getInt8(e);case 8:return i.getInt16(e);case 9:return i.getInt32(e);case 10:return i.getInt32(e)/i.getInt32(e+4);case 11:return i.getFloat(e);case 12:return i.getDouble(e);case 13:return i.getUint32(e);default:c(`Invalid tiff type ${t}`)}}}class T extends yt{static canHandle(t,e){return t.getUint8(e+1)===225&&t.getUint32(e+4)===1165519206&&t.getUint16(e+8)===0}async parse(){this.parseHeader();let{options:t}=this;return t.ifd0.enabled&&await this.parseIfd0Block(),t.exif.enabled&&await this.safeParse("parseExifBlock"),t.gps.enabled&&await this.safeParse("parseGpsBlock"),t.interop.enabled&&await this.safeParse("parseInteropBlock"),t.ifd1.enabled&&await this.safeParse("parseThumbnailBlock"),this.createOutput()}safeParse(t){let e=this[t]();return e.catch!==void 0&&(e=e.catch(this.handleError)),e}findIfd0Offset(){this.ifd0Offset===void 0&&(this.ifd0Offset=this.chunk.getUint32(4))}findIfd1Offset(){if(this.ifd1Offset===void 0){this.findIfd0Offset();let t=this.chunk.getUint16(this.ifd0Offset),e=this.ifd0Offset+2+12*t;this.ifd1Offset=this.chunk.getUint32(e)}}parseBlock(t,e){let i=new Map;return this[e]=i,this.parseTags(t,e,i),i}async parseIfd0Block(){if(this.ifd0)return;let{file:t}=this;this.findIfd0Offset(),this.ifd0Offset<8&&c("Malformed EXIF data"),!t.chunked&&this.ifd0Offset>t.byteLength&&c(`IFD0 offset points to outside of file.
this.ifd0Offset: ${this.ifd0Offset}, file.byteLength: ${t.byteLength}`),t.tiff&&await t.ensureChunk(this.ifd0Offset,W(this.options));let e=this.parseBlock(this.ifd0Offset,"ifd0");return e.size!==0?(this.exifOffset=e.get(34665),this.interopOffset=e.get(40965),this.gpsOffset=e.get(34853),this.xmp=e.get(700),this.iptc=e.get(33723),this.icc=e.get(34675),this.options.sanitize&&(e.delete(34665),e.delete(40965),e.delete(34853),e.delete(700),e.delete(33723),e.delete(34675)),e):void 0}async parseExifBlock(){if(this.exif||(this.ifd0||await this.parseIfd0Block(),this.exifOffset===void 0))return;this.file.tiff&&await this.file.ensureChunk(this.exifOffset,W(this.options));let t=this.parseBlock(this.exifOffset,"exif");return this.interopOffset||(this.interopOffset=t.get(40965)),this.makerNote=t.get(37500),this.userComment=t.get(37510),this.options.sanitize&&(t.delete(40965),t.delete(37500),t.delete(37510)),this.unpack(t,41728),this.unpack(t,41729),t}unpack(t,e){let i=t.get(e);i&&i.length===1&&t.set(e,i[0])}async parseGpsBlock(){if(this.gps||(this.ifd0||await this.parseIfd0Block(),this.gpsOffset===void 0))return;let t=this.parseBlock(this.gpsOffset,"gps");return t&&t.has(2)&&t.has(4)&&(t.set("latitude",q(...t.get(2),t.get(1))),t.set("longitude",q(...t.get(4),t.get(3)))),t}async parseInteropBlock(){if(!this.interop&&(this.ifd0||await this.parseIfd0Block(),this.interopOffset!==void 0||this.exif||await this.parseExifBlock(),this.interopOffset!==void 0))return this.parseBlock(this.interopOffset,"interop")}async parseThumbnailBlock(t=!1){if(!this.ifd1&&!this.ifd1Parsed&&(!this.options.mergeOutput||t))return this.findIfd1Offset(),this.ifd1Offset>0&&(this.parseBlock(this.ifd1Offset,"ifd1"),this.ifd1Parsed=!0),this.ifd1}async extractThumbnail(){if(this.headerParsed||this.parseHeader(),this.ifd1Parsed||await this.parseThumbnailBlock(!0),this.ifd1===void 0)return;let t=this.ifd1.get(513),e=this.ifd1.get(514);return this.chunk.getUint8Array(t,e)}get image(){return this.ifd0}get thumbnail(){return this.ifd1}createOutput(){let t,e,i,s={};for(e of d)if(t=this[e],!it(t))if(i=this.canTranslate?this.translateBlock(t,e):Object.fromEntries(t),this.options.mergeOutput){if(e==="ifd1")continue;Object.assign(s,i)}else s[e]=i;return this.makerNote&&(s.makerNote=this.makerNote),this.userComment&&(s.userComment=this.userComment),s}assignToOutput(t,e){if(this.globalOptions.mergeOutput)Object.assign(t,e);else for(let[i,s]of Object.entries(e))this.assignObjectToOutput(t,i,s)}}function q(n,t,e,i){var s=n+t/60+e/3600;return i!=="S"&&i!=="W"||(s*=-1),s}f(T,"type","tiff"),f(T,"headerLength",10),m.set("tiff",T);const _={ifd0:!1,ifd1:!1,exif:!1,gps:!1,interop:!1,sanitize:!1,reviveValues:!0,translateKeys:!1,translateValues:!1,mergeOutput:!1};Object.assign({},_,{firstChunkSize:4e4,gps:[1,2,3,4]});Object.assign({},_,{tiff:!1,ifd1:!0,mergeOutput:!1});const bt=Object.assign({},_,{firstChunkSize:4e4,ifd0:[274]});async function wt(n){let t=new dt(bt);await t.read(n);let e=await t.parse();if(e&&e.ifd0)return e.ifd0[274]}const kt=Object.freeze({1:{dimensionSwapped:!1,scaleX:1,scaleY:1,deg:0,rad:0},2:{dimensionSwapped:!1,scaleX:-1,scaleY:1,deg:0,rad:0},3:{dimensionSwapped:!1,scaleX:1,scaleY:1,deg:180,rad:180*Math.PI/180},4:{dimensionSwapped:!1,scaleX:-1,scaleY:1,deg:180,rad:180*Math.PI/180},5:{dimensionSwapped:!0,scaleX:1,scaleY:-1,deg:90,rad:90*Math.PI/180},6:{dimensionSwapped:!0,scaleX:1,scaleY:1,deg:90,rad:90*Math.PI/180},7:{dimensionSwapped:!0,scaleX:1,scaleY:-1,deg:270,rad:270*Math.PI/180},8:{dimensionSwapped:!0,scaleX:1,scaleY:1,deg:270,rad:270*Math.PI/180}});let S=!0,O=!0;if(typeof navigator=="object"){let n=navigator.userAgent;if(n.includes("iPad")||n.includes("iPhone")){let t=n.match(/OS (\d+)_(\d+)/);if(t){let[,e,i]=t;S=Number(e)+.1*Number(i)<13.4,O=!1}}else if(n.includes("OS X 10")){let[,t]=n.match(/OS X 10[_.](\d+)/);S=O=Number(t)<15}if(n.includes("Chrome/")){let[,t]=n.match(/Chrome\/(\d+)/);S=O=Number(t)<81}else if(n.includes("Firefox/")){let[,t]=n.match(/Firefox\/(\d+)/);S=O=Number(t)<77}}async function Ut(n){let t=await wt(n);return Object.assign({canvas:S,css:O},kt[t])}class St extends y{constructor(...t){super(...t),f(this,"ranges",new Ot),this.byteLength!==0&&this.ranges.add(0,this.byteLength)}_tryExtend(t,e,i){if(t===0&&this.byteLength===0&&i){let s=new DataView(i.buffer||i,i.byteOffset,i.byteLength);this._swapDataView(s)}else{let s=t+e;if(s>this.byteLength){let{dataView:r}=this._extend(s);this._swapDataView(r)}}}_extend(t){let e;e=et?tt.allocUnsafe(t):new Uint8Array(t);let i=new DataView(e.buffer,e.byteOffset,e.byteLength);return e.set(new Uint8Array(this.buffer,this.byteOffset,this.byteLength),0),{uintView:e,dataView:i}}subarray(t,e,i=!1){return e=e||this._lengthToEnd(t),i&&this._tryExtend(t,e),this.ranges.add(t,e),super.subarray(t,e)}set(t,e,i=!1){i&&this._tryExtend(e,t.byteLength,t);let s=super.set(t,e);return this.ranges.add(e,s.byteLength),s}async ensureChunk(t,e){this.chunked&&(this.ranges.available(t,e)||await this.readChunk(t,e))}available(t,e){return this.ranges.available(t,e)}}class Ot{constructor(){f(this,"list",[])}get length(){return this.list.length}add(t,e,i=0){let s=t+e,r=this.list.filter(a=>Q(t,a.offset,s)||Q(t,a.end,s));if(r.length>0){t=Math.min(t,...r.map(h=>h.offset)),s=Math.max(s,...r.map(h=>h.end)),e=s-t;let a=r.shift();a.offset=t,a.length=e,a.end=s,this.list=this.list.filter(h=>!r.includes(h))}else this.list.push({offset:t,length:e,end:s})}available(t,e){let i=t+e;return this.list.some(s=>s.offset<=t&&i<=s.end)}}function Q(n,t,e){return n<=t&&t<=e}class vt extends St{constructor(t,e){super(0),f(this,"chunksRead",0),this.input=t,this.options=e}async readWhole(){this.chunked=!1,await this.readChunk(this.nextChunkOffset)}async readChunked(){this.chunked=!0,await this.readChunk(0,this.options.firstChunkSize)}async readNextChunk(t=this.nextChunkOffset){if(this.fullyRead)return this.chunksRead++,!1;let e=this.options.chunkSize,i=await this.readChunk(t,e);return!!i&&i.byteLength===e}async readChunk(t,e){if(this.chunksRead++,(e=this.safeWrapAddress(t,e))!==0)return this._readChunk(t,e)}safeWrapAddress(t,e){return this.size!==void 0&&t+e>this.size?Math.max(0,this.size-t):e}get nextChunkOffset(){if(this.ranges.list.length!==0)return this.ranges.list[0].length}get canReadNextChunk(){return this.chunksRead<this.options.chunkLimit}get fullyRead(){return this.size!==void 0&&this.nextChunkOffset===this.size}read(){return this.options.chunked?this.readChunked():this.readWhole()}close(){}}N.set("blob",class extends vt{async readWhole(){this.chunked=!1;let n=await j(this.input);this._swapArrayBuffer(n)}readChunked(){return this.chunked=!0,this.size=this.input.size,super.readChunked()}async _readChunk(n,t){let e=t?n+t:void 0,i=this.input.slice(n,e),s=await j(i);return this.set(s,n,!0)}});export{Ut as y};
