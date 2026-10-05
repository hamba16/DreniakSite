import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('partner additions preserve the approved content boundaries',async({page})=>{
  await page.goto('/partners');
  await expect(page.getByRole('heading',{name:'AG Rosa',exact:true})).toHaveCount(1);
  const foundation=page.locator('article').filter({has:page.getByRole('heading',{name:'NK Udada Foundation',exact:true})});
  await expect(foundation).toContainText('Community partner'); await expect(foundation.getByRole('link',{name:'NK Udada Foundation',exact:true})).toHaveAttribute('href','https://the-nkfoundation.org/');
  const dbam=page.locator('article').filter({has:page.getByRole('heading',{name:'DBAM',exact:true})});
  await expect(dbam.locator('p')).toHaveCount(0);
  await expect(dbam.getByRole('link',{name:'DBAM',exact:true})).toHaveAttribute('href','https://dbamsocialcare.co.uk/');
  await expect(dbam.getByRole('link',{name:/Visit website/})).toHaveAttribute('href','https://dbamsocialcare.co.uk/');
  await expect(dbam.locator('svg image')).toHaveAttribute('href','/partners/dbam-social-care-enhanced.png');
});
test('service plates retain deep links and distinct supplied photographs',async({page})=>{
  await page.goto('/engineering/services#service-1');
  await expect(page.locator('#service-1 h2')).toHaveText('Construction');
  const sources=await page.locator('#main section[data-illustrated] img').evaluateAll(images=>images.map(image=>(image as HTMLImageElement).src));
  expect(sources.length).toBe(2);expect(new Set(sources).size).toBe(2);
  await expect(page.locator('#service-0 img,#service-3 img')).toHaveCount(0);
});
test('flowlines pause out of view and respect reduced motion',async({page})=>{
  await page.goto('/');await page.addStyleTag({content:'html{scroll-behavior:auto!important}'});
  const hero=page.locator('.hero-arc .brand-flow');
  await expect(hero).toHaveAttribute('data-flow-running','true');
  await expect(page.locator('.parent-header .brand-flow,.panel-top .brand-flow,.footer a .brand-flow')).toHaveCount(0);
  await page.locator('.parent-closing').scrollIntoViewIfNeeded();
  await expect(hero).toHaveAttribute('data-flow-running','false');
  const closing=page.locator('.parent-closing .brand-flow');await expect(closing).toHaveAttribute('data-flow-running','true');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(closing).toHaveAttribute('data-flow-running','false');
  expect(await closing.locator('.brand-flow-contour').first().evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
});
test('shared palette survives direct entry refresh and back navigation',async({page})=>{
  for(const division of ['engineering','asset-management']) {
    await page.goto('/'+division); await page.locator('.footer').getByRole('link',{name:'Partners',exact:true}).click();
    await expect(page.locator('.page-enter')).toHaveClass(/shared-theme/);
    expect(await page.locator('.page-enter').evaluate(el=>getComputedStyle(el).getPropertyValue('--accent').trim())).toBe('#991923');
    await page.reload();await expect(page.locator('.page-enter')).toHaveClass(/shared-theme/);
    await page.goBack();await page.goForward();await expect(page.locator('.page-enter')).toHaveClass(/shared-theme/);
  }
});
for(const route of ['/partners','/careers','/credits','/engineering/services']) test(`changed page accessibility ${route}`,async({page})=>{
  await page.goto(route);const result=await new AxeBuilder({page}).analyze();
  expect(result.violations.filter(v=>v.impact==='serious'||v.impact==='critical')).toEqual([]);
});
