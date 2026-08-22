document.addEventListener("DOMContentLoaded", () => {
  const showcaseSection = document.getElementById("showcase");
  const stack = document.getElementById("project-stack");
  const frames = Array.from(stack.querySelectorAll(".project-frame"));
  const dots = Array.from(document.querySelectorAll(".showcase-dot"));
  const indicator = document.getElementById("showcase-indicator");
  const showcaseWrapper = document.getElementById("showcase-wrapper");
  const caseStudyPage = document.getElementById("case-study-page");
  const caseStudyContent = document.getElementById("case-study-content");
  const caseStudyScroll = document.getElementById("case-study-scroll");
  const caseStudyHeading = document.getElementById("case-study-heading");
  const btnBack = document.getElementById("btn-back");

  const total = frames.length;
  let currentIndex = 0;
  let isCaseStudyOpen = false;
  let savedScrollY = 0;

  const projectTitles = [
    "yogiini — Health Tracking with AI",
    "Travelora — Travel Easy",
    "Skill Gain",
    "Tele Calling — Smart Call With AI",
  ];

  // Per-project case study screens — add image paths as assets are provided
  const projectScreens = {
    0: [
      "assets/01.png",
      "assets/02.png",
      "assets/03.png",
      "assets/04.png",
      "assets/05.png",
      "assets/06.png",
      "assets/07.png",
      "assets/08.png",
      "assets/09.png",
      "assets/10.png",
      "assets/11.png",
      "assets/12.png",
      "assets/13.png",
      "assets/14.png",
      "assets/15.png",
      "assets/16.png",
      "assets/17.png",
      "assets/18.png",
    ],
    1: [
      "assets/travel/1.png",
      "assets/travel/2.png",
      "assets/travel/3.png",
      "assets/travel/4.png",
      "assets/travel/5.png",
      "assets/travel/6.png",
      "assets/travel/7.png",
      "assets/travel/8.png",
      "assets/travel/9.png",
      "assets/travel/10.png",
      "assets/travel/11.png",
      "assets/travel/12.png",
      "assets/travel/13.png",
      "assets/travel/14.png",
      "assets/travel/15.png",
      "assets/travel/16.png",
      "assets/travel/17.png",
      "assets/travel/18.png",
      "assets/travel/19.png",
    ],
    2: [
      "assets/skill-gain/1.png",
      "assets/skill-gain/2.png",
      "assets/skill-gain/3.png",
      "assets/skill-gain/4.png",
      "assets/skill-gain/5.png",
      "assets/skill-gain/6.png",
      "assets/skill-gain/7.png",
      "assets/skill-gain/8.png",
      "assets/skill-gain/9.png",
    ],
    3: [
      "assets/tele-call/1.png",
      "assets/tele-call/2.png",
      "assets/tele-call/3.png",
      "assets/tele-call/4.png",
      "assets/tele-call/5.png",
      "assets/tele-call/6.png",
      "assets/tele-call/7.png",
      "assets/tele-call/8.png",
      "assets/tele-call/9.png",
      "assets/tele-call/10.png",
      "assets/tele-call/11.png",
      "assets/tele-call/12.png",
      "assets/tele-call/13.png",
      "assets/tele-call/14.png",
      "assets/tele-call/15.png",
      "assets/tele-call/16.png",
    ],
  };

  function updateStackPositions(index) {
    currentIndex = index;
    frames.forEach((frame, idx) => {
      frame.className = "project-frame";

      if (idx < currentIndex) {
        const diff = currentIndex - idx;
        if (diff === 1) frame.classList.add("stacked-1");
        else if (diff === 2) frame.classList.add("stacked-2");
        else frame.classList.add("stacked-hidden");
      } else if (idx === currentIndex) {
        frame.classList.add("active");
      } else {
        frame.classList.add("next-in-line");
      }
    });

    dots.forEach((dot, dIdx) => {
      dot.classList.toggle("active", dIdx === currentIndex);
    });
  }

  function getScrollRange() {
    const vh = window.innerHeight;
    const sectionTop = showcaseSection.offsetTop;
    const scrollable = showcaseSection.offsetHeight - vh;
    return { sectionTop, scrollable, vh };
  }

  function indexFromScroll() {
    const { sectionTop, scrollable } = getScrollRange();
    if (scrollable <= 0) return 0;

    const progress = (window.scrollY - sectionTop) / scrollable;
    const clamped = Math.max(0, Math.min(1, progress));
    return Math.min(total - 1, Math.floor(clamped * total));
  }

  function scrollToIndex(index) {
    const { sectionTop, scrollable } = getScrollRange();
    const targetProgress = (index + 0.5) / total;
    const targetY = sectionTop + targetProgress * scrollable;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  }

  function syncFromScroll() {
    if (isCaseStudyOpen) return;
    const nextIndex = indexFromScroll();
    if (nextIndex !== currentIndex) {
      updateStackPositions(nextIndex);
    }
  }

  function openCaseStudy() {
    const screens = projectScreens[currentIndex] || [];
    if (!screens.length) return;

    isCaseStudyOpen = true;
    savedScrollY = window.scrollY;

    caseStudyHeading.textContent = projectTitles[currentIndex] || "Case Study";
    caseStudyContent.innerHTML = "";

    const fragment = document.createDocumentFragment();
    screens.forEach((src, idx) => {
      const screen = document.createElement("div");
      screen.className = "case-study-screen";
      const img = document.createElement("img");
      img.src = src;
      img.alt = `${projectTitles[currentIndex]} — screen ${idx + 1}`;
      img.loading = idx < 2 ? "eager" : "lazy";
      screen.appendChild(img);
      fragment.appendChild(screen);
    });
    caseStudyContent.appendChild(fragment);

    showcaseWrapper.classList.add("hidden");
    indicator.classList.add("hidden");
    caseStudyPage.classList.add("active");
    caseStudyPage.setAttribute("aria-hidden", "false");
    document.body.classList.add("case-study-open");
    caseStudyScroll.scrollTop = 0;
  }

  function closeCaseStudy() {
    isCaseStudyOpen = false;
    caseStudyPage.classList.remove("active");
    caseStudyPage.setAttribute("aria-hidden", "true");
    showcaseWrapper.classList.remove("hidden");
    indicator.classList.remove("hidden");
    document.body.classList.remove("case-study-open");
    window.scrollTo(0, savedScrollY);
  }

  btnBack.addEventListener("click", closeCaseStudy);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isCaseStudyOpen) closeCaseStudy();
  });

  document.querySelectorAll(".btn-project-action").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openCaseStudy();
    });
  });

  stack.addEventListener("click", (e) => {
    if (e.target.closest(".btn-project-action")) return;
    if (currentIndex < total - 1) {
      scrollToIndex(currentIndex + 1);
    }
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      if (isCaseStudyOpen || index === currentIndex) return;
      scrollToIndex(index);
    });
  });

  window.addEventListener("scroll", syncFromScroll, { passive: true });
  window.addEventListener("resize", syncFromScroll);

  updateStackPositions(indexFromScroll());
});
