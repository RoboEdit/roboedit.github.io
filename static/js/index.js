(() => {
  "use strict";

  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  const scrollTopButton = document.querySelector(".scroll-top");
  const copyButton = document.querySelector(".copy-button");
  const copyToast = document.querySelector(".copy-toast");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const setMenu = (open) => {
    if (!navToggle || !navLinks) return;
    navToggle.setAttribute("aria-expanded", String(open));
    navLinks.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-is-open", open);
  };

  navToggle?.addEventListener("click", () => {
    setMenu(navToggle.getAttribute("aria-expanded") !== "true");
  });

  navLinks?.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  const updateScrollTop = () => {
    scrollTopButton?.classList.toggle("is-visible", window.scrollY > 700);
  };

  window.addEventListener("scroll", updateScrollTop, { passive: true });
  updateScrollTop();

  scrollTopButton?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
  });

  const revealItems = document.querySelectorAll(".reveal");
  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 }
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const showCopyFeedback = () => {
    if (!copyButton || !copyToast) return;
    const label = copyButton.querySelector("span");
    copyButton.classList.add("is-copied");
    copyToast.classList.add("is-visible");
    if (label) label.textContent = "Copied";
    window.setTimeout(() => {
      copyButton.classList.remove("is-copied");
      copyToast.classList.remove("is-visible");
      if (label) label.textContent = "Copy";
    }, 1800);
  };

  const fallbackCopy = (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    if (!copied) throw new Error("Copy command rejected");
  };

  copyButton?.addEventListener("click", async () => {
    const source = document.getElementById(copyButton.dataset.copyTarget || "");
    if (!source) return;
    const citation = source.textContent.trim();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(citation);
      } else {
        fallbackCopy(citation);
      }
      showCopyFeedback();
    } catch (error) {
      console.error("Unable to copy the BibTeX citation.", error);
    }
  });

  const videoObserver = "IntersectionObserver" in window && !reduceMotion.matches
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      }, { rootMargin: "80px 0px", threshold: 0.55 })
    : null;

  const registerVideo = (video) => {
    if (videoObserver) videoObserver.observe(video);
  };

  const createVideoCell = (label, source) => {
    const figure = document.createElement("figure");
    figure.className = "video-cell";
    const caption = document.createElement("figcaption");
    const video = document.createElement("video");
    caption.textContent = label;
    video.controls = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.src = source;
    video.setAttribute("aria-label", label);
    figure.append(caption, video);
    registerVideo(video);
    return figure;
  };

  const playTogether = (article) => {
    const videos = [...article.querySelectorAll("video")];
    videos.forEach((video) => {
      video.pause();
      video.currentTime = 0;
      video.muted = true;
    });
    Promise.allSettled(videos.map((video) => video.play()));
  };

  const createMediaCase = (title, videos) => {
    const article = document.createElement("article");
    article.className = "media-case";
    const header = document.createElement("header");
    header.className = "media-case-header";
    const heading = document.createElement("h3");
    heading.textContent = title;
    const button = document.createElement("button");
    button.className = "case-sync";
    button.type = "button";
    button.textContent = "Play together";
    button.setAttribute("aria-label", `Play every video in ${title} together`);
    button.addEventListener("click", () => playTogether(article));
    const grid = document.createElement("div");
    grid.className = "video-grid";
    videos.forEach(([label, source]) => grid.appendChild(createVideoCell(label, source)));
    header.append(heading, button);
    article.append(header, grid);

    const media = [...article.querySelectorAll("video")];
    const [master, ...followers] = media;
    const syncToMaster = () => {
      if (!master || master.readyState < 1) return;
      followers.forEach((video) => {
        if (video.readyState < 1) return;
        if (Math.abs(video.currentTime - master.currentTime) > 0.06) {
          video.currentTime = Math.min(master.currentTime, Math.max(0, video.duration - 0.01));
        }
      });
    };
    master?.addEventListener("play", () => {
      syncToMaster();
      followers.forEach((video) => video.play().catch(() => {}));
    });
    master?.addEventListener("pause", () => followers.forEach((video) => video.pause()));
    master?.addEventListener("seeking", syncToMaster);
    master?.addEventListener("timeupdate", syncToMaster);
    return article;
  };

  const videoRoot = "static/videos";
  const roboCases = document.getElementById("roboedit-cases");
  let renderedRoboCases = 0;

  const renderRoboCases = (targetCount) => {
    if (!roboCases) return;
    const safeTarget = Math.min(targetCount, 24);
    const fragment = document.createDocumentFragment();
    for (let index = renderedRoboCases + 1; index <= safeTarget; index += 1) {
      const label = String(index).padStart(2, "0");
      fragment.appendChild(createMediaCase(`RoboEdit case ${label}`, [
        ["Source human", `${videoRoot}/RoboEdit_results_synced/source_human_videos/${index}.mp4`],
        ["RoboEdit-ADC target", `${videoRoot}/RoboEdit_results_synced/RoboEdit-ADC_results/${index}.mp4`],
        ["RoboEdit-Trans edit", `${videoRoot}/RoboEdit_results/RoboEdit-Trans_results/${index}_edited_video.mp4`],
        ["Decoded 3D state", `${videoRoot}/RoboEdit_results/RoboEdit-Trans_results/${index}_decoded_robot_state.mp4`]
      ]));
    }
    roboCases.appendChild(fragment);
    renderedRoboCases = safeTarget;
  };

  renderRoboCases(24);

  const realRobotCases = document.getElementById("real-robot-cases");
  if (realRobotCases) {
    const fragment = document.createDocumentFragment();
    [
      ["Panda gripper", "panda_gripper"],
      ["XHand", "xhand"]
    ].forEach(([displayName, directory]) => {
      for (let index = 1; index <= 4; index += 1) {
        fragment.appendChild(createMediaCase(`${displayName} · case ${index}`, [
          ["Human task reference", `${videoRoot}/Real_robot_deployment_results/${directory}/${index}_human_demonstration_reference.mp4`],
          ["Real-robot deployment", `${videoRoot}/Real_robot_deployment_results/${directory}/${index}_real_robot_video.mp4`]
        ]));
      }
    });
    realRobotCases.appendChild(fragment);
  }
})();
