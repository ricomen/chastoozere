const itemCounters = Array.from(document.querySelectorAll(".count"));

itemCounters?.forEach((countElement) => {
  const minusButton = countElement.querySelector("button:first-child");
  const plusButton = countElement.querySelector("button:nth-child(3)");
  const maxCount = countElement.dataset.max || 10;
  const inputElement = countElement.querySelector('input[type="text"]');

  minusButton.addEventListener("click", (e) => {
    e.preventDefault();
    let currentValue = parseInt(inputElement.value, 10);
    if (isNaN(currentValue) || currentValue < 1) return (currentValue = 1);

    inputElement.value = --currentValue;
    logicAfterCalcutalteValue({
      value: inputElement.value,
    });
  });

  plusButton.addEventListener("click", (e) => {
    e.preventDefault();
    let currentValue = parseInt(inputElement.value, 10);
    if (isNaN(currentValue)) return (currentValue = 1);
    if (currentValue >= maxCount) return (currentValue = maxCount);

    inputElement.value = ++currentValue;
    logicAfterCalcutalteValue({
      value: inputElement.value,
    });
  });

  const logicAfterCalcutalteValue = ({ value }) => {
    inputElement.setAttribute("value", value);
    inputElement.dispatchEvent(new Event("change", { bubbles: true }));
  };
});

const additionalNames = document.querySelector(".section-prayer__names");

if (additionalNames) {
  const buttonAddName = additionalNames.querySelector("button");

  buttonAddName.onclick = (e) => {
    e.preventDefault();
    createNodeHandler(additionalNames.querySelectorAll("input").length);
  };
  const createNodeHandler = (id) => {
    if (id >= 10) return (buttonAddName.style.display = "none");
    const label = document.createElement("label");
    label.classList.add(".section-prayer__label");
    const input = document.createElement("input");
    input.placeholder = "Введите имя";
    input.name = "name";
    input.id = id;
    label.appendChild(input);
    additionalNames.appendChild(label);
  };
}

function slide(clicableBlock, activeClass) {
  clicableBlock.onclick = (e) => {
    e.preventDefault();
    clicableBlock.classList.toggle(activeClass);
    clicableBlock.nextElementSibling.classList.toggle(activeClass);
  };
}

const slidesMiracle = document.querySelectorAll(".section-miracle__header");

slidesMiracle?.forEach((clicableBlock) => slide(clicableBlock, "active"));

const btnsShowMore = document.querySelectorAll(".btn-show-more");

btnsShowMore.forEach((btn) => {
  const hiddenElements = btn.previousElementSibling.querySelectorAll(".hidden");
  btn.onclick = (e) => {
    e.preventDefault();
    btn.classList.toggle("active");
    hiddenElements.forEach((el) => el.classList.toggle("hidden"));

    if (btn.classList.contains("active")) {
      btn.querySelector("span").textContent = "Скрыть";
      scrollToBlock(btn, btn.dataset.parentId);
    } else {
      btn.querySelector("span").textContent = "Развернуть все";
    }
  };
});

const allLinksInPage = document.querySelectorAll("a");
const regexpScrollLink = /^#/;
const regexpRedirectLink = /^https?:/;
const baseOffset = 20;

function getHeaderOffset() {
  const header = document.querySelector(".header");
  const headerHeight = header ? header.clientHeight : 0;
  return headerHeight + baseOffset;
}

function scrollToBlock(link, blockId) {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const block =
      document.getElementById(blockId) || document.querySelector(`#${blockId}`);
    if (!block) return;

    const rect = block.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const targetTop = rect.top + scrollTop - getHeaderOffset();

    window.scrollTo({
      top: targetTop,
      behavior: "smooth",
    });
  });
}

function handleScrollOnPageLoad() {
  const hash = window.location.hash;
  if (!hash || hash === "#") return;

  const blockId = hash.substring(1);

  const block =
    document.getElementById(blockId) ||
    document.querySelector(hash) ||
    document.querySelector(`.${blockId}`);

  if (!block) return;
  const rect = block.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const targetTop = rect.top + scrollTop - getHeaderOffset();

  window.scrollTo({
    top: targetTop,
    behavior: "smooth",
  });
}

allLinksInPage.forEach((link) => {
  const href = link.getAttribute("href");
  if (!href) return;

  const isScrollLink = href.match(regexpScrollLink);
  const isRedirectLink = href.match(regexpRedirectLink);

  if (isRedirectLink) {
    return;
  }

  if (isScrollLink) return scrollToBlock(link, href.substring(1));
});

window.addEventListener("load", handleScrollOnPageLoad);
