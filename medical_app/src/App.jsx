
import React, { useState, useEffect, useContext, createContext, useCallback, useRef } from "react";
/* ============================================================
   API LAYER - all fetch calls in one place
   Change BASE_URL to point at your backend
   ============================================================ */
const BASE_URL="/api";

async function apiFetch(path,options={}){
  const res=await fetch(`${BASE_URL}${path}`,{
    headers:{"Content-Type":"application/json"},
    ...options
  });
  const json=await res.json();
  if(!res.ok||!json.success) throw new Error(json.message||`Error ${res.status}`);
  return json.data;
}

const api={
  getPatients:(params={})=>{
    const q=new URLSearchParams(params).toString();
    return apiFetch(`/patients${q?"?"+q:""}`);
  },
  registerPatient:(body)=>apiFetch("/patients",{method:"POST",body:JSON.stringify(body)}),
  verifyPatient:(id)=>apiFetch(`/patients/${id}/verify`,{method:"PUT"}),
  startConsultation:(id)=>apiFetch(`/patients/${id}/start`,{method:"PUT"}),
  completeConsultation:(id)=>apiFetch(`/patients/${id}/complete`,{method:"PUT"}),
};

function formatTurnEstimate(estimatedTime){
  if(!estimatedTime)return "Turn time not assigned";
  const match=String(estimatedTime).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if(!match)return `Turn expected at ${estimatedTime}`;
  let hours=Number(match[1])%12;
  if(match[3].toUpperCase()==="PM")hours+=12;
  const target=new Date();
  target.setHours(hours,Number(match[2]),0,0);
  const minutes=Math.round((target.getTime()-Date.now())/60000);
  if(minutes<=0)return "Turn expected now";
  if(minutes===1)return "Turn expected in 1 min";
  return `Turn expected in ${minutes} min`;
}

/* ============================================================
   useFetch hook - loading / error / auto-poll
   ============================================================ */
