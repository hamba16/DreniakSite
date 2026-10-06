import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('both legacy careers routes permanently redirect',async({request})=>{
  for(const division of ['engineering','asset-management']) {
    const response=await request.get(`/${division}/careers`,{maxRedirects:0});
    expect(response.status()).toBe(308);expect(response.headers().location).toBe('/careers');
  }
});
test('shared footer route links start at the destination page top',async({page})=>{
  for (const [label, destination] of [['Careers','/careers'],['Partners','/partners']] as const) {
    await page.goto('/engineering');
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.locator('footer').getByRole('link',{name:new RegExp(label)}).click();
    await expect(page).toHaveURL(new RegExp(`${destination}$`));
    await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
    await expect(page.locator('main h1').first()).toBeInViewport();
  }
});
test('internal CTAs start new pages at top and retain explicit fragment destinations',async({page})=>{
  await page.goto('/engineering/services');
  const serviceLink=page.getByRole('link',{name:'Discuss this service'}).first();
  await serviceLink.scrollIntoViewIfNeeded();
  await serviceLink.click();
  await expect(page).toHaveURL(/\/engineering\/consultation\?service=/);
  await expect(page.locator('main h1').first()).toBeInViewport();
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);

  await page.goto('/');
  await page.getByRole('link',{name:'Leadership'}).click();
  await expect(page).toHaveURL(/\/story#leadership$/);
  await expect(page.locator('#leadership')).toBeInViewport();

  for (const [slug, anchor] of [
    ['from-construction-project-to-performing-asset','real-estate-major-developments'],
    ['building-the-information-architecture-behind-a-national-transport-system','government-national-infrastructure'],
  ] as const) {
    await page.goto(`/asset-management/projects/${slug}`);
    await page.locator(`a[href="/asset-management/sectors#${anchor}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/asset-management/sectors#${anchor}$`));
    await expect(page.locator(`#${anchor}`)).toHaveAttribute('aria-selected','true');
  }
});
test('open applications, all five role cards, and keyboard controls',async({page})=>{
  await page.goto('/careers');
  await expect(page.getByRole('heading',{name:'Open Applications',exact:true})).toBeVisible();
  await expect(page.locator('.open-applications a')).toHaveAttribute('href',/^mailto:info@dreniak.com/);
  for(const role of ['Engineers','Architects','Site Engineers','Trainees','Interns']) {
    await page.getByRole('tab',{name:role,exact:true}).click();
    const card=page.getByRole('tabpanel'); await expect(card.getByRole('heading',{name:role,exact:true})).toBeVisible();
    await expect(card).toContainText('A typical week');await expect(card).toContainText('Who you work alongside');
  }
  await page.keyboard.press('Home');await expect(page.getByRole('tab',{name:'Engineers',exact:true})).toBeFocused();
  await page.keyboard.press('ArrowRight');await expect(page.getByRole('tabpanel')).toContainText('Architects');
  const result=await new AxeBuilder({page}).analyze();expect(result.violations.filter(v=>v.impact==='serious'||v.impact==='critical')).toEqual([]);
});
for(const width of [360,768,1440]) test(`Careers mobile and division navigation at ${width}`,async({page})=>{
  await page.setViewportSize({width,height:1000});
  for(const division of ['engineering','asset-management']) {
    await page.goto('/'+division);
    if(width<761) await page.getByRole('button',{name:'Open navigation'}).click();
    await page.getByRole('navigation',{name:'Division navigation'}).getByRole('link',{name:'Careers',exact:true}).click();
    await expect(page).toHaveURL(/\/careers$/);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
});
