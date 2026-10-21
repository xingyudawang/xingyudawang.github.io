import { spawn } from "node:child_process";
import fs from "node:fs";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const profile = "D:\\wangzhan\\.chrome-err";
fs.rmSync(profile, { recursive: true, force: true });
const chrome = spawn(CHROME, ["--headless=new","--remote-debugging-port=9339",`--user-data-dir=${profile}`,"--no-first-run","--mute-audio","about:blank"],{stdio:"ignore"});
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
await sleep(2500);
const list = await (await fetch("http://127.0.0.1:9339/json/list")).json();
const page = list.find(t=>t.type==="page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener("open",r,{once:true}));
let id=0; const pend=new Map(); const evs=[];
ws.addEventListener("message",e=>{const m=JSON.parse(e.data); if(m.id&&pend.has(m.id)){const p=pend.get(m.id);pend.delete(m.id);p(m.result);} else if(m.method) evs.push(m);});
const send=(method,params={})=>new Promise(res=>{const i=++id;pend.set(i,res);ws.send(JSON.stringify({id:i,method,params}));});
await send("Runtime.enable"); await send("Log.enable"); await send("Page.enable");
await send("Page.navigate",{url:"http://127.0.0.1:4173/#/workshop"});
await sleep(6000);
const r = await send("Runtime.evaluate",{expression:`JSON.stringify({h1:document.querySelector('h1')?.textContent??null, canvases:document.querySelectorAll('canvas').length, rootLen:(document.getElementById('root')?.innerHTML??'').length})`,returnByValue:true});
console.log("state:", r.result?.value);
for (const ev of evs) {
  if (ev.method==="Runtime.exceptionThrown") console.log("EXC:", ev.params.exceptionDetails?.exception?.description ?? ev.params.exceptionDetails?.text);
  if (ev.method==="Log.entryAdded" && ev.params.entry.level==="error") console.log("LOG:", ev.params.entry.text.slice(0,300));
  if (ev.method==="Runtime.consoleAPICalled" && ev.params.type==="error") console.log("CONSOLE:", ev.params.args?.map(a=>a.value??a.description).join(" ").slice(0,300));
}
ws.close(); chrome.kill();
