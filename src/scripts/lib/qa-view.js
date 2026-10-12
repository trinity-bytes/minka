// DOM side of the listing Q&A (T12). Markup: src/components/detail/QaSection.astro;
// pure logic (validation, sorting, owner flag, seeds): ./qa.js.
//
// Rows are built with DOM APIs and textContent, so stored names and texts are
// never parsed as HTML. Avatar and Badge are cloned from server-rendered
// <template>s so their scoped component styles apply.
//
// Persistence follows the chat pattern (one JSON map in localStorage keyed by
// conversation, read/write wrapped in try/catch); here the map is keyed by
// listing id under `minka_questions`. Store (public/assets/scripts/core) has
// no Q&A accessor yet, so this module owns the key.
import { avatarTone, initials, AVATAR_TONES } from "./avatar.js";
import { tr } from "./i18n.js";
import {
  QA_MAX_LENGTH,
  addQuestion,
  addReply,
  buildThreads,
  formatRelativeTime,
  ownerIdOf,
  questionCountLabel,
  seedQuestions,
  userIdOf,
  validateQaText,
} from "./qa.js";

const STORAGE_KEY = "minka_questions";

function readAll() {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return all && typeof all === "object" && !Array.isArray(all) ? all : {};
  } catch {
    return {};
  }
}

function loadQuestions(item) {
  const stored = readAll()[item.id];
  return Array.isArray(stored) ? stored : seedQuestions(item);
}

function saveQuestions(itemId, questions) {
  try {
    const all = readAll();
    all[itemId] = questions;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return true;
  } catch (error) {
    console.warn("Q&A: no se pudo guardar", error);
    return false;
  }
}

const newId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

function errorMessage(kind, result) {
  if (result.error === "empty") {
    return kind === "reply"
      ? tr("qa_error_reply_empty", "Escribe una respuesta antes de publicar.")
      : tr("qa_error_question_empty", "Escribe una pregunta antes de publicar.");
  }
  return tr("qa_error_too_long", "Usa como máximo {max} caracteres (te sobran {over}).", {
    max: QA_MAX_LENGTH,
    over: -result.remaining,
  });
}

/** Localized count line: "Sin preguntas", "1 pregunta", "3 preguntas". */
function countLabel(count) {
  if (!count) return tr("qa_count_none", questionCountLabel(0));
  if (count === 1) return tr("qa_count_one", questionCountLabel(1));
  return tr("qa_count_other", "{count} preguntas", { count });
}

const neighbor = () => tr("qa_neighbor", "Vecino");

/**
 * Character counter + validation shared by the ask and reply forms.
 * `onValid(text)` runs with the trimmed text when the form is submitted.
 */
function wireForm({ form, field, count, error, kind, onValid }) {
  const update = () => {
    const length = field.value.trim().length;
    count.textContent = `${length} / ${QA_MAX_LENGTH}`;
    count.classList.toggle("is-over", length > QA_MAX_LENGTH);
    if (field.getAttribute("aria-invalid") === "true" && validateQaText(field.value).ok) {
      field.removeAttribute("aria-invalid");
      error.hidden = true;
      error.textContent = "";
    }
  };
  field.addEventListener("input", update);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const result = validateQaText(field.value);
    if (!result.ok) {
      field.setAttribute("aria-invalid", "true");
      error.textContent = errorMessage(kind, result);
      error.hidden = false;
      field.focus();
      return;
    }
    onValid(result.value);
  });
  update();
}

/**
 * Mounts the Q&A for a listing. `session` is the minka_session object or null.
 * @param {{item: object, session: object | null}} options
 */
