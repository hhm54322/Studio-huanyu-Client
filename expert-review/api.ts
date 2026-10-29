export type User={id:string;username:string;displayName:string;role:string;testAccount:boolean}
export type Kind='professional'|'free'
export type Note={id:string;module:string;target:string;decision:string;text:string;replacement:string;evidence:string;evidenceFiles:number[];knowledge:{candidate:boolean;title:string;applicability:string;exclusions:string;keywords:string[];requiredTerms:string[];excludedTerms:string[]}}
export type Review={id:string;version:number;status:'draft'|'submitted';notes:Note[];confirmed:string[];drafts:Record<string,Omit<Note,'id'|'module'>>;submitted_at?:string}
export type FileSource={index:number;name:string;mimeType:string;size:number;status:string;parser:string;summary:string;text:string;previewStatus:string;pageCount:number;dates:string[];reportType:string;diagnoses:string[];indicators:{name:string;value:string;evidence:string}[];findings:{category:string;text:string}[]}
export type InputSource={sourceNote:string;sourceInfo:Record<string,string|string[]>;groups:{title:string;fields:{key:string;label:string;value:string;status:string}[]}[];uploads:FileSource[]}
export type CaseDetail={id:string;sourceId:string;mode:Kind;submissionNo:string;fingerprint:string;report:any;input:InputSource;modules:{key:string;label:string;targets:{id:string;label:string;original:unknown}[]}[]}
export type CaseItem={id:string;submissionNo:string;mode:Kind;visitPurpose:string;gender:string;nationality:string;createdAt:string;uploadCount:number;reviewStatus:string}
let csrf=''
export function setCsrf(value:string){csrf=value}
export class ApiError extends Error{constructor(public code:string,public status:number,message:string){super(message)}}
const apiBase=(import.meta.env.VITE_EXPERT_API_BASE||'').replace(/\/$/,'')
export async function api<T=any>(path:string,method='GET',body?:unknown):Promise<T>{
 const headers:Record<string,string>={};if(body!==undefined)headers['Content-Type']='application/json';if(method!=='GET'&&csrf)headers['X-Expert-CSRF']=csrf
 const r=await fetch(`${apiBase}/api/expert${path}`,{method,credentials:'include',cache:'no-store',headers,body:body===undefined?undefined:JSON.stringify(body)})
 const json=await r.json().catch(()=>({message:'服务暂不可用，请稍后重试。'}))
 if(!r.ok)throw new ApiError(json.error||'REQUEST_FAILED',r.status,json.message||'操作失败。')
 return json
}
