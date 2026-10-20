// Optyk Piotrkowska, version D: mega menus, the mobile drawer, the phone search,
// the hero carousel and the booking bar. Without this file every link still
// works: the carousel scrolls by swipe, the booking bar falls back to its phone link.

const WIDE_MIN_PX = 1101;     // above this the desktop menu row shows

// 1. Mega menus: click or Enter opens; one open at a time; close on Escape,
//    outside click, choosing a link and focus leaving the menu.
function initMega() {
  const triggers = [...document.querySelectorAll('.mm__trigger')];
  const panel = (t) => document.getElementById(t.getAttribute('aria-controls'));
  const close = (except) => {
    triggers.forEach((t) => {
      if (t === except) {
        return;
      }
      t.setAttribute('aria-expanded', 'false');
      panel(t).hidden = true;
    });
  };
  triggers.forEach((t) => {
    t.addEventListener('click', () => {
      const open = t.getAttribute('aria-expanded') === 'true';
      close(t);
      t.setAttribute('aria-expanded', String(!open));
      panel(t).hidden = open;
    });
    const item = t.closest('.mm');
    item.addEventListener('focusout', (e) => {
      if (e.relatedTarget && !item.contains(e.relatedTarget)) {
        close();
      }
    });
  });
  document.addEventListener('click', (e) => {
    if (e.target.closest('.mm__panel a') || !e.target.closest('.mm')) {
      close();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') {
      return;
    }
    const open = triggers.find((t) => t.getAttribute('aria-expanded') === 'true');
    close();
    if (open) {
      open.focus();
    }
  });
}

// 2. Drawer: a side panel on narrow screens; the page behind is inert while it is open.
//    Rows with a submenu swap the list for that submenu; the back arrow returns.
function initDrawer() {
  const burger = document.querySelector('.hdr__burger');
  const drawer = document.getElementById('drawer');
  if (!burger || !drawer) {
    return;
  }
  const closeBtn = drawer.querySelector('.drawer__close');
  const backBtn = drawer.querySelector('.drawer__back');
  const root = drawer.querySelector('[data-level="root"]');
  const behind = [...document.querySelectorAll('main, .foot, .hdr, .guide, .skip, .strip, .marquee')];
  let opener = null;

  const showLevel = (level) => {
    drawer.querySelectorAll('.drawer__level').forEach((el) => { el.hidden = el !== level; });
    backBtn.hidden = level === root;
    drawer.querySelector('.drawer__panel').scrollTop = 0;
  };
  const set = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    drawer.hidden = !open;
    document.documentElement.classList.toggle('drawer-open', open);
    behind.forEach((el) => { el.inert = open; });
    if (open) {
      closeBtn.focus();
      return;
    }
    showLevel(root);
    burger.focus();
  };

  burger.addEventListener('click', () => set(true));
  closeBtn.addEventListener('click', () => set(false));
  backBtn.addEventListener('click', () => {
    showLevel(root);
    if (opener) {
      opener.focus();
    }
  });
  drawer.addEventListener('click', (e) => {
    const row = e.target.closest('button[aria-controls]');
    if (row) {
      opener = row;
      showLevel(document.getElementById(row.getAttribute('aria-controls')));
      backBtn.focus();
      return;
    }
    // A chosen link or a click on the dimmed page closes the panel
    if (e.target.closest('a') || e.target === drawer) {
      set(false);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !drawer.hidden) {
      set(false);
    }
  });
  window.matchMedia(`(min-width: ${WIDE_MIN_PX}px)`).addEventListener('change', (e) => {
    if (e.matches && !drawer.hidden) {
      set(false);
    }
  });
}

// 3. Phone search: the magnifier shows the search field under the header row
function initSearch() {
  const toggle = document.querySelector('[data-search-toggle]');
  if (!toggle) {
    return;
  }
  const header = document.querySelector('.hdr');
  toggle.addEventListener('click', () => {
    const open = !header.classList.contains('hdr--search');
    header.classList.toggle('hdr--search', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      document.getElementById('q').focus();
    }
  });
}

// 4. Hero carousel: dots and arrows scroll the track; the current dot follows
//    the slide in view, whether it got there by swipe, dot or arrow.
function initCarousel() {
  document.querySelectorAll('.hero').forEach((hero) => {
    const track = hero.querySelector('.hero__track');
    const slides = [...track.children];
    const dots = [...hero.querySelectorAll('.hero__dots button')];
    const prev = hero.querySelector('.hero__arrow--prev');
    const next = hero.querySelector('.hero__arrow--next');
    let current = 0;

    const go = (i) => {
      const target = (i + slides.length) % slides.length;
      track.scrollTo({ left: slides[target].offsetLeft - track.offsetLeft });
    };
    const mark = (i) => {
      current = i;
      dots.forEach((d, n) => d.setAttribute('aria-current', String(n === i)));
    };

    dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
    prev.addEventListener('click', () => go(current - 1));
    next.addEventListener('click', () => go(current + 1));
    const seen = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          mark(slides.indexOf(e.target));
        }
      });
    }, { root: track, threshold: 0.6 });
    slides.forEach((s) => seen.observe(s));
    // Controls are hidden in the markup so a page without JS shows no dead buttons
    [prev, next, hero.querySelector('.hero__dots')].forEach((el) => { el.hidden = false; });
  });
}

// 5. Booking bar: the chosen visit sets where the button goes and what it says
function initBooking() {
  document.querySelectorAll('[data-book]').forEach((form) => {
    const select = form.querySelector('select');
    const go = form.querySelector('[data-book-go]');
    const update = () => {
      const opt = select.selectedOptions[0];
      go.href = opt.value;
      go.textContent = opt.dataset.how;
      if (opt.value.startsWith('http')) {
        go.rel = 'noopener';
      } else {
        go.removeAttribute('rel');
      }
    };
    select.addEventListener('change', update);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      go.click();
    });
    update();
  });
}

initMega();
initDrawer();
initSearch();
initCarousel();
initBooking();
