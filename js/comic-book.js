/* ==========================================================================
   COMIC BOOK CASE STUDY ENGINE (js/comic-book.js)
   ========================================================================== */

export function initComicBook() {
  const section = document.getElementById("comicProjectSection");
  const bookContainer = document.getElementById("bookContainer");
  const bookStage = document.getElementById("bookStage");
  const hudHint = document.getElementById("hudHint");
  const pages = document.querySelectorAll(".page");
  const prevBtn = document.getElementById("prevPageBtn");
  const nextBtn = document.getElementById("nextPageBtn");
  const resetBtn = document.getElementById("resetBookBtn");

  if (!section || !bookContainer || !pages.length) return;

  let currentFlippedIndex = -1; // -1 = Completely Closed
  let isScrollThrottled = false;
  const transitionTimeouts = {};

  function setPageTransitionZIndex(pageIdx, targetZIndex) {
    const page = pages[pageIdx];
    if (!page) return;

    page.style.zIndex = targetZIndex;

    if (transitionTimeouts[pageIdx]) {
      clearTimeout(transitionTimeouts[pageIdx]);
    }

    transitionTimeouts[pageIdx] = setTimeout(() => {
      delete transitionTimeouts[pageIdx];
      updatePageZIndices();
    }, 1200);
  }

  function updatePageZIndices() {
    const N = pages.length;
    pages.forEach((page, idx) => {
      if (!transitionTimeouts[idx]) {
        if (page.classList.contains("flipped")) {
          page.style.zIndex = idx + 1;
        } else {
          page.style.zIndex = N + (N - idx);
        }
      }
    });
  }

  function updateHUDAndCentering() {
    updatePageZIndices();
    if (currentFlippedIndex === -1) {
      bookContainer.classList.remove("open");
      if (hudHint) hudHint.innerText = "👉 CLICK COVER OR SCROLL TO OPEN BOOK";
    } else {
      bookContainer.classList.add("open");
      if (hudHint) {
        if (currentFlippedIndex >= pages.length - 1) {
          hudHint.innerText =
            "🎉 GREETINGS & CONTACT PAGE • CLICK RE-OPEN TO RESTART";
        } else if (currentFlippedIndex === 0) {
          hudHint.innerText =
            "📖 PROJECT 01: YOGNII HEALTH APP • SCROLL / CLICK RIGHT PAGE TO TURN";
        } else if (currentFlippedIndex === 1) {
          hudHint.innerText =
            "📖 PROJECT 02: AI RESUME PARSER • SCROLL / CLICK RIGHT PAGE TO TURN";
        }
      }
    }
  }

  function flipPage(index) {
    if (index < 0 || index >= pages.length) return;

    if (pages[index].classList.contains("flipped")) {
      let delayCount = 0;
      for (let i = pages.length - 1; i >= index; i--) {
        if (pages[i].classList.contains("flipped")) {
          const pIdx = i;
          const seqDelay = delayCount * 120;
          setTimeout(() => {
            pages[pIdx].classList.remove("flipped");
            setPageTransitionZIndex(pIdx, 20 - delayCount);
          }, seqDelay);
          delayCount++;
        }
      }
      currentFlippedIndex = index - 1;
    } else {
      let delayCount = 0;
      for (let i = 0; i <= index; i++) {
        if (!pages[i].classList.contains("flipped")) {
          const pIdx = i;
          const seqDelay = delayCount * 120;
          setTimeout(() => {
            pages[pIdx].classList.add("flipped");
            setPageTransitionZIndex(pIdx, 20 + delayCount);
          }, seqDelay);
          delayCount++;
        }
      }
      currentFlippedIndex = index;
    }
    updateHUDAndCentering();
  }

  function nextPage() {
    if (currentFlippedIndex < pages.length - 1) {
      currentFlippedIndex++;
      const pIdx = currentFlippedIndex;
      pages[pIdx].classList.add("flipped");
      setPageTransitionZIndex(pIdx, 20);
      updateHUDAndCentering();
    }
  }

  function prevPage() {
    if (currentFlippedIndex >= 0) {
      const pIdx = currentFlippedIndex;
      pages[pIdx].classList.remove("flipped");
      setPageTransitionZIndex(pIdx, 20);
      currentFlippedIndex--;
      updateHUDAndCentering();
    }
  }

  function resetBook(e) {
    if (e) e.stopPropagation();
    if (currentFlippedIndex === -1) return;

    let delayCount = 0;
    for (let i = pages.length - 1; i >= 0; i--) {
      if (pages[i].classList.contains("flipped")) {
        const pIdx = i;
        const seqDelay = delayCount * 120;
        setTimeout(() => {
          pages[pIdx].classList.remove("flipped");
          setPageTransitionZIndex(pIdx, 20 - delayCount);
        }, seqDelay);
        delayCount++;
      }
    }
    currentFlippedIndex = -1;
    updateHUDAndCentering();
  }

  function throttleScroll() {
    isScrollThrottled = true;
    setTimeout(() => {
      isScrollThrottled = false;
    }, 600);
  }

  // Set initial stack ordering
  updatePageZIndices();

  // Click handler on individual pages
  pages.forEach((page, idx) => {
    page.addEventListener("click", () => {
      flipPage(idx);
    });
  });

  if (prevBtn) prevBtn.addEventListener("click", prevPage);
  if (nextBtn) nextBtn.addEventListener("click", nextPage);
  if (resetBtn) resetBtn.addEventListener("click", resetBook);

  // Wheel scroll handler (scoped to bookStage so normal page scroll isn't blocked)
  if (bookStage) {
    bookStage.addEventListener(
      "wheel",
      (e) => {
        if (e.target.closest(".comic-panel-scrollable")) return;
        if (isScrollThrottled) return;

        if (e.deltaY > 0 && currentFlippedIndex < pages.length - 1) {
          e.preventDefault();
          nextPage();
          throttleScroll();
        } else if (e.deltaY < 0 && currentFlippedIndex >= 0) {
          e.preventDefault();
          prevPage();
          throttleScroll();
        }
      },
      { passive: false },
    );
  }

  // IntersectionObserver to auto-open cover when section scrolls into view
  let autoOpenTriggered = false;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !autoOpenTriggered) {
          autoOpenTriggered = true;
          setTimeout(() => {
            if (currentFlippedIndex === -1) {
              flipPage(0);
            }
          }, 800);
        }
      });
    },
    { threshold: 0.4 },
  );
  observer.observe(section);
}
