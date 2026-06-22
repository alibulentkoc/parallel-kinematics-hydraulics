/* Shared formative-quiz engine for the PKM curriculum.
 * A quiz page defines `window.QUIZ = { title, intro, questions: [...] }` then includes this file.
 * Question types:
 *   { type:"mc",  q, options:[...], answer:<index>, explain }      single correct
 *   { type:"tf",  q, answer:true|false, explain }
 *   { type:"open", q, model }                                       reveal a model answer
 * Formative: unlimited attempts, immediate feedback, nothing recorded.
 */
(function () {
  const Q = window.QUIZ || { title: "Quiz", questions: [] };
  const root = document.getElementById("quiz") || document.body;

  const h = (tag, attrs = {}, ...kids) => {
    const e = document.createElement(tag);
    for (const k in attrs) {
      if (k === "class") e.className = attrs[k];
      else if (k.startsWith("on")) e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    }
    for (const kid of kids) e.append(kid?.nodeType ? kid : document.createTextNode(kid ?? ""));
    return e;
  };

  root.append(h("h1", {}, Q.title || "Knowledge Check"));
  root.append(h("p", { class: "muted" }, Q.intro || "Formative — unlimited attempts, immediate feedback. Not graded. Check your understanding, not your score."));

  let correct = 0,
    answered = 0;
  const scoreEl = h("div", { class: "score" }, "");
  function updateScore() {
    scoreEl.textContent = answered ? `Answered ${answered}/${Q.questions.length} · ${correct} correct so far` : "";
  }

  Q.questions.forEach((item, qi) => {
    const card = h("div", { class: "q" });
    card.append(h("div", { class: "qhead" }, `${qi + 1}. `, item.q));

    if (item.type === "open") {
      const btn = h("button", { class: "btn", onclick: () => { ans.style.display = ans.style.display === "block" ? "none" : "block"; } }, "Show a model answer");
      const ans = h("div", { class: "feedback model" }, item.model);
      ans.style.display = "none";
      card.append(btn, ans);
      root.append(card);
      return;
    }

    const opts = item.type === "tf" ? ["True", "False"] : item.options;
    const answerIndex = item.type === "tf" ? (item.answer ? 0 : 1) : item.answer;
    const fb = h("div", { class: "feedback" });
    let locked = false;
    opts.forEach((opt, oi) => {
      const b = h("button", { class: "opt", onclick: () => {
        Array.from(card.querySelectorAll(".opt")).forEach((x) => (x.disabled = false, x.classList.remove("sel")));
        b.classList.add("sel");
        const right = oi === answerIndex;
        if (!locked) { answered++; if (right) correct++; locked = true; }
        card.querySelectorAll(".opt").forEach((x, xi) => {
          x.classList.toggle("correct", xi === answerIndex);
          x.classList.toggle("wrong", xi === oi && !right);
        });
        fb.className = "feedback " + (right ? "good" : "bad");
        fb.textContent = (right ? "✓ Correct. " : "✗ Not quite. ") + (item.explain || "");
        fb.style.display = "block";
        updateScore();
      } }, opt);
      card.append(b);
    });
    fb.style.display = "none";
    card.append(fb);
    root.append(card);
  });

  root.append(scoreEl);
  root.append(h("p", { class: "muted" }, "Want more practice? Re-answer freely — attempts are unlimited and nothing here is recorded."));
})();
