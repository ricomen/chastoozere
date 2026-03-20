function slide(clicableBlock, activeClass) {
  clicableBlock.onclick = (e) => {
    e.preventDefault();
    clicableBlock.classList.toggle(activeClass);
    clicableBlock.nextElementSibling.classList.toggle(activeClass);
  };
}

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

document.addEventListener("DOMContentLoaded", () => {

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


  const toTopBtn = document.querySelector(".js-to-top-btn");
  if (!toTopBtn) return;

  let topOffset = 0;
  toTopBtn.style.display = "none";

  toTopBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  window.addEventListener("scroll", () => {
    topOffset = window.pageYOffset || document.documentElement.scrollTop;
    if (topOffset > 500) {
      toTopBtn.style.display = "";
    } else {
      toTopBtn.style.display = "none";
    }
  });

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

  //const prayerForm = document.forms.prayer;
  const prayerForm = document.querySelector('[data-form="treby"]');


  if (prayerForm) {
    const chosePrayerButtonsHandler = prayerForm.querySelector(".section-prayer__chose");
    const itemCounters = Array.from(prayerForm.querySelectorAll(".count"));
    const totalNode = prayerForm.querySelector(".section-prayer__total");
    const totalNodeInput = prayerForm.querySelector(".cloud-donation-sum");
    const donationInput = prayerForm.querySelector("input[donate-to-good-causes]");
    const videoReportSection = prayerForm.querySelector(".section-prayer-video-respond");
    const videoCheckbox = videoReportSection.querySelector("input[type='checkbox']");
    const videoEmailInput = videoReportSection.querySelector("input[name='e-mail']");

    const updateVideoEmailRequired = () => {
      if (!videoEmailInput) return;
      if (videoCheckbox && videoCheckbox.checked) {
        videoEmailInput.setAttribute("required", "");
      } else {
        videoEmailInput.removeAttribute("required");
      }
    };

    const resetVideoReportSection = () => {
      if (!videoReportSection) return;

      videoReportSection.querySelectorAll("input").forEach((el) => {
        if (el instanceof HTMLInputElement) {
          if (el.type === "checkbox") { el.checked = false; }
          else {
            el.value = "";
          }
        }
      });

      updateVideoEmailRequired();
      calculateTotal();
    };

    const syncVideoReportVisibility = (prayerButton) => {
      if (!videoReportSection) return;
      const videoReportFlag = prayerButton.closest(".section-prayer__item").dataset.videoReport;
      //console.log('videoReportFlag', videoReportFlag);
      resetVideoReportSection();

      if (videoReportFlag === "Y") {
        //console.log('videoReportSection.hidden = "false"', videoReportSection.hidden);
        videoReportSection.hidden = false;
      } else {
        //console.log('videoReportSection.hidden = "true"', videoReportSection.hidden);
        videoReportSection.hidden = true;
      }
    };

    updateVideoEmailRequired();
    videoCheckbox?.addEventListener("change", updateVideoEmailRequired);

    let nameValues = [];

    const calculateTotal = () => {
      let total = 0;

      const activePrayerButton = prayerForm.querySelector(
        ".section-prayer__chose .section-prayer__item.active button[data-value]"
      );

      if (activePrayerButton) {
        const basePrice = parseInt(activePrayerButton.dataset.value, 10);
        if (!isNaN(basePrice)) {

          const nameInputs = prayerForm.querySelectorAll(".section-prayer__names input[name='name[]']");
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

      if (videoCheckbox && videoCheckbox.checked) {
        const videoPrice = parseInt(videoCheckbox.dataset.price, 10);
        if (!isNaN(videoPrice)) {
          total += videoPrice;
        }
      }

      if (donationInput) {
        const raw = donationInput.value.trim();
        if (raw) {
          const numeric = parseInt(raw.replace(/[^\d]/g, ""), 10);
          if (!isNaN(numeric)) {
            total += numeric;
          }
        }
      }

      if (totalNode) {
        totalNode.textContent = `${total} руб.`;
      }
      
      if (totalNodeInput) {
        totalNodeInput.value = total;
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

    const additionalNames = prayerForm.querySelector(".section-prayer__names");

    if (additionalNames) {
      nameValues.length = 0;
      additionalNames.querySelectorAll("input[name='name[]']").forEach((input) => {
        nameValues.push((input.value && input.value.trim()) || "");
      });

      const buttonAddName = additionalNames.querySelector(".section-prayer__add-name");

      const nameAllowedPattern = /[^a-zA-Zа-яА-ЯёЁ\s\-']/g;

      additionalNames.addEventListener("input", (e) => {
        const input = e.target;
        if (!input || !input.matches("input[name='name[]']")) return;
        const start = input.selectionStart;
        const oldValue = input.value;
        const newValue = oldValue.replace(nameAllowedPattern, "");
        if (oldValue !== newValue) {
          input.value = newValue;
          input.setSelectionRange(start, start);
        }
        const inputs = additionalNames.querySelectorAll("input[name='name[]']");
        const index = Array.from(inputs).indexOf(input);
        if (index !== -1) {
          nameValues[index] = (input.value && input.value.trim()) || "";
          calculateTotal();
        }
      });

      buttonAddName.onclick = (e) => {
        e.preventDefault();
        const inputs = additionalNames.querySelectorAll("input[name='name[]']");
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

      const MAX_NAMES_COUNT = 10;

      const updateRemoveButtonsVisibility = () => {
        const rows = additionalNames.querySelectorAll(".section-prayer__name-row");
        const visible = rows.length > 1;
        rows.forEach((row) => {
          const btn = row.querySelector(".section-prayer__remove-name");
          if (btn) btn.style.display = visible ? "" : "none";
        });
      };

      updateRemoveButtonsVisibility();

      const createNodeHandler = (id) => {
        if (id >= MAX_NAMES_COUNT) return (buttonAddName.style.display = "none");
        const label = document.createElement("label");
        nameValues.push("");
        label.classList.add("section-prayer__label", "section-prayer__name-row");
        const input = document.createElement("input");
        input.placeholder = "Введите имя";
        input.name = "name[]";
        input.id = id;
        input.required = true;
        input.maxLength = 20;
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

    prayerForm.addEventListener("change", (e) => {
      const target = e.target;
      if (!target) return;

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

      var cID = '';
      window.ym?.(window.MODx_counterId, 'getClientID', function (clientID) {
        cID = clientID;
      });

      function ClientID() {
        var match = document.cookie.match('(?:^|;)\\s*_ym_uid=([^;]*)');
        return (match) ? decodeURIComponent(match[1]) : false;
      }
      if (cID != '') {
        cID = ClientID();
      }
      
      console.log(cID);
      formData.set("clientID", cID ?? "");

      const activeBtn = prayerForm.querySelector(
        ".section-prayer__chose .section-prayer__item.active button[data-value][data-prayer]"
      );
      if (activeBtn) {
        formData.set("resource_name", activeBtn.dataset.prayer ?? "");
        formData.set("resource_price", activeBtn.dataset.value ?? "");
      }

      const priceInputs = prayerForm.querySelectorAll(
        ".section-prayer-additional__item input[type='text'][data-price]"
      );
      for (let i = 0; i < priceInputs.length; i++)
        formData.set("prices[" + priceInputs[i].name + "]", priceInputs[i].dataset.price ?? 0);

      if (totalNode) {
        const totalText = totalNode.textContent?.replace(/\D/g, "") || "0";
        formData.set("total", totalText);
      }

      return formData;
    }

    function logFormDataForDebug(fd) {
      const obj = {};
      for (const [key, value] of fd.entries()) {
        if (!key) continue;
        if (key in obj) {
          if (!Array.isArray(obj[key])) obj[key] = [obj[key]];
          obj[key].push(value);
        } else {
          obj[key] = value;
        }
      }
      console.log("Данные формы записки (отправка на бэк):", obj);
    }

    prayerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = buildPrayerFormData();
      logFormDataForDebug(formData);

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
        if(payload) {
          if (payload.script !== undefined && payload.script != '') {
						pays(prayerForm.id, payload.script);
					} else {
						if (payload.url !== undefined && payload.url) {
							window.location.assign(payload.url);
						}
					}
        }
                
      } catch (error) {
        console.error("Ошибка при отправке формы", error);
      }
    });
    if (chosePrayerButtonsHandler) {
      chosePrayerButtonsHandler.addEventListener("click", (e) => {
        const button = e.target.closest("button");
        if (!button || !chosePrayerButtonsHandler.contains(button)) return;

        chosePrayerButtonsHandler
          .querySelectorAll("button")
          .forEach((btn) => {
            btn.textContent = "Выбрать";
            btn.closest(".section-prayer__item").classList.remove("active")
          }
          );

        button.textContent = "Выбрано";

        const parentItem = button.closest(".section-prayer__item");

        parentItem.classList.add("active");

        setSelectedPrayer(parentItem);
        syncVideoReportVisibility(button);

        calculateTotal();
      });

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
      if (prayerTitleNode) {
        const selectedPrayerTitleNode = prayerForm.querySelector(".section-prayer__selected-prayer-title");
        const selectedPrayerLabelNode = prayerForm.querySelector(".section-prayer__selected-prayer-label");
        selectedPrayerTitleNode.textContent = prayerTitleNode.textContent || "Не выбран";
        selectedPrayerLabelNode.textContent = prayerLabelNode?.textContent || "";
      }
    }

    const sendPrayer = async (data) => {
      const response = await fetch(document.location.href, {
        method: "POST",
        headers: {  
          'X-Requested-With': "XMLHttpRequest"  
        },  
        body: data,
        ...baseRedirectOptions,
      });
      return response;
    };

  }
});

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

const baseRedirectOptions = {
  redirect: "follow",
};

window.addEventListener("load", () => {
  handleScrollOnPageLoad();
});