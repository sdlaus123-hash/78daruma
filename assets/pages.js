document.documentElement.classList.add("js");
(() => {
  "use strict";
  const root=document.documentElement;
  const header=document.querySelector(".header");
  const menuButton=document.querySelector(".menu-button");
  const menu=document.querySelector(".mobile-menu");
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");

  document.querySelector(".breadcrumb")?.setAttribute("aria-label","パンくず");
  menu?.querySelector("nav")?.setAttribute("aria-label","モバイルナビゲーション");

  document.querySelectorAll(".page-hero h1").forEach(heading=>{
    const lines=heading.innerHTML.split(/<br\s*\/?>/i);
    heading.innerHTML=lines.map(line=>`<span class="hero-line"><span>${line}</span></span>`).join("");
  });

  const motionItems=new Set();
  const register=(selector,type)=>{
    document.querySelectorAll(selector).forEach((element,index)=>{
      element.classList.add("motion-item",`motion-${type}`);
      element.style.setProperty("--motion-delay",`${Math.min(index%6,5)*65}ms`);
      motionItems.add(element);
    });
  };

  register(".gallery-item,.collection-card__media,.home-interior,.product-visual,.visual-stage,.scene","media");
  register(".rule,.timeline-item,.detail-row,.faq-item","row");
  register(".form .field,.form .btn,.choice,.size-choice","control");
  register(".section .label,.section .heading,.section blockquote,.section .body-copy,.next h2,.collection-card__body > *,.home-statement h1,.product-info > *,.founder-story > p,.founder-profile,.prelaunch-panel > *,.footer-logo,.footer-links > div","copy");
  document.querySelectorAll("[data-reveal]").forEach(element=>{
    const isGroup=element.matches(".rule-list,.timeline,.details-list,.faq-list,.gallery-grid,.form,.product-info");
    if(!isGroup&&!element.querySelector(".motion-item")&&!motionItems.has(element)){
      element.classList.add("motion-item","motion-copy");
      motionItems.add(element);
    }
  });

  if(reduced.matches||!("IntersectionObserver"in window)){
    motionItems.forEach(element=>element.classList.add("is-in"));
  }else{
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      entry.target.classList.add("is-in");
      observer.unobserve(entry.target);
    }),{threshold:.12,rootMargin:"0px 0px -6%"});
    motionItems.forEach(element=>observer.observe(element));
  }

  requestAnimationFrame(()=>requestAnimationFrame(()=>root.classList.add("page-ready")));
  addEventListener("pageshow",()=>root.classList.remove("page-leaving"));

  let scrollFrame=0;
  const renderScroll=()=>{
    header?.classList.toggle("scrolled",scrollY>24);
    scrollFrame=0;
  };
  addEventListener("scroll",()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(renderScroll)},{passive:true});
  renderScroll();

  document.querySelectorAll(".faq-question").forEach(button=>{
    const panel=document.getElementById(button.getAttribute("aria-controls"));
    panel?.setAttribute("aria-hidden","true");
    button.addEventListener("click",()=>{
      const open=button.getAttribute("aria-expanded")==="true";
      document.querySelectorAll(".faq-question[aria-expanded='true']").forEach(other=>{
        other.setAttribute("aria-expanded","false");
        document.getElementById(other.getAttribute("aria-controls"))?.setAttribute("aria-hidden","true");
      });
      button.setAttribute("aria-expanded",String(!open));
      panel?.setAttribute("aria-hidden",String(open));
    });
  });

  document.querySelectorAll("a[href]").forEach(link=>link.addEventListener("click",event=>{
    if(reduced.matches||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.target||link.hasAttribute("download"))return;
    const raw=link.getAttribute("href");
    if(!raw||raw.startsWith("#")||raw.startsWith("mailto:")||raw.startsWith("tel:"))return;
    const destination=new URL(link.href,location.href);
    if(destination.protocol!==location.protocol||!destination.pathname.endsWith(".html"))return;
    event.preventDefault();
    root.classList.add("page-leaving");
    setTimeout(()=>{location.href=destination.href},560);
  }));

  if(menuButton&&menu){
    const selector="a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled])";
    let previous=null;
    const setMenu=open=>{
      menuButton.setAttribute("aria-expanded",String(open));
      menuButton.setAttribute("aria-label",open?"メニューを閉じる":"メニューを開く");
      menu.setAttribute("aria-hidden",String(!open));
      menu.classList.toggle("open",open);
      document.body.classList.toggle("menu-open",open);
      if(open){previous=document.activeElement;setTimeout(()=>menu.querySelector(selector)?.focus(),120)}
      else previous?.focus();
    };
    menuButton.addEventListener("click",()=>setMenu(menuButton.getAttribute("aria-expanded")!=="true"));
    menu.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>setMenu(false)));
    document.addEventListener("keydown",event=>{
      const open=menuButton.getAttribute("aria-expanded")==="true";
      if(event.key==="Escape"&&open){setMenu(false);return}
      if(event.key==="Tab"&&open){
        const items=[...menu.querySelectorAll(selector)],first=items[0],last=items[items.length-1];
        if(!items.length)return;
        if(!menu.contains(document.activeElement)){event.preventDefault();(event.shiftKey?last:first).focus()}
        else if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
      }
    });
  }

  document.querySelectorAll("[data-preview-input]").forEach(input=>{
    const output=document.getElementById(input.dataset.previewInput);
    input.addEventListener("input",()=>{output.textContent=input.value.trim()||"NANAHACHI"});
  });
})();
