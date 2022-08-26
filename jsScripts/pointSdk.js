/* eslint-disable */
(()=>{var e=(e,t)=>{class a extends Error{}class o extends Error{}class n extends Error{}class r extends Error{}class s extends Error{}class i extends Error{}const c=async(t,o,n)=>{try{const r=await window.top.fetch(`${e}${n?"/point_api/":"/v1/api/"}${t}`,{cache:"no-cache",credentials:"include",keepalive:!0,...o,headers:{"Content-Type":"application/json",...o?.headers}});if(!r.ok){const{ok:e,status:t,statusText:o,headers:n}=r;throw console.error("SDK call failed:",{ok:e,status:t,statusText:o,headers:Object.fromEntries([...n.entries()])}),new a("Point SDK request failed")}try{return await r.json()}catch(e){throw console.error("Point API response parsing error:",e),e}}catch(e){throw console.error("Point API call failed:",e),e}},d={get:(e,t,a,o)=>c(`${e}${t?"?":""}${new URLSearchParams(t).toString()}`,{method:"GET",headers:a},o),post:(e,t,a,o)=>c(e,{method:"POST",headers:a,body:JSON.stringify({...t,_csrf:window.localStorage.getItem("csrf_token")})},o),postFile:(t,o)=>(async(t,o)=>{try{const n=await window.top.fetch(`${e}/${t}`,{cache:"no-cache",credentials:"include",keepalive:!0,...o});if(!n.ok){const{ok:e,status:t,statusText:o,headers:r}=n;throw console.error("SDK ZProxy call failed:",{ok:e,status:t,statusText:o,headers:Object.fromEntries([...r.entries()])}),new a("Point SDK request failed")}try{return await n.json()}catch(e){throw console.error("Point API response parsing error:",e),e}}catch(e){throw console.error("Point API call failed:",e),e}})(t,{method:"POST",body:o})};function l(e){return new Promise((t=>setTimeout(t,e)))}const w={},p={},u={},h="subscription_confirmation",m="subscription_cancellation",g="subscription_event",y="subscription_error",f="subscribeContractEvent",_="removeSubscriptionById",b=({type:e,params:{contract:t,event:a}={}})=>`${e}_${t}_${a}`,S=e=>p[e]||(p[e]=[]),E={},v=(e,{messageQueueSizeLimit:t=1e3}={})=>new Promise(((a,c)=>{if(void 0!==w[e])return void a(w[e]);const d=new WebSocket(`${e}?token=POINTSDK_TOKEN`);d.onopen=()=>a(Object.assign(w[e]=d,{async subscribeToContractEvent(e){const t={type:f,params:e},a=b(t);E[a]=function(){let e=()=>{},t=()=>{};return Object.assign(new Promise(((a,o)=>{e=a,t=o})),{resolve:e,reject:t})}(),await d.send(JSON.stringify(t));const o=await Promise.race([E[a],(n=1e4,new Promise(((e,t)=>setTimeout((()=>t(new s("Subscription confirmation timeout"))),n))))]);var n;const r=S(o);return Object.assign((async()=>{for(;;)try{const e=u[o];if(e)throw e;if(r.length)return r.shift();await l(100)}catch(e){throw console.error("subscribed message error:",e),e}}),{unsubscribe:()=>d.send(JSON.stringify({type:_,params:{subscriptionId:o}}))})}})),d.onerror=e=>{for(const t in p)u[t]||(u[t]=new n(e.toString()))},d.onclose=t=>{if(delete w[e],1e3===t.code||1001===t.code)a(void 0);else{for(const e in p)u[e]||(u[e]=new r(t.toString()));c()}},d.onmessage=e=>{try{const{type:a,request:n,subscriptionId:r,data:s}=JSON.parse(e.data);switch(a){case h:{const e=b(n),{resolve:t,reject:a}=E[e]||{};"string"!=typeof r?"function"==typeof a&&a(new i(`Invalid subscription id "${r}" for request id: "${e}"`)):"function"==typeof t&&t(r);break}case m:r&&(console.info({type:a,request:n,subscriptionId:r,data:s}),delete p[r],delete u[r]);break;case g:if(r){const e=S(r);e.length>t?u[r]=new o("ZProxy WS message queue overflow"):e.push(s)}else console.error("Unable to identify subscription channel",{subscriptionId:r,request:n,data:s});break;case y:r?u[r]=new i(JSON.stringify(s)):console.error("Unable to identify subscription channel",{subscriptionId:r,request:n,data:s});break;default:console.error("Unsupported event type:",{type:a,request:n,subscriptionId:r,data:s})}}catch(e){console.error("Web Socket onmessage error:",e)}}})),k=e=>new Promise(((t,a)=>{const o=Math.random(),n=e=>{e.data.__page_req_id===o&&"to_page"===e.data.__direction&&(window.removeEventListener("message",n),e.data.code?a({code:e.data.code,message:e.data.message}):t(e.data.result))};window.addEventListener("message",n),window.postMessage({messageId:e,__message_type:"registerHandler",__page_req_id:o,__direction:"to_bg"})}));return{version:t,status:{ping:()=>d.get("status/ping",void 0,{"wallet-token":"WALLETID-PASSCODE"})},contract:{load:({contract:e,...t})=>d.get(`contract/load/${e}`,t,{"wallet-token":"WALLETID-PASSCODE"}),call:async({contract:e,method:t,params:a})=>{const{data:{abi:o,address:n}}=await d.get(`contract/load/${e}`,{},{"wallet-token":"WALLETID-PASSCODE"}),r=o.find((e=>e.name===t));if(!r)throw new Error(`Method ${t} not found in contract ${e}`);const s=a??[];if(s.length!==r.inputs.length)throw new Error(`Invalid number of params, expected ${r.inputs.length}, got ${s.length}`);for(let e=0;e<s.length;e++)"bytes32"!==r.inputs[e].internalType||"string"!=typeof s[e]||s[e].startsWith("0x")||(s[e]=`0x${s[e]}`);const{data:i}=await d.post("contract/encodeFunctionCall",{jsonInterface:r,params:s},{"wallet-token":"WALLETID-PASSCODE"}),c=await window.top.ethereum.request({method:"eth_requestAccounts"});switch(r.stateMutability){case"view":case"pure":const t=await window.top.ethereum.request({method:"eth_call",params:[{from:c[0],to:n,data:i},"latest"]});return{data:(await d.post("contract/decodeParameters",{typesArray:r.outputs,hexString:t},{"wallet-token":"WALLETID-PASSCODE"})).data[0]};case"nonpayable":return window.top.ethereum.request({meta:{contract:e},method:"eth_sendTransaction",params:[{from:c[0],to:n,data:i}]});case"payable":throw new Error("Do not use call for payable functions, use send instead");default:throw new Error(`Unexpected function state mutability ${r.stateMutability}`)}},send:async({contract:e,method:t,params:a,value:o})=>{const{data:{abi:n,address:r}}=await d.get(`contract/load/${e}`,{},{"wallet-token":"WALLETID-PASSCODE"}),s=await window.top.ethereum.request({method:"eth_requestAccounts"}),i=n.find((e=>e.name===t));if(!i)throw new Error(`Method ${t} not found in contract ${e}`);const c=a??[];if(c.length!==i.inputs.length)throw new Error(`Invalid number of params, expected ${i.inputs.length}, got ${c.length}`);for(let e=0;e<c.length;e++)"bytes32"!==i.inputs[e].internalType||"string"!=typeof c[e]||c[e].startsWith("0x")||(c[e]=`0x${c[e]}`);if(["view","pure"].includes(i.stateMutability))throw new Error(`Method ${t} is a view one, use call instead of send`);const{data:l}=await d.post("contract/encodeFunctionCall",{jsonInterface:i,params:a??[]});return window.top.ethereum.request({meta:{contract:e},method:"eth_sendTransaction",params:[{from:s[0],to:r,data:l,value:o}]})},events:e=>d.post("contract/events",e,{"wallet-token":"WALLETID-PASSCODE"}),async subscribe({contract:t,event:o,...n}){if("string"!=typeof t)throw new a(`Invalid contract ${t}`);if("string"!=typeof o)throw new a(`Invalid event ${o}`);const r=new URL(e);r.protocol="https:"===r.protocol?"wss:":"ws:",r.pathname+=r.pathname.endsWith("/")?"ws":"/ws";const s=await v(r.toString());if(!s)throw new a("Failed to establish web socket connection");return s.subscribeToContractEvent({contract:t,event:o,...n})}},storage:{postFile:e=>d.postFile("_storage/",e),getString:({id:e,...t})=>d.get(`storage/getString/${e}`,t,{"wallet-token":"WALLETID-PASSCODE"}),putString:e=>d.post("storage/putString",e,{"wallet-token":"WALLETID-PASSCODE"})},wallet:{address:()=>d.get("wallet/address"),..."https://confirmation-window"===e?{hash:()=>d.get("wallet/hash",{},{},!0)}:{},publicKey:()=>d.get("wallet/publicKey",{},{"wallet-token":"WALLETID-PASSCODE"}),balance:e=>{if(!e)throw new Error("No network specified");return d.get("wallet/balance",{network:e})},send:async({to:e,network:t,value:a})=>{const{networks:o,default_network:n}=await d.get("blockchain/networks"),r=t??n;if(!o[r])throw new Error(`Unknown network ${r}`);switch(o[r].type){case"eth":const t=await window.top.ethereum.request({method:"eth_requestAccounts"});return window.top.ethereum.request({method:"eth_sendTransaction",params:[{from:t[0],to:e,value:a}],chain:r});case"solana":return window.top.solana.request({method:"solana_sendTransaction",params:[{to:e,lamports:a}],chain:r});default:throw new Error(`Unexpected network type ${o[r].type}`)}},encryptData:({publicKey:e,data:t,...a})=>d.post("wallet/encryptData",{publicKey:e,data:t,...a},{"wallet-token":"WALLETID-PASSCODE"}),decryptData:({data:e,...t})=>d.post("wallet/decryptData",{data:e,...t},{"wallet-token":"WALLETID-PASSCODE"})},identity:{publicKeyByIdentity:({identity:e,...t})=>d.get(`identity/publicKeyByIdentity/${e}`,t,{"wallet-token":"WALLETID-PASSCODE"}),identityToOwner:({identity:e,...t})=>d.get(`identity/identityToOwner/${e}`,t,{"wallet-token":"WALLETID-PASSCODE"}),ownerToIdentity:({owner:e,...t})=>d.get(`identity/ownerToIdentity/${e}`,t,{"wallet-token":"WALLETID-PASSCODE"}),me:()=>d.get("identity/isIdentityRegistered/",void 0,{"wallet-token":"WALLETID-PASSCODE"})},..."https://point"===e?{point:{wallet_send:async({to:e,network:t,value:a})=>{const o=String(Math.random());await Promise.all([k(o),(async()=>{if(200!==(await d.post("wallet/send",{to:e,network:t,value:a,messageId:o},{},!0)).status)throw new Error("Failed to send token")})()])},wallet_send_token:async({to:e,network:t,tokenAddress:a,value:o})=>{const n=String(Math.random());await Promise.all([k(n),(async()=>{if(200!==(await d.post("wallet/sendToken",{to:e,network:t,value:o,tokenAddress:a,messageId:n},{},!0)).status)throw new Error("Failed to send token")})()])}}}:{}}};var t=()=>{function e(e){return new Promise(((t,a)=>{const o=Math.random(),n=e=>{e.data.__page_req_id===o&&"to_page"===e.data.__direction&&(window.removeEventListener("message",n),e.data.code?a({code:e.data.code,message:e.data.message}):e.data.error?a({code:e.data.error.code,message:e.data.error.message}):t(e.data.result))};window.addEventListener("message",n),window.postMessage({...e,__provider:"eth",__message_type:"rpc",__page_req_id:o,__direction:"to_bg"})}))}return{request:e,send:t=>e({method:t})}};var a=()=>{const e=e=>new Promise(((t,a)=>{const o=Math.random(),n=e=>{e.data.__page_req_id===o&&"to_page"===e.data.__direction&&(window.removeEventListener("message",n),e.data.code?a({code:e.data.code,message:e.data.message}):e.data.error?a({code:e.data.error.code,message:e.data.error.message}):t(e.data.result))};window.addEventListener("message",n),window.postMessage({...e,__message_type:"rpc",__provider:"solana",__page_req_id:o,__direction:"to_bg"})}));return{connect:async()=>({publicKey:(await e({method:"solana_requestAccount"})).publicKey}),disconnect:async()=>{},request:e,signAndSendTransaction:t=>e({method:"solana_sendTransaction",params:[t.toJSON()]})}};window.point=e(window.location.origin,"0.0.21"),window.ethereum=t(),window.solana=a()})();
//# sourceMappingURL=index.js.map
