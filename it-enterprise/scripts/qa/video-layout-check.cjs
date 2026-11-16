/* Verify the full video introduction stays above the inline player at short/narrow viewports. */
const {chromium}=require('playwright'),path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'../../exelearning/pilot'),server=require('./local-server.cjs')(path.join(base,process.argv.includes('--dev')?'dev-preview':'preview'));
let browser;const report={checks:[],measurements:[],screenshots:[]};
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({channel:'chrome',headless:true,args:['--disable-gpu']});
for(const [width,height] of [[1918,930],[1536,674],[1366,768],[1024,600],[390,844]]){
 const p=await browser.newPage({viewport:{width,height}});await p.addInitScript(()=>localStorage.setItem('lcm:ITE:sections:v1',JSON.stringify({theory:false,check:false})));await p.goto('http://127.0.0.1:'+server.address().port+'/ITE/index.html');await p.locator('.lesson-open').click();await p.evaluate(()=>document.fonts.ready);
 for(const enlarged of [false,true]){
 if(enlarged)await p.addStyleTag({content:'.iv-header p{font-size:28px!important;line-height:1.6!important}.iv-header h2{font-size:48px!important}'});
 const r=await p.evaluate(()=>{const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right};};return {header:box('.iv-header'),description:box('.iv-header p'),title:box('.iv-header h2'),player:box('.iv-video-frame'),footer:box('.iv-footer'),viewport:[innerWidth,innerHeight],pageWidth:document.documentElement.scrollWidth};});
 assert(r.header.bottom>=r.description.bottom-.5,JSON.stringify(r));assert(r.player.top>=r.header.bottom+8,JSON.stringify(r));assert(r.description.top>=r.title.bottom-.5,JSON.stringify(r));assert(r.footer.top>=r.player.bottom,JSON.stringify(r));assert(r.pageWidth<=width,JSON.stringify(r));report.measurements.push({width,height,enlarged,...r});
 if(!enlarged&&(width===1918||width===390)){const name=width===1918?'ITE-video-introduction-fixed.png':'ITE-video-introduction-mobile.png';await p.screenshot({path:path.join(base,'qa',name),animations:'disabled'});report.screenshots.push(name);}
 await p.locator('.iv-video-frame').scrollIntoViewIfNeeded();assert(await p.locator('.iv-play').isVisible());
 }
 await p.close();
}
report.checks.push('Header contains the entire description; inline player starts below header with visible gap; footer follows player; no horizontal overflow at 1918x930,1536x674,1366x768,1024x600,390x844 and enlarged introduction text; player remains scroll-reachable.');
})().catch(e=>{report.failure=e.stack;process.exitCode=1;console.error(e);}).finally(async()=>{if(browser)await browser.close();server.close();fs.writeFileSync(path.join(base,'qa/video-layout-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({checks:report.checks,failure:report.failure,measurements:report.measurements.length},null,2));});
