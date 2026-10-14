# Vercel analytics

## Web Analytics

Enable Web Analytics for the DreniakSite project in the Vercel dashboard under **Analytics**, then deploy this revision. The app enables Vercel Web Analytics automatically on Production deployments; `NEXT_PUBLIC_VERCEL_ANALYTICS=true` is only needed to opt in local or Preview deployments for deliberate checks.

Collection follows the site's existing consent choice. Visitors must choose **Allow** before Web Analytics or optional Google Analytics loads. The choice is saved as `dreniak-analytics`; visitors who previously declined can change it from the privacy page. Admin routes are excluded. As a result, dashboard counts represent visitors who opted in, not every request, and data begins after the feature is enabled and this revision is deployed.

## Speed Insights

The `@vercel/speed-insights` package and its root-layout import are removed so a missing optional package cannot break the site build. Speed Insights performance metrics are not collected by this app.

## Verification

After deployment, accept analytics in a fresh browser session on the production site and check Vercel **Analytics** after data has had time to arrive. Verify that requests and page views appear for the production domain. Local builds do not prove the dashboard integration or historical data availability.
