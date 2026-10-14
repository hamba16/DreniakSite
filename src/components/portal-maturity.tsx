"use client";
import { useState } from "react";
import { assessmentQuestions } from "@/lib/assessment";
export function PortalMaturity({ organisationId }: { organisationId: string }) {
 const [answers,setAnswers]=useState<number[]>([]); const [message,setMessage]=useState("");
 async function submit(){if(answers.length!==6){setMessage("Answer all six questions first.");return;}setMessage("Saving assessment…");try{const response=await fetch("/api/portal/maturity",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({organisationId,answers})});const data=await response.json();setMessage(response.ok?`${data.result.label} Score: ${data.result.score}%. ${data.result.description}`:data.error||"Assessment could not be saved.");}catch{setMessage("Assessment could not be saved. Try again later.");}}
 return <div>{assessmentQuestions.map((item,index)=><fieldset key={item.area}><legend>{item.area}: {item.question}</legend>{item.options.map((option,value)=><label key={value} style={{display:"block",margin:".5rem 0"}}><input type="radio" name={`maturity-${index}`} checked={answers[index]===value} onChange={()=>setAnswers((old)=>{const next=[...old];next[index]=value;return next;})}/> {option}</label>)}</fieldset>)}<button type="button" onClick={submit}>Save maturity assessment</button><p role="status" aria-live="polite">{message}</p></div>;
}
