(() => {
  "use strict";
  const STORAGE_KEY="78daruma-waitlist";
  const endpoint=(window.NANAHACHI_WAITLIST_ENDPOINT||"").trim();
  const forms=[...document.querySelectorAll("[data-waitlist-form]")];
  if(!forms.length)return;

  const read=()=>{try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]")}catch{return []}};
  const write=entries=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(entries))}catch{}};
  const validEmail=email=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const setMessage=(form,text,type="")=>{
    const message=form.querySelector(".waitlist-message");
    if(!message)return;
    message.textContent=text;
    message.classList.toggle("is-success",type==="success");
    message.classList.toggle("is-error",type==="error");
  };
  const collect=form=>{
    const data=new FormData(form);
    return {
      email:String(data.get("email")||"").trim(),
      item:String(data.get("item")||form.dataset.item||"collection").trim(),
      finish:String(data.get("finish")||"").trim(),
      size:String(data.get("size")||"").trim(),
      source:location.pathname.split("/").pop()||"index.html",
      createdAt:new Date().toISOString()
    };
  };
  const saveLocal=entry=>{
    const entries=read();
    const index=entries.findIndex(item=>item.email.toLowerCase()===entry.email.toLowerCase()&&item.item===entry.item&&item.size===entry.size);
    if(index>=0)entries[index]={...entries[index],...entry,updatedAt:new Date().toISOString()};
    else entries.push(entry);
    write(entries);
  };
  const sendRemote=async entry=>{
    if(!endpoint)return false;
    const isGoogleScript=/script\.google\.com|script\.googleusercontent\.com/.test(endpoint);
    if(isGoogleScript){
      await fetch(endpoint,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(entry)});
      return true;
    }
    const response=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(entry)});
    if(!response.ok)throw new Error("waitlist endpoint failed");
    return true;
  };

  forms.forEach(form=>form.addEventListener("submit",async event=>{
    event.preventDefault();
    const entry=collect(form);
    const button=form.querySelector("button[type='submit']");
    if(!validEmail(entry.email)){setMessage(form,"メールアドレスをご確認ください。","error");return}
    if(!endpoint){setMessage(form,"登録先の設定がまだ完了していません。Google Sheets接続後に登録できます。","error");return}
    button?.setAttribute("disabled","true");
    setMessage(form,"登録しています。");
    try{
      saveLocal(entry);
      const sent=await sendRemote(entry);
      if(!sent)throw new Error("waitlist endpoint missing");
      setMessage(form,"登録しました。販売開始時にメールでお知らせします。","success");
      const emailInput=form.querySelector("input[name='email']");
      if(emailInput)emailInput.value="";
    }catch{
      setMessage(form,"送信できませんでした。時間をおいてもう一度お試しください。","error");
    }finally{
      button?.removeAttribute("disabled");
    }
  }));
})();
