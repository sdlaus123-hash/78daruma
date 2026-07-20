(() => {
  "use strict";
  const products={
    vermilion:{name:"朱 / VERMILION",copy:"願いは、静かに燃える。",meaning:"挑戦、始まり、意志",color:"#8f1d18",glow:"#c2b7aa",gold:"#b99a5b",image:"assets/images/vermilion-object.jpg",imageSmall:"assets/images/vermilion-object-760.jpg",imageWidth:1300,imageHeight:1300,alt:"深い朱の78達磨",standard:18700,mini:12800,large:29800,index:"01"},
    sumi:{name:"墨 / SUMI",copy:"沈黙の中に、決断を置く。",meaning:"決断、集中、静かな重心",color:"#151313",glow:"#aaa49b",gold:"#b99a5b",image:"assets/images/sumi-object.jpg",imageSmall:"assets/images/sumi-object-760.jpg",imageWidth:1300,imageHeight:1300,alt:"墨黒の78達磨",standard:19800,mini:13800,large:30800,index:"02"},
    gofun:{name:"胡粉 / GOFUN",copy:"余白に、新しい章を。",meaning:"目標、再出発、余白",color:"#e8e1d4",glow:"#bdb5a8",gold:"#746a58",image:"assets/images/gofun-78-object.jpg",imageSmall:"assets/images/gofun-78-object-760.jpg",imageWidth:1254,imageHeight:1254,alt:"白い胡粉仕上げの78達磨",standard:19800,mini:13800,large:30800,index:"03"}
  };
  const params=new URLSearchParams(location.search);let key=products[params.get("item")]?params.get("item"):"vermilion",product=products[key];
  const el=id=>document.getElementById(id),root=document.documentElement,finishButtons=[...document.querySelectorAll("[data-finish]")],sizeInputs=[...document.querySelectorAll("[name=size]")],price=el("price");
  function selectedSize(){return sizeInputs.find(input=>input.checked)?.value||"standard"}
  function sizePrice(){return product[selectedSize()]}
  function renderPrice(){price.textContent=`予定 ¥${sizePrice().toLocaleString()}`}
  function setProduct(next){key=next;product=products[key];const image=el("product-image");image.classList.add("is-switching");el("product-name").textContent=product.name;el("product-copy").textContent=product.copy;el("meaning").textContent=product.meaning;el("product-index").textContent=`COLLECTION 01 / ${product.index}`;image.srcset=`${product.imageSmall} 760w, ${product.image} ${product.imageWidth}w`;image.src=product.image;image.width=product.imageWidth;image.height=product.imageHeight;image.alt=product.alt;const reveal=()=>requestAnimationFrame(()=>image.classList.remove("is-switching"));if(image.decode)image.decode().then(reveal).catch(reveal);else image.addEventListener("load",reveal,{once:true});root.style.setProperty("--product-color",product.color);root.style.setProperty("--product-glow",product.glow);root.style.setProperty("--product-gold",product.gold);finishButtons.forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.finish===key)));history.replaceState(null,"",`?item=${key}`);renderPrice()}
  finishButtons.forEach(button=>button.addEventListener("click",()=>setProduct(button.dataset.finish)));sizeInputs.forEach(input=>input.addEventListener("change",renderPrice));
  if(matchMedia("(min-width: 48rem)").matches)Object.values(products).forEach(({image})=>{const preload=new Image();preload.src=image});
  setProduct(key);
})();
