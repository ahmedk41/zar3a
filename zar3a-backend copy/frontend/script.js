const b = () => document.getElementById("baseUrl").value;

function show(id,data,ok){
  const el=document.getElementById(id);
  el.textContent=JSON.stringify(data,null,2);
  el.className="res show "+(ok?"ok":"err");
}

async function api(method,path,body){
  const res=await fetch(b()+path,{
    method,
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(body)
  });

  const data=await res.json().catch(()=>({}));
  return {ok:res.ok,data};
}

async function regUser(){
  const {ok,data}=await api("POST","/auth/register",{
    fullName:document.getElementById("rp_n").value,
    email:document.getElementById("rp_e").value,
    password:document.getElementById("rp_p").value,
    role:document.getElementById("rp_role").value
  });

  show("rp_res",data,ok);
}

async function doLogin(){
  const {ok,data}=await api("POST","/auth/login",{
    email:document.getElementById("li_e").value,
    password:document.getElementById("li_p").value
  });

  show("li_r",data,ok);
}