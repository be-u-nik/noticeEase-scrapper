async function waitForSelectors(selectors, frame, options) {
  for (const selector of selectors) {
    try {
      return await waitForSelector(selector, frame, options);
    } catch (err) {
      console.error(err);
    }
  }
  throw new Error(
    "Could not find element for selectors: " + JSON.stringify(selectors)
  );
}

async function scrollIntoViewIfNeeded(selectors, frame, timeout) {
  const element = await waitForSelectors(selectors, frame, {
    visible: false,
    timeout,
  });
  if (!element) {
    throw new Error("The element could not be found.");
  }
  await waitForConnected(element, timeout);
  const isInViewport = await element.isIntersectingViewport({ threshold: 0 });
  if (isInViewport) {
    return;
  }
  await element.evaluate((element) => {
    element.scrollIntoView({
      block: "center",
      inline: "center",
      behavior: "auto",
    });
  });
  await waitForInViewport(element, timeout);
}

async function waitForConnected(element, timeout) {
  await waitForFunction(async () => {
    return await element.getProperty("isConnected");
  }, timeout);
}

async function waitForInViewport(element, timeout) {
  await waitForFunction(async () => {
    return await element.isIntersectingViewport({ threshold: 0 });
  }, timeout);
}

async function waitForFunction(fn, timeout) {
  let isActive = true;
  const timeoutId = setTimeout(() => {
    isActive = false;
  }, timeout);
  while (isActive) {
    const result = await fn();
    if (result) {
      clearTimeout(timeoutId);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Timed out");
}

async function changeSelectElement(element, value) {
  await element.select(value);
  await element.evaluateHandle((e) => {
    e.blur();
    e.focus();
  });
}

async function changeElementValue(element, value) {
  await element.focus();
  await element.evaluate((input, value) => {
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

async function typeIntoElement(element, value) {
  const textToType = await element.evaluate((input, newValue) => {
    if (
      newValue.length <= input.value.length ||
      !newValue.startsWith(input.value)
    ) {
      input.value = "";
      return newValue;
    }
    const originalValue = input.value;
    input.value = "";
    input.value = originalValue;
    return newValue.substring(originalValue.length);
  }, value);
  await element.type(textToType);
}

async function waitForSelector(selector, frame, options) {
  if (!Array.isArray(selector)) {
    selector = [selector];
  }
  if (!selector.length) {
    throw new Error("Empty selector provided to waitForSelector");
  }
  let element = null;
  for (let i = 0; i < selector.length; i++) {
    const part = selector[i];
    if (element) {
      element = await element.waitForSelector(part, options);
    } else {
      element = await frame.waitForSelector(part, options);
    }
    if (!element) {
      throw new Error("Could not find element: " + selector.join(">>"));
    }
    if (i < selector.length - 1) {
      element = (
        await element.evaluateHandle((el) =>
          el.shadowRoot ? el.shadowRoot : el
        )
      ).asElement();
    }
  }
  if (!element) {
    throw new Error("Could not find element: " + selector.join("|"));
  }
  return element;
}

module.exports = {
  scrollIntoViewIfNeeded,
  changeSelectElement,
  changeElementValue,
  typeIntoElement,
  waitForConnected,
  waitForFunction,
  waitForInViewport,
  waitForSelector,
  waitForSelectors,
};
