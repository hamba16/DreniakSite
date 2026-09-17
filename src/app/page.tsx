import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import {
  Header,
  DivisionLink,
  Reveal,
  ScrollCue,
} from "@/components/interactions";
import { Logo, Mark, Motif } from "@/components/brand";
import { Footer } from "@/components/shared";
import { FounderCard } from "@/components/founder-card";
import { homepageContent } from "@/lib/public-content";
export default async function Home() {
  let content = null;
  try {
    content = await homepageContent();
  } catch {
    content = null;
  }
  const heroTitle = content?.hero_title || "Engineering the Longevity of Civilisation.";
  const premiseHeading = content?.premise_heading || "We started with engineering. We are building towards economies.";
  return (
    <>
      <Header />
      <main id="main">
        <section className="parent-hero">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-arc" aria-hidden="true">
            <Mark stroke />
          </div>
          <div className="hero-center">
            <div className="hero-logo">
              <Logo />
              <Mark className="logo-trace" stroke />
            </div>
            <span className="hero-kicker eyebrow">
              {content?.hero_kicker || "ENGINEERING · INTELLIGENCE · LONGEVITY"}
            </span>
            <h1>
              {heroTitle}
            </h1>
            <div className="hero-rule">
              <span />
              <i />
              <span />
            </div>
          </div>
          <div className="hero-bottom">
            <span className="eyebrow">
              ROOTED IN AFRICA.
              <br />
              BUILT FOR GENERATIONS.
            </span>
            <ScrollCue />
            <span className="eyebrow hero-est">
              EST. 2024
              <br />A GLOBAL AMBITION.
            </span>
          </div>
        </section>
        <section id="premise" className="premise">
          <Motif density={190} />
          <div className="section-heading">
            <span className="eyebrow">
            <i className="red-dot" /> {content?.premise_label || "THE DRENIAK PERSPECTIVE"}
            </span>
            <span className="eyebrow">01 / THE STARTING POINT</span>
          </div>
          <div className="premise-grid">
          <Reveal>
            <h2>{premiseHeading}</h2>
          </Reveal>
          <FounderCard />
          </div>
          <div className="premise-bottom">
            <span className="eyebrow">BUILD. CONNECT. DELIVER.</span>
            <Link href="/story" className="text-link">
              The story behind Dreniak <ArrowUpRight size={18} />
            </Link>
          </div>
        </section>
        <section className="division-section" id="divisions">
          <div className="split-heading">
            <span className="eyebrow">02 / TWO DISCIPLINES</span>
            <h2>One vision. Two ways forward.</h2>
            <span className="eyebrow">
              CHOOSE YOUR PERSPECTIVE <ArrowRight size={16} />
            </span>
          </div>
          <div className="division-panels">
            <DivisionLink
              division="engineering"
              className="division-panel engineering"
            >
              <Image
                src="/images/engineering.webp"
                alt="Conceptual architectural image of monumental concrete infrastructure"
                fill
                priority
                sizes="(max-width: 760px) 100vw, 60vw"
              />
              <div className="panel-shade" />
              <div className="panel-top">
                <span className="eyebrow">01 / THE FOUNDING PRACTICE</span>
                <Mark />
              </div>
              <div className="panel-content">
                <span className="eyebrow">BUILD THE FOUNDATION.</span>
                <h3>
                  Dreniak
                  <br />
                  Engineering<span>™</span>
                </h3>
                <p>
                  Physical infrastructure. Full project-lifecycle delivery.
                  <br />
                  Built with the future in mind.
                </p>
                <div className="panel-entry">
                  <span>Enter Engineering</span>
                  <span className="circle-arrow">
                    <ArrowUpRight />
                  </span>
                </div>
              </div>
              <span className="panel-caption">ERB-REGISTERED · UGANDA</span>
            </DivisionLink>
            <DivisionLink
              division="asset-management"
              className="division-panel asset-management"
            >
              <Image
                src="/images/asset-management.webp"
                alt="Conceptual image of a transport viaduct and a distant African skyline"
                fill
                fetchPriority="low"
                sizes="(max-width: 760px) 100vw, 60vw"
              />
              <div className="panel-shade" />
              <div className="panel-top">
                <span className="eyebrow">02 / THE LONGER VIEW</span>
                <Mark />
              </div>
              <div className="panel-content">
                <span className="eyebrow">MULTIPLY THE VALUE.</span>
                <h3>
                  Dreniak
                  <br />
                  Asset Management<span>™</span>
                </h3>
                <p>
                  We serve organisations, institutions and economies that own
                  complex, long-life infrastructure.
                </p>
                <div className="panel-entry">
                  <span>Enter Asset Management</span>
                  <span className="circle-arrow">
                    <ArrowUpRight />
                  </span>
                </div>
              </div>
              <span className="panel-caption">
                INFRASTRUCTURE & ECONOMIC VALUE
              </span>
            </DivisionLink>
          </div>
        </section>
        <div className="parent-closing">
          <Mark />
          <p>
            {content?.closing_text || "The things we build should outlast us. The value they create should go further."}
          </p>
          <span className="eyebrow">LIVE THE FUTURE.</span>
        </div>
      </main>
      <Footer />
    </>
  );
}
