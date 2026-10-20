// Optyk Piotrkowska, version D: mega menus, the mobile drawer and the booking bar.
// Without this file every link still works: mega menus fall back to their
// section anchors through the drawer markup, and the booking bar to its phone link.

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

// 2. Drawer: a modal menu on narrow screens; the page behind is inert while it is open
function initDrawer() {
  const burger = document.querySelector('.hdr__burger');
  const drawer = document.getElementById('drawer');
  if (!burger || !drawer) {
    return;
  }
  const closeBtn = drawer.querySelector('.drawer__close');
  const behind = [...document.querySelectorAll('main, .foot, .hdr, .guide, .skip')];
  const set = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    drawer.hidden = !open;
    document.documentElement.classList.toggle('drawer-open', open);
    behind.forEach((el) => { el.inert = open; });
    if (open) {
      closeBtn.focus();
    } else {
      burger.focus();
    }
  };
  burger.addEventListener('click', () => set(true));
  closeBtn.addEventListener('click', () => set(false));
  drawer.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
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

// 3. Booking bar: the chosen visit sets where the button goes and what it says
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
initBooking();
