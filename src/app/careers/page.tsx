import { Header } from "@/components/interactions";
import { Footer, PageIntro } from "@/components/shared";
import { CareerRoles } from "@/components/career-roles";
import { engineeringOpenings } from "@/content/engineering";
import { ArrowUpRight } from "lucide-react";
export const metadata = { title: "Careers", description: "Open applications across Dreniak's engineering and asset management disciplines.", alternates: { canonical: "/careers" } };
export default function Careers() {
  return <><Header/><main id="main" className="page-container shared-careers">
    <PageIntro eyebrow="CAREERS / DRENIAK" title={<>Bring your questions.<br/><em>Build your perspective.</em></>} description="Work that connects engineering decisions with the life of an asset. Explore the roles and tell us where you could contribute."/>
    {engineeringOpenings.length>0 && <section className="engineering-openings" aria-label="Current vacancies">{engineeringOpenings.map(opening=><article className="insight-card" key={opening.id}><span className="eyebrow">{opening.location}</span><h2>{opening.title}</h2><p>{opening.description}</p><a className="text-link" href={opening.applicationUrl}>Apply for this role <ArrowUpRight size={17}/></a></article>)}</section>}
    <section className="open-applications"><span className="eyebrow">START A CONVERSATION</span><h2>Open Applications</h2><p>Send your CV and a short note about the work that interests you, your experience and your availability. Include a portfolio link if it helps explain your work.</p><p>Use the subject line <strong>Open application: [role] / [your name]</strong> and email <a href="mailto:info@dreniak.com?subject=Open%20application">info@dreniak.com</a>.</p><p>Open applications are expressions of interest. They do not indicate a current vacancy or guarantee a placement.</p></section>
    <CareerRoles/>
  </main><Footer/></>;
}
