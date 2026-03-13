/**
 * Переключает видимость соседнего блока (аккордеон) по клику.
 * @param {HTMLElement} clicableBlock - заголовок или другой кликабельный элемент
 * @param {string} activeClass - CSS‑класс, который отвечает за раскрытие/сжатие
 */
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

/**
 * Возвращает отступ, равный высоте шапки + базовый отступ,
 * чтобы при скролле по якорям блок не уходил под фиксированное меню.
 */
function getHeaderOffset() {
  const header = document.querySelector(".header");
  const headerHeight = header ? header.clientHeight : 0;
  return headerHeight + baseOffset;
}

/**
 * Вешает на ссылку плавный скролл до указанного блока по id.
 * @param {HTMLAnchorElement} link - ссылка, по которой кликает пользователь
 * @param {string} blockId - id целевого блока без символа #
 */
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

/**
 * Обрабатывает прямой переход по якорю в URL при загрузке страницы
 * и скроллит к соответствующему блоку с учётом высоты шапки.
 */
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

/**
 * Данные заказа
 * @type {Object}
 * @property {Array} orders - массив услуг к заказу
 */
const dataPrayers = {
  orders: [],
};

const prayerForm = document.forms.prayer;

if (prayerForm) {
  // Текстовое поле в форме, куда выводится выбранный молебен
  const selectedPrayer = prayerForm.querySelector("[name='selectedPrayer']");

  // Контейнер с кнопками выбора конкретного молебна
  const chosePrayerButtonsHandler = prayerForm.querySelector(".section-prayer__chose");

  // Счетчики количества добавленных свечей и других товаров
  const itemCounters = Array.from(prayerForm.querySelectorAll(".count"));

  itemCounters?.forEach((countElement) => {
    const minusButton = countElement.querySelector("button:first-child");
    const plusButton = countElement.querySelector("button:nth-child(3)");
    const MAX_COUNT = countElement.dataset.max || 10;
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
      if (currentValue >= MAX_COUNT) return (currentValue = MAX_COUNT);

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
    // Обработка динамического добавления полей с именами в записке о молитве
    const buttonAddName = additionalNames.querySelector("button");

    buttonAddName.onclick = (e) => {
      e.preventDefault();
      createNodeHandler(additionalNames.querySelectorAll("input").length);
    };

    const MAX_NAMES_COUNT = 10;

    // Создаёт новое поле для ввода имени, ограничивая их количество
    const createNodeHandler = (id) => {
      if (id >= MAX_NAMES_COUNT) return (buttonAddName.style.display = "none");
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

  prayerForm.addEventListener("change", (e) => {
    console.log('e', e.target.value);
  });

  prayerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    sendPrayer(new FormData(prayerForm));
  });

  /**
   * Отображает выбранный молебен в отдельном поле формы.
   * @param {HTMLElement} node - элемент, внутри которого показывается название молебна
   * @param {string} value - текстовое название выбранного молебна
   */
  function setSelectedPrayer(node, value) {
    node.textContent = value || "Не выбран";
  }

  if (chosePrayerButtonsHandler) {
    chosePrayerButtonsHandler.addEventListener("click", (e) => {
      const button = e.target.closest("button");
      if (!button || !chosePrayerButtonsHandler.contains(button)) return;

      // снимаем класс со всех кнопок в группе
      chosePrayerButtonsHandler
        .querySelectorAll("button")
        .forEach((btn) => {
          btn.textContent = "Выбрать";
          btn.closest(".section-prayer__item").classList.remove("active")
        }
        );

      // вешаем класс только на нажатую кнопку
      button.textContent = "Выбрано";
      button.closest(".section-prayer__item").classList.add("active");

      // Указываем выбранный молебен в форме
      setSelectedPrayer(selectedPrayer, button.dataset.prayer);
    });
  }

  /**
   * Отправляет данные формы записки о молитве на сервер.
   * Использует FormData, чтобы отдать все поля без ручной сериализации.
   * @param {FormData} data - данные формы, собранные через new FormData(form)
   * @returns {Promise<Response>} - сырой объект ответа fetch
   */
  const sendPrayer = async (data) => {
    console.log('data', data);
    const response = await fetch("/api/prayer", {
      method: "POST",
      body: data,
    });
    return response;
  };

}

window.addEventListener("load", () => {
  handleScrollOnPageLoad();
});