export function mountQa({ item, session }) {
  const root = document.getElementById("qa");
  if (!root || !item?.id) return;

  const list = root.querySelector("#qa-list");
  const empty = root.querySelector("#qa-empty");
  const countEl = root.querySelector("#qa-count");
  const status = root.querySelector("#qa-status");
  const askForm = root.querySelector("#qa-ask-form");
  const login = root.querySelector("#qa-login");
  const avatarTpl = root.querySelector("#qa-avatar-tpl");
  const badgeTpl = root.querySelector("#qa-badge-tpl");

  const ownerId = ownerIdOf(item);
  const userId = userIdOf(session);
  const me = userId ? { id: userId, name: session.name || neighbor() } : null;
  let questions = loadQuestions(item);
  let openReply = null; // { questionId, form, trigger }

  const announce = (text) => {
    status.textContent = "";
    requestAnimationFrame(() => (status.textContent = text));
  };

  function avatarFor(name) {
    const node = avatarTpl.content.firstElementChild.cloneNode(true);
    AVATAR_TONES.forEach((tone) => node.classList.remove(`avatar--${tone}`));
    node.classList.add(`avatar--${avatarTone(name)}`);
    node.textContent = initials(name);
    return node;
  }

  function postNode(entry, { reply }) {
    const article = document.createElement("article");
    article.className = reply ? "qa-post qa-post--reply" : "qa-post";
    article.id = `qa-${entry.id}`;
    article.tabIndex = -1;
    article.append(avatarFor(entry.authorName || "?"));

    const body = document.createElement("div");
    body.className = "qa-post__body";

    const head = document.createElement("p");
    head.className = "qa-post__head";
    const who = document.createElement("span");
    who.className = "qa-post__name";
    const prefix = document.createElement("span");
    prefix.className = "sr-only";
    prefix.textContent = `${reply ? tr("qa_reply_by", "Respuesta de") : tr("qa_question_by", "Pregunta de")} `;
    who.append(prefix, document.createTextNode(entry.authorName || neighbor()));
    head.append(who);
    if (entry.isOwner) {
      const badge = badgeTpl.content.firstElementChild.cloneNode(true);
      badge.textContent = tr("qa_author", "Autor");
      head.append(badge);
    }
    const time = document.createElement("time");
    time.className = "qa-post__time";
    const date = new Date(entry.createdAt);
    time.dateTime = date.toISOString();
    time.title = date.toLocaleString("es-PE", { dateStyle: "long", timeStyle: "short" });
    time.textContent = formatRelativeTime(entry.createdAt);
    head.append(time);

    const text = document.createElement("p");
    text.className = "qa-post__text";
    text.textContent = entry.text;

    body.append(head, text);
    article.append(body);
    return article;
  }

  function threadNode(thread) {
    const li = document.createElement("li");
    li.className = "qa-thread";
    li.dataset.questionId = thread.id;
    const question = postNode(thread, { reply: false });
    li.append(question);

    if (me) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "qa-post__reply";
      button.textContent = tr("qa_reply", "Responder");
      button.setAttribute(
        "aria-label",
        tr("qa_reply_to", "Responder a {name}", { name: thread.authorName || neighbor() })
      );
      button.setAttribute("aria-expanded", "false");
      button.addEventListener("click", () => toggleReply(thread, li, button));
      question.querySelector(".qa-post__body").append(button);
    }

    if (thread.replies.length) {
      const replies = document.createElement("ol");
      replies.className = "qa-replies";
      replies.setAttribute("role", "list");
      replies.setAttribute(
        "aria-label",
        tr("qa_replies_to", "Respuestas a {name}", { name: thread.authorName || neighbor() })
      );
      thread.replies.forEach((r) => {
        const item = document.createElement("li");
        item.append(postNode(r, { reply: true }));
        replies.append(item);
      });
      li.append(replies);
    }
    return li;
  }

  function render() {
    const threads = buildThreads(questions, ownerId);
    list.replaceChildren(...threads.map(threadNode));
    list.hidden = threads.length === 0;
    empty.hidden = threads.length > 0;
    countEl.textContent = countLabel(threads.length);
    openReply = null;
  }

  function closeReply({ restoreFocus } = {}) {
    if (!openReply) return;
    const { form, trigger } = openReply;
    form.remove();
    trigger.setAttribute("aria-expanded", "false");
    openReply = null;
    if (restoreFocus) trigger.focus();
  }

  function toggleReply(thread, li, trigger) {
    if (openReply?.questionId === thread.id) {
      closeReply({ restoreFocus: true });
      return;
    }
    closeReply();

    const form = document.createElement("form");
    form.className = "qa-form qa-form--reply";
    form.id = "qa-reply-form";
    form.noValidate = true;
    form.innerHTML = `
      <label class="sr-only" for="qa-reply-text"></label>
      <textarea id="qa-reply-text" name="text" rows="2"
        aria-describedby="qa-reply-count qa-reply-error"></textarea>
      <div class="qa-form__foot">
        <p class="qa-form__error" id="qa-reply-error" hidden></p>
        <span class="qa-form__count" id="qa-reply-count"></span>
        <button class="btn btn-ghost" type="button" data-qa-cancel></button>
        <button class="btn btn-primary" type="submit"></button>
      </div>`;
    const field = form.querySelector("textarea");
    form.querySelector("label").textContent = tr("qa_reply_label", "Tu respuesta a {name}", {
      name: thread.authorName || neighbor(),
    });
    field.placeholder = tr("qa_reply_placeholder", "Escribe tu respuesta");
    form.querySelector("[data-qa-cancel]").textContent = tr("common_cancel", "Cancelar");
    form.querySelector("[type=submit]").textContent = tr("qa_reply_submit", "Publicar respuesta");
    trigger.setAttribute("aria-controls", form.id);
    trigger.setAttribute("aria-expanded", "true");

    form.querySelector("[data-qa-cancel]").addEventListener("click", () => closeReply({ restoreFocus: true }));
    form.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeReply({ restoreFocus: true });
      }
    });
    wireForm({
      form,
      field,
      count: form.querySelector("#qa-reply-count"),
      error: form.querySelector("#qa-reply-error"),
      kind: "reply",
      onValid: (text) => {
        const id = newId("r");
        questions = addReply(questions, thread.id, { id, author: me, text, createdAt: Date.now() });
        saveQuestions(item.id, questions);
        render();
        announce(tr("qa_posted_reply", "Respuesta publicada."));
        document.getElementById(`qa-${id}`)?.focus();
      },
    });

    li.append(form);
    openReply = { questionId: thread.id, form, trigger };
    field.focus();
  }

  if (me) {
    askForm.hidden = false;
    const field = askForm.querySelector("#qa-ask-text");
    wireForm({
      form: askForm,
      field,
      count: askForm.querySelector("#qa-ask-count"),
      error: askForm.querySelector("#qa-ask-error"),
      kind: "question",
      onValid: (text) => {
        const id = newId("q");
        questions = addQuestion(questions, { id, author: me, text, createdAt: Date.now() });
        saveQuestions(item.id, questions);
        field.value = "";
        field.dispatchEvent(new Event("input"));
        render();
        announce(tr("qa_posted_question", "Pregunta publicada."));
        document.getElementById(`qa-${id}`)?.focus();
      },
    });
  } else {
    login.hidden = false;
    const link = root.querySelector("#qa-login-link");
    const back = `detalle.html${window.location.search}`;
    link.href = `${link.getAttribute("href")}?redirect=${encodeURIComponent(back)}`;
  }

  render();
}
