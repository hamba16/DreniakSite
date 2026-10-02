import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const stages = ["Understand", "Manage", "Invest", "Digitise", "Protect", "Grow"];
for (const route of ["/asset-management", "/asset-management/approach"]) {
  test(`prism selection, keyboard, continuous wrap and semantics on ${route}`, async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 8 }));
    await page.goto(route);
    const root = page.locator('.journey:visible');
    await expect(root).toHaveAttribute("data-mode", "prism");
    for (const stage of stages) {
      await page.getByRole("tab", { name: stage, exact: true }).click();
      await expect(page.getByRole("tabpanel")).toContainText(stage);
      await expect(page.getByRole("tabpanel").getByRole("link")).toHaveAttribute("href", "/asset-management/services");
    }
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Understand", exact: true })).toBeFocused();
    await page.keyboard.press("End");
    await expect(root).toHaveAttribute("data-active-stage", "Grow");
    await page.keyboard.press("Home");
    await expect(root).toHaveAttribute("data-active-stage", "Understand");
    await page.mouse.move(0,0); await page.waitForTimeout(6700);
    await expect(root).toHaveAttribute("data-active-stage", "Understand");
    const result = await new AxeBuilder({page}).include('.journey').analyze();
    expect(result.violations.filter(v=>v.impact === 'serious' || v.impact === 'critical')).toEqual([]);
  });
}
for (const width of [360,390,768,1024,1440,1920]) {
  test(`prism stable responsive layout at ${width}`, async ({ page }) => {
    await page.setViewportSize({width,height:1000});
    await page.goto('/asset-management/approach');
    await page.addStyleTag({content:'html { scroll-behavior: auto !important; }'});
    const root=page.locator('.journey:visible'); await expect(root).not.toHaveAttribute('data-mode','server');
    await root.scrollIntoViewIfNeeded();
    const heights=[];
    for(const stage of stages){await page.getByRole('tab',{name:stage,exact:true}).click(); heights.push((await root.boundingBox())!.height);}
    expect(Math.max(...heights)-Math.min(...heights)).toBeLessThan(1);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.waitForTimeout(800);
    await root.screenshot({path:`tmp/final-round/prism-approach-${width}.png`});
  });
}
for (const hint of ['reduced','save-data','memory','cores','unsupported']) {
  test(`flat fallback: ${hint}`,async({page})=>{
    if(hint==='reduced') await page.emulateMedia({reducedMotion:'reduce'});
    await page.addInitScript(hint=>{
      if(hint==='save-data') Object.defineProperty(navigator,'connection',{get:()=>({saveData:true})});
      if(hint==='memory') Object.defineProperty(navigator,'deviceMemory',{get:()=>1});
      if(hint==='cores') Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>2});
      if(hint==='unsupported') {const original=CSS.supports.bind(CSS); CSS.supports=((...args:string[])=>args[0]==='transform-style'?false:original(args[0],args[1])) as typeof CSS.supports;}
    },hint);
    await page.goto('/asset-management/approach');
    await expect(page.locator('.journey:visible')).toHaveAttribute('data-mode','flat');
    await page.getByRole('tab',{name:'Protect',exact:true}).click();
    await expect(page.getByRole('tabpanel')).toContainText('Build resilience');
  });
}
test('all stage content and links work without JavaScript', async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false}); const page=await context.newPage();
  await page.goto((process.env.TEST_BASE_URL||'http://localhost:3000')+'/asset-management/approach');
  for(const stage of stages){await page.getByRole('link',{name:stage,exact:true}).click(); await expect(page.getByRole('link',{name:`Explore ${stage} services`})).toBeVisible();}
  await context.close();
});
test('horizontal swipe selects, vertical gesture preserves selection',async({page})=>{
  await page.setViewportSize({width:390,height:844}); await page.goto('/asset-management/approach');
  const root=page.locator('.journey:visible'); await page.getByRole('tab',{name:'Understand',exact:true}).click();
  const panel=page.getByRole('tabpanel'); const box=(await panel.boundingBox())!;
  await page.mouse.move(box.x+box.width*.8,box.y+150); await page.mouse.down(); await page.mouse.move(box.x+box.width*.3,box.y+155,{steps:12}); await page.mouse.up();
  await expect(root).not.toHaveAttribute('data-active-stage','Understand');
  const selected=await root.getAttribute('data-active-stage');
  await page.mouse.move(box.x+100,box.y+80); await page.mouse.down(); await page.mouse.move(box.x+110,box.y+200,{steps:8}); await page.mouse.up();
  await expect(root).toHaveAttribute('data-active-stage',selected!);
});
