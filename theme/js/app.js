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

const prayerForm = document.forms.prayer;

const baseRedirectOptions = {
  redirect: "follow",
};

if (prayerForm) {
  const selectedPrayerTitle = prayerForm.querySelector(".section-prayer__selected-prayer-title");
  const selectedPrayerLabel = prayerForm.querySelector(".section-prayer__selected-prayer-label");

  const chosePrayerButtonsHandler = prayerForm.querySelector(".section-prayer__chose");

  const itemCounters = Array.from(prayerForm.querySelectorAll(".count"));

  const totalNode = prayerForm.querySelector(".section-prayer__total");

  const donationInput = prayerForm.querySelector("input[name='donation-value']");

  const videoCheckbox = prayerForm.querySelector(
    ".section-prayer-video-respond input[type='checkbox']"
  );

  /** @type {HTMLInputElement | null} Поле e-mail для отправки видео (обязательно при отмеченном чекбоксе) */
  const videoEmailInput = prayerForm.querySelector(
    ".section-prayer-video-respond input[name='e-mail']"
  );

  /** Ставит или снимает required у поля e-mail в зависимости от галочки «видео отчёт». */
  const updateVideoEmailRequired = () => {

    if (!videoEmailInput) return;
    if (videoCheckbox && videoCheckbox.checked) {
      videoEmailInput.setAttribute("required", "");
    } else {
      videoEmailInput.removeAttribute("required");
    }
  };

  updateVideoEmailRequired();
  videoCheckbox?.addEventListener("change", updateVideoEmailRequired);

  let nameValues = [];

  const calculateTotal = () => {
    let total = 0;

    // Цена выбранного молебна
    const activePrayerButton = prayerForm.querySelector(
      ".section-prayer__chose .section-prayer__item.active button[data-value]"
    );

    if (activePrayerButton) {
      const basePrice = parseInt(activePrayerButton.dataset.value, 10);
      if (!isNaN(basePrice)) {

        // если имен несколько
        const nameInputs = prayerForm.querySelectorAll(".section-prayer__names input[name='name']");
        if (nameInputs.length > 1) {
          const nameCount = Array.from(nameInputs).filter(
            (input) => (input.value && input.value.trim()) !== ""
          ).length;
          total += basePrice * nameCount;
        } else {
          total += basePrice;
        }
      }
    }

    // Дополнительные услуги с количеством (свечи, кагор, ладан, масло и т.п.)
    const priceInputs = prayerForm.querySelectorAll(
      ".section-prayer-additional__item input[type='text'][data-price]"
    );

    priceInputs.forEach((input) => {
      const count = parseInt(input.value, 10);
      const price = parseInt(input.dataset.price, 10);
      if (!isNaN(count) && count > 0 && !isNaN(price)) {
        total += count * price;
      }
    });

    // Видео‑отчёт
    if (videoCheckbox && videoCheckbox.checked) {
      const videoPrice = parseInt(videoCheckbox.dataset.price, 10);
      if (!isNaN(videoPrice)) {
        total += videoPrice;
      }
    }

    // Произвольное пожертвование
    if (donationInput) {
      const raw = donationInput.value.trim();
      if (raw) {
        // Убираем всё, кроме цифр
        const numeric = parseInt(raw.replace(/[^\d]/g, ""), 10);
        if (!isNaN(numeric)) {
          total += numeric;
        }
      }
    }

    if (totalNode) {
      totalNode.textContent = `${total} руб.`;
    }
  };

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
      // calculateTotal();
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
      // calculateTotal();
    });

    const logicAfterCalcutalteValue = ({ value }) => {
      inputElement.setAttribute("value", value);
      inputElement.dispatchEvent(new Event("change", { bubbles: true }));
    };
  });

  const additionalNames = prayerForm.querySelector(".section-prayer__names");

  if (additionalNames) {
    nameValues.length = 0;
    additionalNames.querySelectorAll("input[name='name']").forEach((input) => {
      nameValues.push((input.value && input.value.trim()) || "");
    });

    const buttonAddName = additionalNames.querySelector(".section-prayer__add-name");

    /** Допустимые символы в поле имени: буквы (латиница, кириллица), пробел, дефис, апостроф */
    const nameAllowedPattern = /[^a-zA-Zа-яА-ЯёЁ\s\-']/g;

    additionalNames.addEventListener("input", (e) => {
      const input = e.target;
      if (!input || !input.matches("input[name='name']")) return;
      const start = input.selectionStart;
      const oldValue = input.value;
      const newValue = oldValue.replace(nameAllowedPattern, "");
      if (oldValue !== newValue) {
        input.value = newValue;
        input.setSelectionRange(start, start);
      }
      const inputs = additionalNames.querySelectorAll("input[name='name']");
      const index = Array.from(inputs).indexOf(input);
      if (index !== -1) {
        nameValues[index] = (input.value && input.value.trim()) || "";
        calculateTotal();
      }
    });

    buttonAddName.onclick = (e) => {
      e.preventDefault();
      const inputs = additionalNames.querySelectorAll("input[name='name']");
      const firstEmpty = Array.from(inputs).find(
        (input) => !(input.value && input.value.trim())
      );
      if (firstEmpty) {
        firstEmpty.focus();
        firstEmpty.reportValidity();
        return;
      }
      createNodeHandler(inputs.length);
    };

    /** @type {number} Максимальное количество полей имён в записке */
    const MAX_NAMES_COUNT = 10;

    /** Показывает кнопки «Удалить» только если полей имён больше одного. */
    const updateRemoveButtonsVisibility = () => {
      const rows = additionalNames.querySelectorAll(".section-prayer__name-row");
      const visible = rows.length > 1;
      rows.forEach((row) => {
        const btn = row.querySelector(".section-prayer__remove-name");
        if (btn) btn.style.display = visible ? "" : "none";
      });
    };

    updateRemoveButtonsVisibility();

    /**
     * Добавляет новое поле для ввода имени в записку; при достижении лимита скрывает кнопку.
     * @param {number} id - текущее количество полей (используется как счётчик и id для нового input)
     * @returns {void}
     */
    const createNodeHandler = (id) => {
      if (id >= MAX_NAMES_COUNT) return (buttonAddName.style.display = "none");
      const label = document.createElement("label");
      nameValues.push("");
      label.classList.add("section-prayer__label", "section-prayer__name-row");
      const input = document.createElement("input");
      input.placeholder = "Введите имя";
      input.name = "name";
      input.id = id;
      input.required = true;
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "section-prayer__remove-name";
      removeBtn.title = "Удалить";
      removeBtn.setAttribute("aria-label", "Удалить имя");
      removeBtn.textContent = "−";
      label.appendChild(input);
      label.appendChild(removeBtn);
      additionalNames.appendChild(label);
      updateRemoveButtonsVisibility();
    };

    additionalNames.addEventListener("click", (e) => {
      const removeBtn = e.target.closest(".section-prayer__remove-name");
      if (!removeBtn) return;
      e.preventDefault();
      const row = removeBtn.closest(".section-prayer__name-row");
      const rows = additionalNames.querySelectorAll(".section-prayer__name-row");
      if (rows.length <= 1) return;
      const index = Array.from(rows).indexOf(row);
      if (index !== -1) nameValues.splice(index, 1);
      if (row) row.remove();
      updateRemoveButtonsVisibility();
      calculateTotal();
    });
  }

  /** Обработчик change: пересчёт суммы при изменении количества, чекбокса или пожертвования */
  prayerForm.addEventListener("change", (e) => {
    const target = e.target;
    if (!target) return;

    // Пересчитываем только для значимых полей
    if (
      target.matches(".section-prayer-additional__item input[type='text'][data-price]") ||
      target === donationInput ||
      target === videoCheckbox
    ) {
      calculateTotal();
    }
  });

  function buildPrayerFormData() {
    const formData = new FormData(prayerForm);

    // Список имён из .section-prayer__names: явно собираем и перезаписываем в FormData
    // (только непустые значения, в порядке полей на форме)
    const nameInputs = prayerForm.querySelectorAll(".section-prayer__names input[name='name']");
    formData.delete("name");
    nameValues.filter(Boolean).forEach((value) => formData.append("name", value));

    const activeBtn = prayerForm.querySelector(
      ".section-prayer__chose .section-prayer__item.active button[data-value][data-prayer]"
    );
    if (activeBtn) {
      formData.set("selectedPrayer", activeBtn.dataset.prayer ?? "");
      formData.set("prayerValue", activeBtn.dataset.value ?? "");
    }

    if (totalNode) {
      const totalText = totalNode.textContent?.replace(/\D/g, "") || "0";
      formData.set("total", totalText);
    }

    return formData;
  }

  // function logFormDataForDebug(fd) {
  //   const obj = {};
  //   for (const [key, value] of fd.entries()) {
  //     if (!key) continue;
  //     if (key in obj) {
  //       if (!Array.isArray(obj[key])) obj[key] = [obj[key]];
  //       obj[key].push(value);
  //     } else {
  //       obj[key] = value;
  //     }
  //   }
  //   console.log("Данные формы записки (отправка на бэк):", obj);
  // }

  prayerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = buildPrayerFormData();
    // logFormDataForDebug(formData);

    try {
      const response = await sendPrayer(formData);

      if (!response) return;

      if (response.redirected && response.url) {
        window.location.href = response.url;
        return;
      }

      let payload = null;
      try {
        payload = await response.json();
      } catch (err) {
        payload = null;
      }

      if (payload && payload.redirect) {
        window.location.href = payload.redirect;
      }
    } catch (error) {
      console.error("Ошибка при отправке формы", error);
    }
  });

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

      const parentItem = button.closest(".section-prayer__item");

      // вешаем класс на родительский элемент кнопки для подсвечивания активного
      parentItem.classList.add("active");

      setSelectedPrayer(parentItem);

      calculateTotal();
    });

    // При загрузке страницы автоматически выбираем первый молебен
    const firstPrayerButton = chosePrayerButtonsHandler.querySelector(
      ".section-prayer__item button[data-prayer]"
    );
    if (firstPrayerButton) {
      firstPrayerButton.click();
    }
  }

  function setSelectedPrayer(parentItem) {
    const prayerTitleNode = parentItem.querySelector(".section-prayer-item__info").querySelector(".h3");
    const prayerLabelNode = parentItem.querySelector(".section-prayer-item__info").querySelector("p");
    if (prayerTitleNode && prayerLabelNode) {
      const selectedPrayerTitleNode = prayerForm.querySelector(".section-prayer__selected-prayer-title");
      const selectedPrayerLabelNode = prayerForm.querySelector(".section-prayer__selected-prayer-label");
      selectedPrayerTitleNode.textContent = prayerTitleNode.textContent || "Не выбран";
      selectedPrayerLabelNode.textContent = prayerLabelNode.textContent || "Не выбран";
    }
  }

  const sendPrayer = async (data) => {
    const response = await fetch("/api/prayer", {
      method: "POST",
      body: data,
      ...baseRedirectOptions,
    });
    return response;
  };

}

window.addEventListener("load", () => {
  handleScrollOnPageLoad();
});