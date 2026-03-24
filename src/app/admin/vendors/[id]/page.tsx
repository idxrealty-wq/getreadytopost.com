"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
interface Vendor {
  id: string; businessName: string; contactName: string; email: string;
  phone: string; websiteUrl: string; categoryId: string; tier: string;
  marketId: string; logoUrl: string; adGraphicUrl: string; ctaText: string;
  destinationUrl: string; shortDescription: string; status: string;
  notes: string; address: string; city: string; state: string; zip: string;
  areasServed: string[]; tags: string[]; nowServing: string[];
  videoUrl: string; videoTier: string; videoLanguages: string[];
  vaultUrl: string; isParent: boolean; locations: string[];
}
const ev: Vendor = { id:"",businessName:"",contactName:"",email:"",phone:"",websiteUrl:"",categoryId:"",tier:"local",marketId:"",logoUrl:"",adGraphicUrl:"",ctaText:"",destinationUrl:"",shortDescription:"",status:"pending",notes:"",address:"",city:"",state:"",zip:"",areasServed:[],tags:[],nowServing:[],videoUrl:"",videoTier:"",videoLanguages:[],vaultUrl:"",isParent:false,locations:[] };
function sp(t:string){return t.split(",").map(s=>s.trim()).filter(Boolean);}
export default function VendorEditPage(){
const params=useParams();const router=useRouter();const vid=params?.id as string;
const[form,setForm]=useState<Vendor>(ev);const[loading,setLoading]=useState(true);
const[saving,setSaving]=useState(false);const[error,setError]=useState("");
const[success,setSuccess]=useState("");const[at,setAt]=useState("");
const[tt,setTt]=useState("");const[nt,setNt]=useState("");const[vt,setVt]=useState("");
useEffect(()=>{if(!vid)return;fetch(`/api/admin/vendors/${vid}`).then(r=>r.json()).then(d=>{if(d.vendor){setForm(d.vendor);setAt((d.vendor.areasServed||[]).join(", "));setTt((d.vendor.tags||[]).join(", "));setNt((d.vendor.nowServing||[]).join(", "));setVt((d.vendor.videoLanguages||[]).join(", "));}else setError("Not found.");}).catch(()=>setError("Load failed.")).finally(()=>setLoading(false));},[vid]);
function hc(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>){const{name,value,type}=e.target;if(type==="checkbox")setForm(f=>({...f,[name]:(e.target as HTMLInputElement).checked}));else setForm(f=>({...f,[name]:value}));}
async function hs(e:React.FormEvent){e.preventDefault();setSaving(true);setError("");setSuccess("");
const p={...form,areasServed:sp(at),tags:sp(tt),nowServing:sp(nt),videoLanguages:sp(vt)};
try{const r=await fetch(`/api/admin/vendors/${vid}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(p)});const d=await r.json();if(!r.ok)throw new Error(d.error||"Failed");setForm(d.vendor);setAt((d.vendor.areasServed||[]).join(", "));setTt((d.vendor.tags||[]).join(", "));setNt((d.vendor.nowServing||[]).join(", "));setVt((d.vendor.videoLanguages||[]).join(", "));setSuccess("Saved!");}catch(err:any){setError(err.message||"Failed.");}finally{setSaving(false);}}
async function hd(){if(!confirm("Delete vendor?"))return;await fetch(`/api/admin/vendors/${vid}`,{method:"DELETE"});router.push("/admin/vendors");}
if(loading)return<div className="p-8">Loading...</div>;
const I=({n,v,l}:{n:string;v:string;l:string})=>(<div><label className="block text-sm font-medium mb-1">{l}</label><input name={n} value={v} onChange={hc} className="w-full border rounded px-3 py-2 text-sm"/></div>);
const T=({v,s,l}:{v:string;s:(v:string)=>void;l:string})=>(<div><label className="block text-sm font-medium mb-1">{l}</label><input value={v} onChange={e=>s(e.target.value)} className="w-full border rounded px-3 py-2 text-sm"/></div>);
return(<div className="max-w-3xl mx-auto p-8"><div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold">Edit Vendor</h1><button onClick={()=>router.push("/admin/vendors")} className="text-sm text-blue-600 hover:underline">Back</button></div>
{error&&<div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
{success&&<div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}
<form onSubmit={hs} className="space-y-4">
<section><h2 className="text-lg font-semibold mb-2 border-b pb-1">Business Info</h2><div className="grid grid-cols-2 gap-4"><I n="businessName" v={form.businessName} l="Business Name"/><I n="contactName" v={form.contactName} l="Contact Name"/><I n="email" v={form.email} l="Email"/><I n="phone" v={form.phone} l="Phone"/><I n="websiteUrl" v={form.websiteUrl} l="Website URL"/><I n="shortDescription" v={form.shortDescription} l="Short Description"/></div></section>
<section><h2 className="text-lg font-semibold mb-2 border-b pb-1">Address</h2><div className="grid grid-cols-2 gap-4"><div className="col-span-2"><I n="address" v={form.address} l="Street Address"/></div><I n="city" v={form.city} l="City"/><I n="state" v={form.state} l="State"/><I n="zip" v={form.zip} l="ZIP"/><T v={at} s={setAt} l="Areas Served (comma separated)"/></div></section>
<section><h2 className="text-lg font-semibold mb-2 border-b pb-1">Ad Settings</h2><div className="grid grid-cols-2 gap-4"><I n="categoryId" v={form.categoryId} l="Category ID"/><div><label className="block text-sm font-medium mb-1">Tier</label><select name="tier" value={form.tier} onChange={hc} className="w-full border rounded px-3 py-2 text-sm"><option value="local">Local</option><option value="regional">Regional</option><option value="national">National</option></select></div><I n="marketId" v={form.marketId} l="Market ID"/><div><label className="block text-sm font-medium mb-1">Status</label><select name="status" value={form.status} onChange={hc} className="w-full border rounded px-3 py-2 text-sm"><option value="pending">Pending</option><option value="active">Active</option><option value="inactive">Inactive</option></select></div><I n="logoUrl" v={form.logoUrl} l="Logo URL"/><I n="adGraphicUrl" v={form.adGraphicUrl} l="Ad Graphic URL"/><I n="ctaText" v={form.ctaText} l="CTA Text"/><I n="destinationUrl" v={form.destinationUrl} l="Destination URL"/></div></section>
<section><h2 className="text-lg font-semibold mb-2 border-b pb-1">Video</h2><div className="grid grid-cols-2 gap-4"><I n="videoUrl" v={form.videoUrl} l="Video URL"/><I n="videoTier" v={form.videoTier} l="Video Tier"/><T v={vt} s={setVt} l="Video Languages (comma separated)"/><I n="vaultUrl" v={form.vaultUrl} l="Vault URL"/></div></section>
<section><h2 className="text-lg font-semibold mb-2 border-b pb-1">Tags and Services</h2><div className="grid grid-cols-2 gap-4"><T v={tt} s={setTt} l="Tags (comma separated)"/><T v={nt} s={setNt} l="Now Serving (comma separated)"/><div className="flex items-center gap-2 mt-2"><input type="checkbox" name="isParent" id="isParent" checked={form.isParent} onChange={hc}/><label htmlFor="isParent" className="text-sm font-medium">Is Parent Vendor</label></div></div></section>
<section><h2 className="text-lg font-semibold mb-2 border-b pb-1">Notes</h2><textarea name="notes" value={form.notes} onChange={hc} rows={4} className="w-full border rounded px-3 py-2 text-sm"/></section>
<div className="flex items-center justify-between pt-4"><button type="button" onClick={hd} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Delete</button><button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50">{saving?"Saving...":"Save Vendor"}</button></div>
</form></div>);}
