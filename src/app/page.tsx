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
export default function Home() {
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
              ENGINEERING · INTELLIGENCE · LONGEVITY
            </span>
            <h1>
              Engineering the
              <br />
              Longevity of
              <br />
              <span>Civilisation.</span>
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
              <i className="red-dot" /> THE DRENIAK PERSPECTIVE
            </span>
            <span className="eyebrow">01 / ONE ORIGIN</span>
          </div>
          <Reveal>
            <h2>
              We started with
              <br />
              <span>engineering.</span>
              <br />
              We are building
              <br />
              towards <em>economies.</em>
            </h2>
          </Reveal>
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
            The things we build should outlast us.
            <br />
            <span>The value they create should go further.</span>
          </p>
          <span className="eyebrow">LIVE THE FUTURE.</span>
        </div>
      </main>
      <Footer />
    </>
  );
}
