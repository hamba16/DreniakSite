/* Local production visual evidence. Run with the production server on TEST_BASE_URL. */
/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node evidence runner. */
const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const ts = require('typescript');
const { execFileSync } = require('node:child_process');
const AxeBuilder = require('@axe-core/playwright').default;
const base = process.env.TEST_BASE_URL || 'http://localhost:3100';
const out = 'tmp/final-round/production';
fs.mkdirSync(out, { recursive: true });
const gzip = value => zlib.gzipSync(value).length;
const beforeSource = execFileSync('git',['show','7a9cd55:src/components/interactions.tsx'],{encoding:'utf8'});
const before = beforeSource.slice(beforeSource.indexOf('const stages = ['),beforeSource.indexOf('export type Service = {'));
const transpile = source => ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ESNext,removeComments:true}}).outputText;
const after = fs.readFileSync('src/components/asset-prism.tsx','utf8');
const css = fs.readFileSync('src/components/asset-prism.module.css','utf8');
const evidence = {screenshots:[], pageErrors:[], overflow:[], imageFailures:[], decorativeMarks:[], accessibility:[], metrics:{
  oldJourneyTranspiledGzip: gzip(transpile(before)), newPrismTranspiledGzip:gzip(transpile(after)), newPrismCssGzip:gzip(css),
  measurement:'Isolated transpiled module plus CSS, before and after. Existing React, Next and icon runtime excluded; not a route bundle delta.'
}};
const metricsOnly=process.argv.includes('--metrics-only');
if(metricsOnly) Object.assign(evidence,JSON.parse(fs.readFileSync(path.join(out,'evidence.json'),'utf8')));
(async()=>{
 const browser=await chromium.launch();const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();
 page.on('pageerror',error=>evidence.pageErrors.push(error.message));
 await page.addInitScript(()=>{
   window.__shifts=[];
   new PerformanceObserver(list=>{for(const entry of list.getEntries())if(!entry.hadRecentInput)window.__shifts.push({value:entry.value,sources:entry.sources?.map(s=>s.node?.closest?.('.journey')?'journey':s.node?.nodeName)});}).observe({type:'layout-shift',buffered:true});
 });
 const go=async(route)=>{await page.goto(base+route);await page.locator('#main h1').first().waitFor({state:'visible'});await page.evaluate(()=>document.fonts.ready);await page.addStyleTag({content:'html{scroll-behavior:auto!important}'});};
 const capture=async(selector,name)=>{
  if(selector==='.project-bento'){
   for(const tile of await page.locator('.project-bento-tile').all()){await tile.scrollIntoViewIfNeeded();await page.waitForTimeout(100);}
  }
  const element=page.locator(selector+':visible').first();await element.scrollIntoViewIfNeeded();await page.waitForTimeout(850);
  await element.locator('img').evaluateAll(images=>Promise.all(images.map(image=>image.decode().catch(()=>{}))));
  const file=path.join(out,name+'.png');
  const box=await element.boundingBox();const scroll=await page.evaluate(()=>scrollY);
  await page.screenshot({path:file,fullPage:true,style:'.site-header,.parent-header,.skip-link{visibility:hidden!important}',clip:{x:Math.max(0,box.x),y:Math.max(0,box.y+scroll),width:Math.min(box.width,page.viewportSize().width-Math.max(0,box.x)),height:box.height}});evidence.screenshots.push(file);
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))evidence.overflow.push(name);
  const failed=await element.locator('img').evaluateAll(images=>images.filter(i=>!i.naturalWidth).map(i=>i.src));evidence.imageFailures.push(...failed);
 };
 if(process.argv.includes('--sections-only')){
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const width of [360,390,768,1024,1440,1920]){await page.setViewportSize({width,height:1000});await go('/engineering/projects');await capture('.project-bento',`gallery-${width}`);}
  await page.setViewportSize({width:1440,height:1000});
  for(const route of ['/engineering/services','/careers','/partners','/credits','/story']){await go(route);await capture('#main',route.slice(1).replaceAll('/','-')+'-1440');}
  await page.emulateMedia({reducedMotion:'no-preference'});
  for(const division of ['engineering','asset-management']){await go('/'+division);await capture('#main .division-hero',`${division}-hero-zoom-1440`);}
  const record=path.join(out,'evidence.json');if(fs.existsSync(record)){const existing=JSON.parse(fs.readFileSync(record,'utf8'));existing.screenshots=[...new Set([...existing.screenshots,...evidence.screenshots])];fs.writeFileSync(record,JSON.stringify(existing,null,2));}
  await browser.close();console.log('Refreshed 13 isolated section screenshots. Existing measurement record preserved.');return;
 }
 if(!metricsOnly){
 for(const width of [360,390,768,1024,1440,1920]){
  await page.setViewportSize({width,height:1000});await page.emulateMedia({reducedMotion:'reduce'});
  await go('/');await capture('.division-panels',`panels-${width}`);
  for(const division of ['engineering','asset-management']){await go('/'+division);await capture('#main .division-hero',`${division}-hero-${width}`);}
  for(const route of ['/asset-management','/asset-management/approach']){
   await page.emulateMedia({reducedMotion:'no-preference'});await go(route);
   await page.getByRole('tab',{name:'Understand',exact:true}).click();
   await capture('.journey',`${route.endsWith('approach')?'approach':'home'}-prism-${width}`);
   evidence.metrics[`${route}-${width}-initialLayoutShifts`]=await page.evaluate(()=>window.__shifts);
  }
  await page.emulateMedia({reducedMotion:'reduce'});await go('/engineering/projects');
  await capture('.project-bento',`gallery-${width}`);
 }
 await page.setViewportSize({width:1440,height:1000});await page.emulateMedia({reducedMotion:'no-preference'});
 await go('/');for(const division of ['engineering','asset-management']){await page.locator('.division-panel.'+division).hover();await capture('.division-panels',`panels-hover-${division}`);}
 for(const division of ['engineering','asset-management']){await go('/'+division);await capture('#main .division-hero',`${division}-hero-zoom-1440`);}
 for(const route of ['/engineering/services','/careers','/partners','/credits','/story']){
  await go(route);await capture('#main',route.slice(1).replaceAll('/','-')+'-1440');
 }
 for(const route of ['/','/engineering','/asset-management','/engineering/services','/careers','/partners','/credits','/story']){
  await go(route);const result=await new AxeBuilder({page}).analyze();
  evidence.accessibility.push({route,violations:result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
 }
 for(const route of ['/','/engineering','/asset-management','/engineering/about','/asset-management/about','/engineering/projects','/asset-management/projects','/engineering/contact','/asset-management/contact','/engineering/insights','/asset-management/insights','/engineering/approach','/asset-management/approach','/story','/partners','/portal','/asset-management/assessment']){
  await go(route);
  evidence.decorativeMarks.push(...await page.locator('.brand-flow').evaluateAll((marks,route)=>marks.map(mark=>{const box=mark.getBoundingClientRect();return {route,width:Math.round(box.width),height:Math.round(box.height),container:mark.parentElement.className,animated:true,position:getComputedStyle(mark).position};}),route));
 }
 }
 await go('/asset-management/approach');const root=page.locator('.journey');await root.scrollIntoViewIfNeeded();
 const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 await page.evaluate(()=>{window.__frameGaps=[];window.__measureFrames=true;let previous=performance.now();function tick(now){window.__frameGaps.push(now-previous);previous=now;if(window.__measureFrames)requestAnimationFrame(tick);}requestAnimationFrame(tick);});
 const heights=[];for(const stage of ['Manage','Invest','Digitise','Protect','Grow','Understand']){await page.getByRole('tab',{name:stage,exact:true}).click();await page.waitForTimeout(750);heights.push((await root.boundingBox()).height);}
 evidence.metrics[metricsOnly?'cpu4xIsolated':'cpu4x']=await page.evaluate(()=>{window.__measureFrames=false;const sorted=window.__frameGaps.sort((a,b)=>a-b);return {frames:sorted.length,p95FrameGapMs:sorted[Math.floor(sorted.length*.95)],maxFrameGapMs:sorted.at(-1),layoutShifts:window.__shifts};});
 evidence.metrics.stageHeightDifference=Math.max(...heights)-Math.min(...heights);await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
 await go('/');const flow=page.locator('.hero-arc .brand-flow');await flow.waitFor();
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
 evidence.metrics.simulatedHiddenTabPaused=(await flow.getAttribute('data-flow-running'))==='false';
 await browser.close();fs.writeFileSync(path.join(out,'evidence.json'),JSON.stringify(evidence,null,2));
 console.log(JSON.stringify({screenshots:evidence.screenshots.length,pageErrors:evidence.pageErrors,overflow:evidence.overflow,imageFailures:evidence.imageFailures,metrics:evidence.metrics},null,2));
})();