function useFetch(fn,interval=null){
  const[data,setData]=useState(null);
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState(null);
  const timer=useRef(null);
  const fnRef=useRef(fn);
  useEffect(()=>{fnRef.current=fn;},[fn]);
  const run=useCallback(async(silent=false)=>{
    if(!silent)setLoading(true);
    setError(null);
    try{const r=await fnRef.current();setData(r);}
    catch(e){setError(e.message);}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{
    run();
    if(interval)timer.current=setInterval(()=>run(true),interval);
    return()=>clearInterval(timer.current);
  },[interval,run]);
  return{data,loading,error,refetch:run};
}

/* ============================================================
   APP CONTEXT
   ============================================================ */
const AppCtx=createContext();
function AppProvider({children}){
  const[page,setPage]=useState("home");
  const[currentPatient,setCurrentPatient]=useState(null);
  const navigate=useCallback(p=>{setPage(p);window.scrollTo(0,0);},[]);
  return <AppCtx.Provider value={{page,navigate,currentPatient,setCurrentPatient}}>{children}</AppCtx.Provider>;
}
const useApp=()=>useContext(AppCtx);

/* ============================================================
   SHARED COMPONENTS
   ============================================================ */
const Icon=({d,size=20,stroke="currentColor",sw=2})=>(
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {[].concat(d).map((p,i)=><path key={i} d={p}/>)}
  </svg>
);
const IC={
  plus:"M12 4v16m8-8H4",
  check:"M5 13l4 4L19 7",
  arrow:"M9 5l7 7-7 7",
  users:["M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"],
  clock:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  checkc:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  user:["M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"],
  clip:["M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"],
  shield:"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  warn:"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  refresh:"M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  x:"M6 18L18 6M6 6l12 12",
  doc:["M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"],
};

function StatusBadge({status}){
  const m={
    waiting:{cls:"bw",dot:"da",label:"Waiting"},
    verified:{cls:"bvf",dot:"dv",label:"Verified"},
    "in-progress":{cls:"bp",dot:"db",label:"In Progress"},
    completed:{cls:"bc",dot:"de",label:"Completed"},
  };
  const s=m[status]||m.waiting;
  return <span className={`badge ${s.cls}`}><span className={`dot ${s.dot}`}/>{s.label}</span>;
}

function StatCard({label,value,color="teal",iconPath,loading}){
  return(
    <div className="card">
      <div className="sc">
        <div className={`si si${color[0]}`}><Icon d={iconPath} size={18}/></div>
        <div>
          {loading?<div className="skel" style={{width:"2.5rem",height:"1.5rem",marginBottom:".25rem"}}/>:<div className="sv">{value}</div>}
          <div className="sl">{label}</div>
        </div>
      </div>
    </div>
  );
}

function TableSkeleton({rows=4,cols=5}){
  return Array.from({length:rows}).map((_,i)=>(
    <tr key={i}>{Array.from({length:cols}).map((_,j)=>(
      <td key={j}><div className="skel" style={{height:"1rem",width:j===0?"3rem":"80%"}}/></td>
    ))}</tr>
  ));
}

function ErrorBanner({message,onRetry}){
  return(
    <div className="errb">
      <Icon d={IC.x} size={20} stroke="#be123c"/>
      <div style={{flex:1}}>
        <p><strong>Could not reach the backend</strong>{message}</p>
      </div>
      {onRetry&&<button className="btn bg bsm" onClick={onRetry} style={{flexShrink:0}}><Icon d={IC.refresh} size={14}/> Retry</button>}
    </div>
  );
}

function PollBadge(){
  return(
    <span className="pi">
      <span className="dot de" style={{animation:"pulse 2s infinite"}}/>
      Auto-refreshing
    </span>
  );
}

function Navbar(){
  const{navigate,page}=useApp();
  const links=[{label:"Home",p:"home"},{label:"Doctor",p:"doctorDash"},{label:"Compounder",p:"compounderDash"}];
  return(
    <nav className="navbar">
      <div className="mw7 ni">
        <div className="logo" onClick={()=>navigate("home")}>
          <div className="logo-ic"><Icon d={IC.plus} size={16} stroke="#fff" sw={2.5}/></div>
          <span className="logo-tx">MediQueue</span>
        </div>
        <div className="nav-links">
          {links.map(l=>(
            <button key={l.p} className={`nl ${page===l.p?"active":""}`} onClick={()=>navigate(l.p)}>{l.label}</button>
          ))}
          <button className="ncta" onClick={()=>navigate("form")}>Book Appointment</button>
        </div>
      </div>
    </nav>
  );
}

/* ============================================================
   PAGE: HOME
   ============================================================ */
function Home(){
  const{navigate}=useApp();
  const{data,loading}=useFetch(()=>api.getPatients());
  const wc=data?data.patients.filter(p=>p.status==="waiting").length:"-";
  const portals=[
    {title:"Patient",sub:"Book an appointment and track your queue",page:"form",color:"t",badge:"Book Now",bc:"pbt",ic:"pit",cc:"pct",ac:"pat",icon:IC.user},
    {title:"Doctor",sub:"Manage patient queue and update consultation status",page:"doctorDash",color:"b",badge:"Staff",bc:"pbb",ic:"pib",cc:"pcb",ac:"pab",icon:IC.clip},
    {title:"Compounder",sub:"Verify patients and manage arrival check-in",page:"compounderDash",color:"v",badge:"Staff",bc:"pbv",ic:"piv",cc:"pcv",ac:"pav",icon:IC.shield},
  ];
  return(
    <div className="fadein">
      <Navbar/>
      <div className="hero">
        <div className="hb1"/><div className="hb2"/>
        <div className="hc mw7">
          <div className="hpill">
            <span className="dot de"/>
            {loading?"Loading...":`System Online - ${wc} patient${wc!==1?"s":""} waiting`}
          </div>
          <h1 className="htitle">Smart Medical<br/><span className="hacc">Appointment System</span></h1>
          <p className="hsub">A unified platform for patients, doctors, and staff - real-time queue tracking powered by live backend APIs.</p>
          <button className="btn bt" style={{fontSize:"1rem",padding:".875rem 2rem"}} onClick={()=>navigate("form")}>
            Book an Appointment <Icon d={IC.arrow} size={16} stroke="#fff" sw={2.5}/>
          </button>
        </div>
      </div>
      <div className="mw7" style={{paddingBlock:"4rem"}}>
        <p style={{fontSize:"1.25rem",fontWeight:800,color:"#374151",textAlign:"center",marginBottom:".5rem"}}>Select Your Portal</p>
        <p style={{fontSize:".875rem",color:"#94a3b8",textAlign:"center",marginBottom:"2.5rem"}}>Choose your role to access the live dashboard</p>
        <div className="pgrid">
          {portals.map(p=>(
            <div key={p.title} className={`pcard ${p.cc}`} onClick={()=>navigate(p.page)}>
              <div className="ptop">
                <div className={`pic ${p.ic}`}><Icon d={p.icon} size={24}/></div>
                <span className={`pbadge ${p.bc}`}>{p.badge}</span>
              </div>
              <div><div className="ptitle">{p.title} Portal</div><div className="psub">{p.sub}</div></div>
              <div className={`parr ${p.ac}`}>Enter Portal <Icon d={IC.arrow} size={14} sw={2.5}/></div>
            </div>
          ))}
        </div>
      </div>
      <div className="sstrip">
        <div className="mw7 sgrid">
          {[{v:"47",l:"Patients Today"},{v:"18 min",l:"Avg. Wait Time"},{v:"6",l:"Doctors On Duty"},{v:"12",l:"Departments"}].map(s=>(
            <div key={s.l}><div className="sv2">{s.v}</div><div className="sl2">{s.l}</div></div>
          ))}
        </div>
      </div>
      <footer>2026 MediQueue - connected to live backend at {BASE_URL}</footer>
    </div>
  );
}

/* ============================================================
   PAGE: PATIENT FORM -> POST /api/patients
   ============================================================ */
const DEPTS=["General Medicine","Cardiology","Orthopedics","Dermatology","Endocrinology","Neurology","Pediatrics","ENT"];

function FF({label,error,children}){
  return(
    <div>
      <label className="fl">{label}</label>
      {children}
      {error&&<p className="fe">{error}</p>}
    </div>
  );
}

function PatientForm(){
  const{navigate,setCurrentPatient}=useApp();
  const[step,setStep]=useState(1);
  const[submitting,setSubmitting]=useState(false);
  const[submitErr,setSubmitErr]=useState(null);
  const[done,setDone]=useState(false);
  const[form,setForm]=useState({name:"",age:"",symptoms:"",department:"General Medicine"});
  const[errors,setErrors]=useState({});

  const validate=()=>{
    const e={};
    if(!form.name.trim()) e.name="Full name is required";
    if(!form.age||+form.age<1||+form.age>130) e.age="Enter a valid age (1-130)";
    if(form.symptoms.trim().length<5) e.symptoms="Describe symptoms (min 5 characters)";
    return e;
  };
  const set=(k,v)=>{setForm(f=>({...f,[k]:v}));setErrors(e=>({...e,[k]:undefined}));};
  const next=()=>{
    if(step===1){const e=validate();if(Object.keys(e).length){setErrors(e);return;}}
    setStep(s=>s+1);
  };

  /* POST request to backend */
  const submit=async()=>{
    setSubmitting(true);setSubmitErr(null);
    try{
      const patient=await api.registerPatient({
        name:form.name.trim(),
        age:Number(form.age),
        symptoms:form.symptoms.trim(),
        department:form.department,
      });
      setCurrentPatient(patient);
      setDone(true);
      setTimeout(()=>navigate("patientDash"),1500);
    }catch(err){
      setSubmitErr(err.message);
    }finally{
      setSubmitting(false);
    }
  };

  const sl=["Personal Info","Department","Confirm"];
  return(
    <div className="fadein">
      <Navbar/>
      <div className="mw2" style={{paddingBlock:"3rem"}}>
        <div style={{marginBottom:"2rem"}}>
          <h1 style={{fontSize:"1.875rem",fontWeight:900,color:"#0f172a",letterSpacing:"-.03em",marginBottom:".25rem"}}>Book Appointment</h1>
          <p style={{fontSize:".875rem",color:"#64748b"}}>Priority is auto-assigned by the backend based on age and symptoms</p>
        </div>
        {/* Progress */}
        <div className="steps">
          {sl.map((label,i)=>(
            <React.Fragment key={label}>
              <div className={`sdot ${step>i+1?"sdone":step===i+1?"sact":"sidle"}`}>
                {step>i+1?<Icon d={IC.check} size={12} stroke="#fff" sw={3}/>:i+1}
              </div>
              <span className={`slabel ${step===i+1?"":"slabelidle"}`}>{label}</span>
              {i<2&&<div className={`sline ${step>i+1?"slinedone":""}`}/>}
            </React.Fragment>
          ))}
        </div>
        {submitErr&&<ErrorBanner message={submitErr} onRetry={()=>setSubmitErr(null)}/>}
        <div className="card" style={{borderRadius:"1.25rem",overflow:"hidden"}}>
          <div style={{padding:"2rem"}}>
            {done?(
              <div style={{textAlign:"center",padding:"2rem 0"}}>
                <div className="suc2"><Icon d={IC.check} size={32} stroke="#059669" sw={2.5}/></div>
                <p style={{fontSize:"1.25rem",fontWeight:800,color:"#0f172a",marginBottom:".5rem"}}>Appointment Booked!</p>
                <p style={{fontSize:".875rem",color:"#64748b"}}>Redirecting to your dashboard...</p>
              </div>
            ):step===1?(
              <div style={{display:"flex",flexDirection:"column",gap:"1.25rem"}}>
                <p style={{fontSize:"1.0625rem",fontWeight:800,color:"#374151"}}>Personal Information</p>
                <FF label="Full Name" error={errors.name}>
                  <input className={`fi ${errors.name?"err":""}`} type="text" placeholder="e.g. Rahul Sharma"
                    value={form.name} onChange={e=>set("name",e.target.value)}/>
                </FF>
                <FF label="Age" error={errors.age}>
                  <input className={`fi ${errors.age?"err":""}`} type="number" placeholder="e.g. 34"
                    value={form.age} onChange={e=>set("age",e.target.value)}/>
                </FF>
                <FF label="Describe Your Symptoms" error={errors.symptoms}>
                  <textarea className={`fi ${errors.symptoms?"err":""}`} rows={4}
                    placeholder="Describe what you are experiencing... (min 5 characters)"
                    value={form.symptoms} onChange={e=>set("symptoms",e.target.value)}/>
                </FF>
                <div style={{background:"#f0fdfa",border:"1px solid #99f6e4",borderRadius:".75rem",padding:".75rem 1rem",fontSize:".8125rem",color:"#0f766e"}}>
                  Priority (normal / high / emergency) is auto-assigned by the backend based on your age and symptoms.
                </div>
              </div>
            ):step===2?(
              <div style={{display:"flex",flexDirection:"column",gap:"1.25rem"}}>
                <p style={{fontSize:"1.0625rem",fontWeight:800,color:"#374151"}}>Select Department</p>
                <FF label="Department">
                  <select className="fi" value={form.department} onChange={e=>set("department",e.target.value)}>
                    {DEPTS.map(d=><option key={d}>{d}</option>)}
                  </select>
                </FF>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
                <p style={{fontSize:"1.0625rem",fontWeight:800,color:"#374151"}}>Confirm Your Details</p>
                <div style={{background:"#f8fafc",borderRadius:".75rem",border:"1px solid #e2e8f0",overflow:"hidden"}}>
                  {[{l:"Name",v:form.name},{l:"Age",v:`${form.age} years`},{l:"Department",v:form.department},{l:"Symptoms",v:form.symptoms},{l:"Priority",v:"Auto-assigned by server"}].map(r=>(
                    <div key={r.l} className="dr">
                      <span className="dl">{r.l}</span>
                      <span className="dv2" style={r.l==="Priority"?{color:"#94a3b8",fontStyle:"italic"}:{}}>{r.v}</span>
                    </div>
                  ))}
                </div>
                <p style={{fontSize:".75rem",color:"#94a3b8"}}>By confirming, you agree all information is accurate.</p>
              </div>
            )}
          </div>
          {!done&&(
            <div style={{borderTop:"1px solid #f1f5f9",padding:"1.25rem 2rem",background:"#f8fafc",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              {step>1?<button className="btn bg" onClick={()=>setStep(s=>s-1)} disabled={submitting}>Back</button>:<div/>}
              {step<3
                ?<button className="btn bt" onClick={next}>Continue</button>
                :<button className="btn bt" onClick={submit} disabled={submitting}>
                  {submitting?<><span className="spin"/>Submitting...</>:"Confirm and Book"}
                </button>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PAGE: PATIENT DASHBOARD
   GET /api/patients - polls every 15s
   ============================================================ */
function PatientDashboard(){
  const{currentPatient,navigate}=useApp();
  const{data,loading,error,refetch}=useFetch(()=>api.getPatients(),15000);
  const patients=data?.patients??[];
  const patient=currentPatient
    ?patients.find(p=>p.id===currentPatient.id)||currentPatient
    :patients.find(p=>p.status==="waiting");
  const patientTime=patient?.registeredAt?new Date(patient.registeredAt).getTime():Number.POSITIVE_INFINITY;
  const waitingBefore=patients.filter(p=>p.status!=="completed"&&new Date(p.registeredAt||0).getTime()<patientTime).length;
  const queueList=patients.filter(p=>p.status!=="completed");
  return(
    <div className="fadein">
      <Navbar/>
      <div className="mw4" style={{paddingBlock:"2.5rem"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"2rem",flexWrap:"wrap",gap:"1rem"}}>
          <div>
            <h1 style={{fontSize:"1.5rem",fontWeight:900,color:"#0f172a",letterSpacing:"-.02em"}}>My Appointment</h1>
            <div style={{display:"flex",alignItems:"center",gap:".75rem",marginTop:".25rem"}}>
              <p style={{fontSize:".8125rem",color:"#94a3b8"}}>{new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
              <PollBadge/>
            </div>
          </div>
          <button className="btn bg bsm" onClick={()=>navigate("form")}>+ New Appointment</button>
        </div>
        {error&&<ErrorBanner message={error} onRetry={refetch}/>}
        {loading&&!patient&&(
          <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,2fr)",gap:"1.5rem",marginBottom:"2rem"}}>
            <div style={{borderRadius:"1.25rem",background:"linear-gradient(135deg,#0d9488,#0f766e)",padding:"2rem",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div className="skel" style={{width:"5rem",height:"6rem",background:"rgba(255,255,255,.15)"}}/>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
              <div className="card" style={{padding:"1.5rem"}}><div className="skel" style={{height:"8rem"}}/></div>
              <div className="card" style={{padding:"1.5rem"}}><div className="skel" style={{height:"3rem"}}/></div>
            </div>
          </div>
        )}
        {patient&&(
          <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,2fr)",gap:"1.5rem",marginBottom:"2rem"}}>
            <div className="tcard">
              <div className="tlabel">Your Token</div>
              <div className="tnum">{patient.token}</div>
              <div style={{marginTop:"1rem"}}><StatusBadge status={patient.status}/></div>
              {patient.priority==="emergency"&&<span className="badge bu" style={{marginTop:".5rem"}}>EMERGENCY</span>}
              {patient.priority==="high"&&<span className="badge bu" style={{marginTop:".5rem"}}>High Priority</span>}
              <div style={{fontSize:".875rem",fontWeight:700,marginTop:"1rem"}}>{formatTurnEstimate(patient.estimatedTime)}</div>
              <div className="thint">Keep this token for reference</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
              <div className="card" style={{padding:"1.5rem"}}>
                <p style={{fontSize:".7rem",fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:".08em",marginBottom:"1rem"}}>Appointment Details</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
                  {[{l:"Name",v:patient.name},{l:"Age",v:`${patient.age} years`},{l:"Department",v:patient.department},{l:"Priority",v:patient.priority},{l:"Estimated Time",v:patient.estimatedTime},{l:"Turn Status",v:formatTurnEstimate(patient.estimatedTime)},{l:"Ahead of you",v:waitingBefore}].map(r=>(
                    <div key={r.l}>
                      <p style={{fontSize:".75rem",color:"#94a3b8",fontWeight:500,marginBottom:".125rem"}}>{r.l}</p>
                      <p style={{fontSize:".875rem",fontWeight:700,color:"#0f172a",textTransform:r.l==="Priority"?"capitalize":""}}>{r.v}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card" style={{padding:"1.5rem"}}>
                <p style={{fontSize:".7rem",fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:".08em",marginBottom:".75rem"}}>Reported Symptoms</p>
                <p style={{fontSize:".875rem",color:"#374151",lineHeight:1.6}}>{patient.symptoms}</p>
              </div>
            </div>
          </div>
        )}
        {!loading&&!patient&&!error&&(
          <div className="card" style={{padding:"3rem",textAlign:"center",marginBottom:"2rem"}}>
            <div style={{width:"3.5rem",height:"3.5rem",background:"#f1f5f9",borderRadius:"9999px",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1rem"}}>
              <Icon d={IC.doc} size={24} stroke="#94a3b8" sw={1.5}/>
            </div>
            <p style={{fontWeight:700,color:"#374151"}}>No active appointment</p>
            <p style={{fontSize:".875rem",color:"#94a3b8",marginTop:".25rem"}}>Book an appointment to see your queue status</p>
            <button className="btn bt" style={{marginTop:"1rem"}} onClick={()=>navigate("form")}>Book Now</button>
          </div>
        )}
        <div className="card" style={{overflow:"hidden"}}>
          <div style={{padding:"1rem 1.5rem",borderBottom:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontWeight:700,color:"#374151"}}>Live Queue</span>
            <span style={{fontSize:".75rem",color:"#94a3b8"}}>{queueList.length} remaining</span>
          </div>
          {loading&&queueList.length===0
            ?<div style={{padding:"1rem"}}>{[1,2,3].map(i=><div key={i} className="skel" style={{height:"3rem",marginBottom:".5rem",borderRadius:".5rem"}}/>)}</div>
            :queueList.length===0
              ?<div style={{padding:"2.5rem",textAlign:"center",color:"#94a3b8",fontSize:".875rem"}}>Queue is empty</div>
              :queueList.map(p=>(
                <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:".875rem 1.5rem",borderBottom:"1px solid #f8fafc",background:p.id===patient?.id?"#f0fdfa":""}}>
                  <div style={{display:"flex",alignItems:"center",gap:"1rem"}}>
                    <span style={{fontWeight:900,fontSize:".875rem",color:p.id===patient?.id?"#0d9488":"#94a3b8"}}>{p.token}</span>
                    <div>
                      <p style={{fontSize:".875rem",fontWeight:600,color:"#1e293b"}}>{p.id===patient?.id?`${p.name} (You)`:p.name}</p>
                      <p style={{fontSize:".75rem",color:"#94a3b8"}}>{p.department}</p>
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:"1rem"}}>
                    <span style={{fontSize:".75rem",color:"#94a3b8"}}>{p.estimatedTime}</span>
                    <StatusBadge status={p.status}/>
                  </div>
                </div>
              ))
          }
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PAGE: DOCTOR DASHBOARD
   GET /api/patients - polls every 10s
   PUT /patients/:id/start  and  PUT /patients/:id/complete
   ============================================================ */
function DoctorDashboard(){
  const[filter,setFilter]=useState("all");
  const[search,setSearch]=useState("");
  const[actErr,setActErr]=useState(null);
  const[actLoad,setActLoad]=useState(null);
  const{data,loading,error,refetch}=useFetch(()=>api.getPatients(),10000);
  const patients=data?.patients??[];
  const waiting=patients.filter(p=>p.status==="waiting").length;
  const inProg=patients.filter(p=>p.status==="in-progress").length;
  const done=patients.filter(p=>p.status==="completed").length;
  const filtered=patients.filter(p=>{
    const mf=filter==="all"||p.status===filter;
    const ms=p.name.toLowerCase().includes(search.toLowerCase())||p.token.toLowerCase().includes(search.toLowerCase());
    return mf&&ms;
  });

  const handleAction=async(p)=>{
    const m={verified:()=>api.startConsultation(p.id),"in-progress":()=>api.completeConsultation(p.id)};
    const fn=m[p.status];if(!fn)return;
    setActLoad(p.id);setActErr(null);
    try{await fn();await refetch();}
    catch(e){setActErr(`${p.token}: ${e.message}`);}
    finally{setActLoad(null);}
  };

  const ABTN={
    waiting:{label:"Not Verified Yet",cls:"bg"},
    verified:{label:"Start Consultation",cls:"bb"},
    "in-progress":{label:"Mark Complete",cls:"be"},
    completed:{label:"Done",cls:"bg"},
  };

  return(
    <div className="fadein">
      <Navbar/>
      <div className="mw7" style={{paddingBlock:"2.5rem"}}>
        <div style={{marginBottom:"2rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:".75rem",marginBottom:".25rem"}}>
            <div className="dhicon" style={{background:"#2563eb"}}><Icon d={IC.clip} size={18} stroke="#fff" sw={2}/></div>
            <h1 style={{fontSize:"1.5rem",fontWeight:900,color:"#0f172a",letterSpacing:"-.02em"}}>Doctor Dashboard</h1>
            <PollBadge/>
          </div>
          <p style={{fontSize:".8125rem",color:"#94a3b8",marginLeft:"3rem"}}>Dr. Anil Kapoor - live data from backend API</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1rem",marginBottom:"2rem"}}>
          <StatCard label="Total" value={patients.length} color="t" iconPath={IC.users} loading={loading}/>
          <StatCard label="Waiting" value={waiting} color="a" iconPath={IC.clock} loading={loading}/>
          <StatCard label="In Progress" value={inProg} color="b" iconPath={IC.user} loading={loading}/>
          <StatCard label="Completed" value={done} color="e" iconPath={IC.checkc} loading={loading}/>
        </div>
        {error&&<ErrorBanner message={error} onRetry={refetch}/>}
        {actErr&&<ErrorBanner message={actErr} onRetry={()=>setActErr(null)}/>}
        <div className="card" style={{overflow:"hidden"}}>
          <div style={{padding:"1rem 1.5rem",borderBottom:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:".75rem"}}>
            <div style={{display:"flex",gap:".5rem",flexWrap:"wrap"}}>
              {["all","waiting","verified","in-progress","completed"].map(f=>(
                <button key={f} className={`fpill ${filter===f?"active":"idle"}`} onClick={()=>setFilter(f)}>
                  {f==="in-progress"?"In Progress":f[0].toUpperCase()+f.slice(1)}
                </button>
              ))}
            </div>
            <input className="si2" placeholder="Search by name or token..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div style={{overflowX:"auto"}}>
            <table>
              <thead><tr><th>Token</th><th>Patient</th><th>Department</th><th>Symptoms</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {loading?<TableSkeleton rows={5} cols={6}/>
                  :filtered.length===0?<tr><td colSpan={6} style={{textAlign:"center",padding:"3rem",color:"#94a3b8"}}>No patients match the filter</td></tr>
                  :filtered.map(p=>{
                    const btn=ABTN[p.status];
                    const isLoad=actLoad===p.id;
                    const canAct=p.status==="verified"||p.status==="in-progress";
                    return(
                      <tr key={p.id} className={p.priority==="emergency"||p.priority==="high"?"pribar":""}>
                        <td>
                          <span style={{fontWeight:900,color:"#374151"}}>{p.token}</span>
                          {p.priority==="emergency"&&<span className="badge bu" style={{marginLeft:".5rem"}}>EMERG</span>}
                          {p.priority==="high"&&<span className="badge bu" style={{marginLeft:".5rem"}}>Urgent</span>}
                        </td>
                        <td>
                          <p style={{fontWeight:600,color:"#1e293b"}}>{p.name}</p>
                          <p style={{fontSize:".75rem",color:"#94a3b8"}}>{p.age} yrs / {p.estimatedTime}</p>
                        </td>
                        <td style={{color:"#475569"}}>{p.department}</td>
                        <td style={{color:"#64748b",maxWidth:"14rem"}}>
                          <span style={{display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{p.symptoms}</span>
                        </td>
                        <td><StatusBadge status={p.status}/></td>
                        <td>
                          <button className={`btn bsm ${btn.cls}`} onClick={()=>handleAction(p)} disabled={!canAct||isLoad}>
                            {isLoad?<><span className="spin" style={{width:".875rem",height:".875rem"}}/>Loading...</>:btn.label}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PAGE: COMPOUNDER DASHBOARD
   GET /api/patients - polls every 10s
   PUT /patients/:id/verify
   ============================================================ */
function CompounderDashboard(){
  const[filter,setFilter]=useState("all");
  const[search,setSearch]=useState("");
  const[actLoad,setActLoad]=useState(null);
  const[actErr,setActErr]=useState(null);
  const[actOk,setActOk]=useState(null);
  const{data,loading,error,refetch}=useFetch(()=>api.getPatients(),10000);
  const patients=data?.patients??[];
  const verified=patients.filter(p=>p.status!=="waiting").length;
  const pending=patients.filter(p=>p.status==="waiting").length;
  const highPrio=patients.filter(p=>p.priority==="high"||p.priority==="emergency").length;
  const filtered=patients.filter(p=>{
    const mf=filter==="all"||(filter==="pending"&&p.status==="waiting")||(filter==="verified"&&p.status!=="waiting")||(filter==="urgent"&&(p.priority==="high"||p.priority==="emergency"));
    const ms=p.name.toLowerCase().includes(search.toLowerCase())||p.token.toLowerCase().includes(search.toLowerCase());
    return mf&&ms;
  });

  const handleVerify=async(p)=>{
    setActLoad(p.id);setActErr(null);setActOk(null);
    try{
      await api.verifyPatient(p.id);
      setActOk(`${p.token} - ${p.name} verified successfully`);
      await refetch();
      setTimeout(()=>setActOk(null),3000);
    }catch(e){setActErr(`${p.token}: ${e.message}`);}
    finally{setActLoad(null);}
  };

  return(
    <div className="fadein">
      <Navbar/>
      <div className="mw7" style={{paddingBlock:"2.5rem"}}>
        <div style={{marginBottom:"2rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:".75rem",marginBottom:".25rem"}}>
            <div className="dhicon" style={{background:"#7c3aed"}}><Icon d={IC.shield} size={18} stroke="#fff" sw={2}/></div>
            <h1 style={{fontSize:"1.5rem",fontWeight:900,color:"#0f172a",letterSpacing:"-.02em"}}>Compounder Dashboard</h1>
            <PollBadge/>
          </div>
          <p style={{fontSize:".8125rem",color:"#94a3b8",marginLeft:"3rem"}}>Patient verification and arrival management - live from backend</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1rem",marginBottom:"2rem"}}>
          <StatCard label="Total Registered" value={patients.length} color="t" iconPath={IC.users} loading={loading}/>
          <StatCard label="Verified / Past" value={verified} color="e" iconPath={IC.checkc} loading={loading}/>
          <StatCard label="Pending" value={pending} color="a" iconPath={IC.clock} loading={loading}/>
          <StatCard label="High / Emergency" value={highPrio} color="r" iconPath={IC.warn} loading={loading}/>
        </div>
        {pending>0&&(
          <div className="alert">
            <Icon d={IC.warn} size={18} stroke="#d97706" sw={2}/>
            <p className="at"><strong>{pending} patient{pending>1?"s":""}</strong> waiting for verification. Please verify arrival before they see the doctor.</p>
          </div>
        )}
        {error&&<ErrorBanner message={error} onRetry={refetch}/>}
        {actErr&&<ErrorBanner message={actErr} onRetry={()=>setActErr(null)}/>}
        {actOk&&<div className="sucb"><Icon d={IC.checkc} size={18} stroke="#15803d"/><p>{actOk}</p></div>}
        <div className="card" style={{overflow:"hidden"}}>
          <div style={{padding:"1rem 1.5rem",borderBottom:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:".75rem"}}>
            <div style={{display:"flex",gap:".5rem",flexWrap:"wrap"}}>
              {["all","pending","verified","urgent"].map(f=>(
                <button key={f} className={`fpill ${filter===f?"active":"idle"}`} onClick={()=>setFilter(f)}>
                  {f[0].toUpperCase()+f.slice(1)}
                </button>
              ))}
            </div>
            <input className="si2" placeholder="Search patient or token..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div className="pcgrid">
            {loading
              ?Array.from({length:4}).map((_,i)=>(
                <div key={i} className="pccard pcd">
                  <div className="skel" style={{height:"1.5rem",marginBottom:".75rem"}}/>
                  <div className="skel" style={{height:"1rem",marginBottom:".5rem"}}/>
                  <div className="skel" style={{height:"2rem"}}/>
                </div>
              ))
              :filtered.length===0
                ?<div style={{gridColumn:"1/-1",padding:"3rem",textAlign:"center",color:"#94a3b8",fontSize:".875rem"}}>No patients found</div>
                :filtered.map(p=>(
                  <PVCard key={p.id} patient={p} onVerify={()=>handleVerify(p)} isLoad={actLoad===p.id}/>
                ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}

function PVCard({patient:p,onVerify,isLoad}){
  const isV=p.status!=="waiting";
  const isU=p.priority==="emergency"||p.priority==="high";
  const cc=isV?"pcv2":isU?"pcu":"pcd";
  return(
    <div className={`pccard ${cc}`}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:".75rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:".5rem"}}>
          <span style={{fontSize:"1.125rem",fontWeight:900,color:"#1e293b"}}>{p.token}</span>
          {p.priority==="emergency"&&<span className="badge bu" style={{fontSize:".6rem"}}>EMERG</span>}
          {p.priority==="high"&&<span className="badge bu">Urgent</span>}
        </div>
        {isV?<span className="badge bok"><Icon d={IC.check} size={10} stroke="#065f46" sw={3}/>Verified</span>
           :<span className="badge bw">Pending</span>}
      </div>
      <p style={{fontWeight:700,color:"#1e293b",fontSize:".9375rem",marginBottom:".125rem"}}>{p.name}</p>
      <p style={{fontSize:".75rem",color:"#64748b",marginBottom:".375rem"}}>
        {p.age} yrs / {p.department}
        {p.priority!=="normal"&&<span style={{marginLeft:".375rem",fontWeight:600,color:p.priority==="emergency"?"#b91c1c":"#b45309",textTransform:"capitalize"}}> / {p.priority}</span>}
      </p>
      <p style={{fontSize:".75rem",color:"#94a3b8",marginBottom:"1rem",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{p.symptoms}</p>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontSize:".75rem",color:"#94a3b8"}}>ETA: {p.estimatedTime}</span>
        {!isV&&(
          <button className="btn bv bsm" onClick={onVerify} disabled={isLoad}>
            {isLoad?<><span className="spin" style={{width:".75rem",height:".75rem"}}/>Verifying...</>:"Verify Arrival"}
          </button>
        )}
        {isV&&<StatusBadge status={p.status}/>}
      </div>
    </div>
  );
}

/* ============================================================
   ROOT
   ============================================================ */
function Router(){
  const{page}=useApp();
  const pages={home:<Home/>,form:<PatientForm/>,patientDash:<PatientDashboard/>,doctorDash:<DoctorDashboard/>,compounderDash:<CompounderDashboard/>};
  return pages[page]||<Home/>;
}
export default function App(){ return <AppProvider><Router/></AppProvider>; }

