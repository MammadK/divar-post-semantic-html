// document.addEventListener("DOMContentLoaded", () => {
//   const includes = Array.from(document.querySelectorAll("partial[include-html]"));

//   includes.forEach(async (el) => {
//     const file = el.getAttribute("include-html");
//     if (!file) return;

//     try {
//       // 1. Load HTML
//       const htmlRes = await fetch(file);
//       if (!htmlRes.ok) throw new Error(`HTTP error ${htmlRes.status}`);
//       const html = await htmlRes.text();

//       // 2. Generate hash and inject to root element
//       const hash = Math.random().toString(36).substring(2, 8);
//       const attrName = "data-scope";
//       const attrValue = hash;

//       const temp = document.createElement("div");
//       temp.innerHTML = html.trim();
//       const root = temp.firstElementChild;
//       if (!root) throw new Error(`No root element in ${file}`);
//       root.setAttribute(attrName, attrValue);

//       // 3. Load and transform CSS
//       const cssPath = file.replace(/\.html$/, ".css");
//       const cssRes = await fetch(cssPath);
//       if (cssRes.ok) {
//         let css = await cssRes.text();

//         // Match first selector and append [data-scope="..."] directly to it
//         css = css.replace(/^([^{\n]+)\s*\{/, (_, selector) => {
//           const trimmed = selector.trim();
//           // Inject attribute into the first simple selector
//           const updatedSelector = trimmed.replace(
//             /^([^\s]+)/,
//             `$1[${attrName}="${attrValue}"]`
//           );
//           return `${updatedSelector} {`;
//         });

//         const styleTag = document.createElement("style");
//         styleTag.textContent = css;
//         document.head.appendChild(styleTag);
//       }

//       // 4. Inject the actual HTML in DOM
//       el.replaceWith(root);
//     } catch (err) {
//       console.error(`Error including ${file}:`, err);
//     }
//   });
// });








document.addEventListener("DOMContentLoaded", () => {
  const includes = Array.from(document.querySelectorAll("partial[include-html]"));

  const attrName = "data-scope";

  const processPartial = async (el) => {
    const file = el.getAttribute("include-html");
    if (!file) return;

    try {
      // Load HTML
      const htmlRes = await fetch(file);
      if (!htmlRes.ok) throw new Error(`HTTP error ${htmlRes.status}`);
      const html = await htmlRes.text();

      // Parse HTML and inject scope
      const temp = document.createElement("div");
      temp.innerHTML = html.trim();
      const root = temp.firstElementChild;
      if (!root) throw new Error(`No root element in ${file}`);

      const hash = Math.random().toString(36).substring(2, 8);
      root.setAttribute(attrName, hash);

      // Load and scope CSS
      const cssPath = file.replace(/\.html$/, ".css");
      const cssRes = await fetch(cssPath);
      if (cssRes.ok) {
        let css = await cssRes.text();

        // Scope first selector with data attribute
        css = css.replace(/^([^{\n]+)\s*\{/, (_, selector) => {
          const updated = selector.trim().replace(
            /^([^\s]+)/,
            `$1[${attrName}="${hash}"]`
          );
          return `${updated} {`;
        });

        const styleTag = document.createElement("style");
        styleTag.textContent = css;
        document.head.appendChild(styleTag);
      }

      el.replaceWith(root);
    } catch (err) {
      console.error(`Error including ${file}:`, err);
    }
  };

  // Sequentially await all includes
  (async () => {
    for (const el of includes) {
      await processPartial(el);
    }
  })();
});
