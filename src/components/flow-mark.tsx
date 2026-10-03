"use client";
import { useEffect, useRef } from "react";
import markPath from "../../public/brand/mark-path.json";

/** One flattened brand path, repeated as softly fading contours. */
export function FlowMark({className="", stroke=false}:{className?:string;stroke?:boolean}) {
  const ref=useRef<SVGSVGElement>(null);
  useEffect(()=>{
    const element=ref.current;if(!element)return;
    const media=matchMedia('(prefers-reduced-motion: reduce)');let visible=false;let frame=0;
    const update=()=>{frame=0;if(!visible||media.matches||document.hidden)return;
      const rect=element.getBoundingClientRect();
      element.style.setProperty('--flow-parallax',`${Math.max(-6,Math.min(6,(innerHeight/2-rect.top)*.012)).toFixed(2)}px`);
    };
    const schedule=()=>{if(visible&&!document.hidden&&!media.matches&&!frame)frame=requestAnimationFrame(update);};
    const sync=()=>{element.dataset.flowRunning=String(visible&&!media.matches&&!document.hidden);if(media.matches)element.style.removeProperty('--flow-parallax');schedule();};
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});observer.observe(element);
    media.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);window.addEventListener('scroll',schedule,{passive:true});
    return()=>{observer.disconnect();cancelAnimationFrame(frame);media.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);window.removeEventListener('scroll',schedule);};
  },[]);
  return <svg ref={ref} viewBox="0 0 122 105" aria-hidden="true" focusable="false" className={`brand-flow ${className}`} data-flow-running="false">
    <g className="brand-flow-parallax">
      <path className="brand-flow-core" d={markPath} fill={stroke?'none':'currentColor'} stroke={stroke?'currentColor':undefined} strokeWidth={stroke ? .7 : undefined}/>
      {[0,1,2,3].map(index=><g className={`brand-flow-contour contour-${index}`} key={index}><path d={markPath} fill="none" stroke="currentColor" strokeWidth=".5" pathLength="1"/></g>)}
    </g>
  </svg>;
}
