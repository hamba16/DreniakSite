"use client";
import { useId, useRef, useState } from "react";
import { careerRoles } from "@/content/careers";
import styles from "./career-roles.module.css";
export function CareerRoles() {
  const [active,setActive]=useState(0); const id=useId(); const refs=useRef<(HTMLButtonElement|null)[]>([]);
  const role=careerRoles[active];
  return <section className={styles.roles} aria-label="Working across our disciplines">
    <span className="eyebrow">A VIEW OF THE WORK</span><h2>Different roles. Shared purpose.</h2>
    <p className={styles.note}>These examples describe the kind of work a role may involve. Actual responsibilities depend on the project and your experience. They are not vacancy announcements or formal training programmes.</p>
    <div className={styles.tabs} role="tablist" aria-label="Explore a role">{careerRoles.map((item,index)=><button type="button" key={item.name} role="tab" id={`${id}-${index}`} aria-selected={active===index} aria-controls={`${id}-panel`} tabIndex={active===index?0:-1} ref={node=>{refs.current[index]=node;}} onClick={()=>setActive(index)} onKeyDown={event=>{
      const next=event.key==='ArrowRight'?(index+1)%5:event.key==='ArrowLeft'?(index+4)%5:event.key==='Home'?0:event.key==='End'?4:null;
      if(next===null)return;event.preventDefault();setActive(next);refs.current[next]?.focus();
    }}>{item.name}</button>)}</div>
    <div className={styles.card} role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${active}`} tabIndex={0}>
      <h3>{role.name}</h3><dl><div><dt>A typical week</dt><dd>{role.week}</dd></div><div><dt>What you pick up</dt><dd>{role.learning}</dd></div><div><dt>Who you work alongside</dt><dd>{role.alongside}</dd></div></dl>
      <p className={styles.closing}>You will be asked what you think. We would rather hear a question early than a problem late.</p>
    </div>
  </section>;
}
