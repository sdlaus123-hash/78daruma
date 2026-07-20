(() => {
  "use strict";

  const DEFAULT_KEY = "78-entry-viewed";
  const root = document.documentElement;
  const intro = document.getElementById("entry-intro");
  if (!intro) return;
  const key = intro.dataset.entryKey || DEFAULT_KEY;

  const params = new URLSearchParams(location.search);
  const force = params.get("intro") === "1";
  const getViewed = () => {
    try {
      return sessionStorage.getItem(key) === "true";
    } catch {
      return false;
    }
  };

  if (!force && getViewed()) {
    root.classList.remove("entry-pending", "entry-active");
    root.classList.add("entry-viewed");
    intro.remove();
    return;
  }

  const video = intro.querySelector("video");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let closing = false;
  let cleaned = false;

  const setViewed = () => {
    try {
      sessionStorage.setItem(key, "true");
    } catch {}
  };

  const preventTouchScroll = event => {
    if (!closing) event.preventDefault();
  };

  const reveal = () => {
    intro.classList.add("is-ready");
  };

  const holdFinalLogo = () => {
    intro.classList.add("is-ended");
  };

  const tryPlay = () => {
    if (!video || reduced.matches) {
      holdFinalLogo();
      return;
    }
    const play = video.play();
    if (play && typeof play.catch === "function") {
      play.catch(() => intro.classList.add("is-play-blocked"));
    }
  };

  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("touchmove", preventTouchScroll);
    document.body.classList.remove("entry-locked");
    root.classList.remove("entry-pending", "entry-active");
    root.classList.add("entry-viewed");
    intro.remove();
  };

  const enter = event => {
    if (event) event.preventDefault();
    if (closing) return;
    closing = true;
    setViewed();
    intro.classList.add("is-exiting");
    intro.setAttribute("aria-disabled", "true");
    if (video) {
      try {
        video.pause();
      } catch {}
    }
    intro.addEventListener("transitionend", event => {
      if (event.target === intro) cleanup();
    }, { once: true });
    setTimeout(cleanup, 900);
  };

  function onKeyDown(event) {
    if (event.key !== "Enter" && event.key !== " " && event.code !== "Space") return;
    event.preventDefault();
    enter(event);
  }

  document.body.classList.add("entry-locked");
  root.classList.remove("entry-viewed");
  root.classList.add("entry-pending", "entry-active");
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("touchmove", preventTouchScroll, { passive: false });
  intro.addEventListener("click", enter);
  intro.addEventListener("keydown", onKeyDown);

  video?.addEventListener("loadeddata", reveal, { once: true });
  video?.addEventListener("canplay", tryPlay, { once: true });
  video?.addEventListener("ended", holdFinalLogo, { once: true });
  video?.addEventListener("error", () => {
    intro.classList.add("is-video-error");
    reveal();
    holdFinalLogo();
  }, { once: true });

  if (reduced.matches) {
    video?.pause();
    reveal();
    holdFinalLogo();
  } else {
    if (video?.readyState >= 2) reveal();
    tryPlay();
    setTimeout(reveal, 480);
  }

  requestAnimationFrame(() => {
    try {
      intro.focus({ preventScroll: true });
    } catch {
      intro.focus();
    }
  });
})();
