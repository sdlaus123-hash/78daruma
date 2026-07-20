(() => {
  "use strict";
  const root=document.documentElement;
  const intro=document.querySelector(".home-intro");
  const scenes=[...document.querySelectorAll(".home-scene")];
  const plate=document.querySelector(".home-plate");
  const cue=document.querySelector(".home-cue");
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  if(!intro)return;

  const clamp=(value,min=0,max=1)=>Math.min(max,Math.max(min,value));
  const lerp=(from,to,amount)=>from+(to-from)*amount;
  const smooth=value=>value*value*(3-2*value);
  const map=(value,inA,inB,outA,outB)=>lerp(outA,outB,clamp((value-inA)/(inB-inA)));
  const ranges=[[0,.2],[.15,.42],[.37,.63],[.58,.82],[.77,1]];
  const envelope=(value,start,end,edge=.045)=>{
    if(value<start||value>end)return 0;
    if(value<start+edge)return smooth((value-start)/edge);
    if(value>end-edge)return smooth((end-value)/edge);
    return 1;
  };

  let target=0;
  let frame=0;

  const read=()=>{
    const rect=intro.getBoundingClientRect();
    target=clamp(-rect.top/Math.max(1,rect.height-innerHeight));
    if(!frame)frame=requestAnimationFrame(render);
  };

  function render(){
    const progress=reduced.matches?1:target;

    root.style.setProperty("--home-progress",progress.toFixed(4));
    root.style.setProperty("--home-light",map(progress,.02,.58,.015,1).toFixed(4));
    root.style.setProperty("--home-object-opacity",map(progress,.035,.3,.015,1).toFixed(4));
    root.style.setProperty("--home-scale",map(progress,0,1,1.22,1).toFixed(4));
    root.style.setProperty("--home-y",`${map(progress,0,1,10,0).toFixed(2)}px`);
    root.style.setProperty("--home-beam-x",`${map(progress,0,1,27,63).toFixed(2)}%`);
    root.style.setProperty("--home-vignette",map(progress,0,1,.92,.44).toFixed(3));
    root.style.setProperty("--home-contrast",map(progress,0,1,1.24,1.06).toFixed(3));
    root.style.setProperty("--home-saturation",map(progress,0,1,.42,.9).toFixed(3));
    root.style.setProperty("--home-pedestal",smooth(clamp((progress-.79)/.12)).toFixed(4));

    const plateProgress=smooth(clamp((progress-.86)/.09));
    plate.style.opacity=plateProgress.toFixed(3);
    plate.style.transform=`translate3d(0,${map(plateProgress,0,1,14,0).toFixed(1)}px,0)`;
    plate.style.pointerEvents=plateProgress>.75?"auto":"none";
    cue.style.opacity=(1-smooth(clamp(progress/.09))).toFixed(3);

    scenes.forEach((scene,index)=>{
      const [start,end]=ranges[index];
      const opacity=index===0
        ?1-smooth(clamp((progress-(end-.05))/.05))
        :index===4?smooth(clamp((progress-start)/.05))
        :envelope(progress,start,end);
      scene.style.opacity=opacity.toFixed(3);
      scene.style.transform=`translate3d(0,${map(opacity,0,1,12,0).toFixed(1)}px,0)`;
      scene.style.clipPath=`inset(0 0 ${map(opacity,0,1,100,0).toFixed(2)}% 0)`;
      scene.style.letterSpacing=`${map(opacity,0,1,.025,0).toFixed(4)}em`;
    });

    frame=0;
  }

  addEventListener("scroll",read,{passive:true});
  addEventListener("resize",read,{passive:true});
  read();
})();
