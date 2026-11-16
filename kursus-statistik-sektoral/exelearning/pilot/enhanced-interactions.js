/* IT Enterprise course-specific fork: ungraded checkpoint, native Form owns final score.
 * LCM enhanced interactions: offline video, image hotspot and optional SCORM question set. */
(() => {
  'use strict';

  const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  const readConfig = (root, selector) => {
    const node = root.querySelector(selector);
    return node ? JSON.parse(node.textContent) : null;
  };

  const icons = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"></path></svg>',
    volume: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6L8 10H4zm12-1a4 4 0 010 6m2-8a7 7 0 010 10"></path></svg>',
    mute: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6L8 10H4m8 2l8 8m0-8l-8 8"></path></svg>',
    fullscreen: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"></path></svg>',
    exit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8h5V3M21 8h-5V3M3 16h5v5M21 16h-5v5"></path></svg>'
  };

  function initVideo(root) {
    const cfg = readConfig(root, '.iv-config');
    const app = root.querySelector('.iv-app');
    if (!cfg || !app) return;
    const items = Array.isArray(cfg.interactions) ? cfg.interactions : [];
    const next = cfg.nextSelector ? document.querySelector(cfg.nextSelector) : null;
    const answered = new Set();
    let active = -1;
    let selected = null;
    let triggerTimes = [];
    if (next && cfg.hideNextUntilComplete !== false) next.hidden = true;

    app.innerHTML = `<div class="iv-shell">
      <header class="iv-header"><div><span class="scene-eyebrow">VIDEO INTERAKTIF</span><h2>${esc(cfg.title)}</h2><p>${esc(cfg.instruction)}</p></div><div class="iv-header-meta"><span class="iv-duration">${esc(cfg.durationLabel || 'Video pembelajaran')}</span><span class="iv-interaction-count" role="status">0 dari ${items.length} pertanyaan selesai</span></div></header>
      <div class="iv-video-frame"><video class="iv-video" playsinline preload="metadata" ${cfg.poster ? `poster="${esc(cfg.poster)}"` : ''}><source src="${esc(cfg.source)}" type="${esc(cfg.mime || 'video/mp4')}">Browser Anda tidak mendukung video HTML5.</video><div class="iv-question" hidden role="dialog" aria-modal="true" aria-labelledby="iv-question-title"><div class="iv-question-card"></div></div>
      <div class="iv-player-controls" role="group" aria-label="Kontrol video"><button type="button" class="iv-play" aria-label="Putar video">${icons.play}</button><span class="iv-time">0:00 / 0:00</span><div class="iv-timeline-wrap"><div class="iv-timeline" role="slider" tabindex="0" aria-label="Posisi video" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0" aria-valuetext="0:00"><span class="iv-timeline-fill"></span></div>${items.map((item, index) => `<button type="button" class="iv-marker" data-iv-marker="${index}" aria-label="Buka pertanyaan ${index + 1}, ${esc(item.timeLabel)}"><span>${index + 1}</span></button>`).join('')}</div><button type="button" class="iv-mute" aria-label="Bisukan video">${icons.volume}</button><input class="iv-volume" type="range" min="0" max="1" step="0.05" value="1" aria-label="Volume video"><button type="button" class="iv-player-fullscreen" aria-label="Buka video layar penuh">${icons.fullscreen}</button></div></div>
      <footer class="iv-footer"><p>Penanda bernomor pada timeline menunjukkan pertanyaan interaktif.</p><button type="button" class="iv-finish" hidden>${esc(cfg.continueLabel || 'Lanjutkan')}</button></footer></div>`;

    const video = app.querySelector('.iv-video');
    const frame = app.querySelector('.iv-video-frame');
    const overlay = app.querySelector('.iv-question');
    const card = app.querySelector('.iv-question-card');
    const finish = app.querySelector('.iv-finish');
    const fill = app.querySelector('.iv-timeline-fill');
    const timeline = app.querySelector('.iv-timeline');
    const play = app.querySelector('.iv-play');
    const mute = app.querySelector('.iv-mute');
    const volume = app.querySelector('.iv-volume');
    if (cfg.hasAudio === false) { mute.hidden = true; volume.hidden = true; }
    const fullscreen = app.querySelector('.iv-player-fullscreen');
    const timeText = app.querySelector('.iv-time');
    const count = app.querySelector('.iv-interaction-count');
    const markers = [...app.querySelectorAll('.iv-marker')];
    const format = (value) => { const seconds = Math.max(0, Math.floor(Number(value) || 0)); return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`; };

    function updatePlayer() {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      const current = video.currentTime || 0;
      fill.style.width = duration ? `${Math.min(100, current / duration * 100)}%` : '0';
      timeText.textContent = `${format(current)} / ${format(duration)}`;
      timeline.setAttribute('aria-valuemax', String(Math.round(duration)));
      timeline.setAttribute('aria-valuenow', String(Math.round(current)));
      timeline.setAttribute('aria-valuetext', format(current));
    }

    function updateStatus() {
      count.textContent = `${answered.size} dari ${items.length} pertanyaan selesai`;
      markers.forEach((marker, index) => marker.classList.toggle('is-complete', answered.has(index)));
      finish.hidden = answered.size !== items.length;
    }

    function showQuestion(index) {
      if (answered.has(index)) return;
      const item = items[index];
      active = index;
      selected = null;
      video.pause();
      card.innerHTML = `<span class="iv-question-label">PERTANYAAN ${index + 1} DARI ${items.length} - ${esc(item.timeLabel)}</span><h3 id="iv-question-title" tabindex="-1">${esc(item.question)}</h3><fieldset><legend>Pilih satu jawaban.</legend>${item.options.map((option, optionIndex) => `<label><input type="radio" name="iv-answer" value="${optionIndex}"><span>${String.fromCharCode(65 + optionIndex)}. ${esc(option)}</span></label>`).join('')}</fieldset><div class="iv-question-actions"><button type="button" class="iv-check" disabled>Periksa jawaban</button><button type="button" class="iv-resume" hidden>Lanjutkan video</button></div><p class="iv-feedback" role="status"></p>`;
      overlay.hidden = false;
      card.querySelector('h3').focus({ preventScroll: true });
    }

    function nextDue() {
      if (active >= 0) return -1;
      return triggerTimes.findIndex((time, index) => !answered.has(index) && video.currentTime >= time);
    }

    function complete() {
      if (answered.size !== items.length) return;
      video.pause();
      root.dataset.complete = 'true';
      root.dispatchEvent(new CustomEvent(cfg.completeEvent || 'lcm-video-finish', { bubbles: true }));
      if (next && !window.iteSections) { root.hidden = true; next.hidden = false; next.querySelector('button,[tabindex]')?.focus({ preventScroll: true }); }
    }

    video.addEventListener('loadedmetadata', () => {
      const duration = video.duration;
      triggerTimes = items.map((item) => item.at === 'middle' ? duration / 2 : Number(item.at));
      markers.forEach((marker, index) => { marker.style.left = `${Math.min(100, Math.max(0, triggerTimes[index] / duration * 100))}%`; });
      updatePlayer();
    });
    video.addEventListener('timeupdate', () => { updatePlayer(); const due = nextDue(); if (due >= 0) showQuestion(due); });
    video.addEventListener('play', () => { play.innerHTML = icons.pause; play.setAttribute('aria-label', 'Jeda video'); });
    video.addEventListener('pause', () => { play.innerHTML = icons.play; play.setAttribute('aria-label', 'Putar video'); });
    video.addEventListener('ended', () => { const pending = items.findIndex((item, index) => !answered.has(index)); if (pending >= 0) showQuestion(pending); });
    play.addEventListener('click', () => { if (video.paused) video.play().catch(() => {}); else video.pause(); });
    video.addEventListener('click', () => play.click());
    mute.addEventListener('click', () => { video.muted = !video.muted; mute.innerHTML = video.muted ? icons.mute : icons.volume; });
    volume.addEventListener('input', () => { video.volume = Number(volume.value); video.muted = video.volume === 0; });
    timeline.addEventListener('pointerdown', (event) => { const rect = timeline.getBoundingClientRect(); video.currentTime = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)) * video.duration; });
    timeline.addEventListener('keydown', (event) => { if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return; event.preventDefault(); if (event.key === 'Home') video.currentTime = 0; else if (event.key === 'End') video.currentTime = video.duration; else video.currentTime = Math.min(video.duration, Math.max(0, video.currentTime + (event.key === 'ArrowRight' ? 5 : -5))); });
    fullscreen.addEventListener('click', () => { if (document.fullscreenElement === frame) document.exitFullscreen?.(); else frame.requestFullscreen?.(); });
    document.addEventListener('fullscreenchange', () => { const isFullscreen = document.fullscreenElement === frame; fullscreen.innerHTML = isFullscreen ? icons.exit : icons.fullscreen; fullscreen.setAttribute('aria-label', isFullscreen ? 'Keluar dari video layar penuh' : 'Buka video layar penuh'); });
    app.addEventListener('change', (event) => { const input = event.target.closest('input[name="iv-answer"]'); if (!input || active < 0) return; selected = Number(input.value); card.querySelector('.iv-check').disabled = false; });
    app.addEventListener('click', (event) => {
      const marker = event.target.closest('[data-iv-marker]');
      if (marker) { const index = Number(marker.dataset.ivMarker); video.currentTime = triggerTimes[index] || 0; showQuestion(index); return; }
      if (event.target.closest('.iv-check') && active >= 0 && selected !== null) { const item = items[active]; answered.add(active); card.querySelectorAll('input').forEach((input) => { input.disabled = true; }); card.querySelector('.iv-check').hidden = true; card.querySelector('.iv-resume').hidden = false; card.querySelector('.iv-feedback').innerHTML = `<b>${selected === Number(item.correct) ? 'Jawaban tepat.' : 'Jawaban belum tepat.'}</b> ${esc(item.feedback)}`; updateStatus(); return; }
      if (event.target.closest('.iv-resume')) { overlay.hidden = true; active = -1; selected = null; video.play().catch(() => {}); return; }
      if (event.target.closest('.iv-finish')) complete();
    });
    updateStatus();
  }

  function initHotspot(root) {
    const cfg = readConfig(root, '.hotspot-config');
    const app = root.querySelector('.hotspot-app');
    if (!cfg || !app) return;
    const found = new Set();
    const attempted = new Set();
    app.innerHTML = `<div class="hotspot-scroll"><header><span class="scene-eyebrow">IMAGE HOTSPOT</span><h2>${esc(cfg.title)}</h2><p>${esc(cfg.instruction)} Area yang dapat dipilih ditandai garis tipis, nomor, dan label singkat.</p><p class="hotspot-progress" role="status">0 dari ${cfg.required} komponen ditemukan.</p></header><div class="hotspot-layout"><div class="hotspot-image-wrap"><img src="${esc(cfg.background)}" alt="${esc(cfg.alt)}">${cfg.regions.map((region, index) => `<button type="button" class="hotspot-marker" style="left:${region.x}%;top:${region.y}%;width:${region.width}%;height:${region.height}%" data-hotspot="${esc(region.id)}" aria-label="Area ${index + 1}: ${esc(region.label)}" aria-pressed="false"><span class="hotspot-number">${index + 1}</span><small class="hotspot-caption">${esc(region.displayLabel || region.label)}</small></button>`).join('')}</div><aside class="hotspot-side"><h3>Alternatif keyboard</h3><p>Pilih objek pada gambar atau tombol dengan label yang sama.</p><div class="hotspot-list">${cfg.regions.map((region, index) => `<button type="button" data-hotspot="${esc(region.id)}">${index + 1}. ${esc(region.displayLabel || region.label)}</button>`).join('')}</div><div class="hotspot-feedback" role="status">Pilih objek pada gambar atau gunakan tombol area.</div><button type="button" class="hotspot-retry">Ulangi</button></aside></div></div>`;
    const progress = app.querySelector('.hotspot-progress');
    const feedback = app.querySelector('.hotspot-feedback');
    function choose(id) {
      const region = cfg.regions.find((item) => item.id === id);
      if (!region || attempted.has(id)) return;
      attempted.add(id);
      app.querySelectorAll(`[data-hotspot="${CSS.escape(id)}"]`).forEach((button) => { button.setAttribute('aria-pressed', 'true'); button.classList.add(region.correct ? 'is-correct' : 'is-wrong'); });
      feedback.textContent = region.feedback;
      if (region.correct) found.add(id);
      progress.textContent = `${found.size} dari ${cfg.required} komponen ditemukan.`;
      if (found.size === cfg.required) { root.dataset.complete = 'true'; progress.textContent = 'Semua komponen ditemukan.'; root.dispatchEvent(new CustomEvent(cfg.completeEvent || 'lcm-hotspot-complete', { bubbles: true })); }
    }
    app.addEventListener('click', (event) => { const choice = event.target.closest('[data-hotspot]'); if (choice) choose(choice.dataset.hotspot); if (event.target.closest('.hotspot-retry')) { found.clear(); attempted.clear(); root.dataset.complete = 'false'; app.querySelectorAll('[data-hotspot]').forEach((button) => { button.setAttribute('aria-pressed', 'false'); button.classList.remove('is-correct', 'is-wrong'); }); progress.textContent = `0 dari ${cfg.required} komponen ditemukan.`; feedback.textContent = 'Pilih objek pada gambar atau gunakan tombol area.'; } });
  }

  function initQuestionSet(root) {
    const cfg = readConfig(root, '.quiz-set-config');
    const app = root.querySelector('.quiz-set-app');
    if (!cfg || !app) return;
    const answers = Array(cfg.questions.length).fill(null);
    let current = 0;
    let finished = false;
    const activityId = cfg.activityId || 'lcm-question-set';
    const scored = cfg.scored !== false;
    const registry = scored ? window.exeScorm12?.activities : null;
    const policy = scored ? window.exeScorm12?.policy : null;
    const client = scored ? window.exeScorm12?.client : null;
    if (scored) window.exeScorm12?.setPageHasScoredActivities?.(true);
    registry?.register(activityId, { evaluable: true, completionRequired: true, completed: false, answered: 0, total: cfg.questions.length, score: null, minimumScore: 0, maximumScore: 100, weight: 1, successThreshold: 0 });
    const score = () => Math.round(cfg.questions.reduce((total, question, index) => total + (answers[index] === question.correct ? 100 / cfg.questions.length : 0), 0));
    function persist(value) { if (!scored) return false; registry?.update(activityId, { evaluable: true, completionRequired: true, completed: true, answered: cfg.questions.length, total: cfg.questions.length, score: value, minimumScore: 0, maximumScore: 100, weight: 1, successThreshold: 0 }); if (!client?.isActive?.() || !policy) return false; const write = policy.setScoreDetailed(value, 0, 100); policy.persistActivities(); policy.recordActivityOutcome(value); return write.requiredWritten === true && client.commit(); }
    function render() {
      root.scrollTop = 0;
      if (finished) { const value = Number(root.dataset.score); app.innerHTML = `<div class="quiz-set-scroll quiz-result"><span class="scene-eyebrow">HASIL LATIHAN KONSEP</span><h2>${esc(cfg.title)}</h2><div class="quiz-score"><strong>${value}</strong><span>/100</span></div><div class="quiz-result-list">${cfg.questions.map((question, index) => `<div class="${answers[index] === question.correct ? 'is-correct' : 'is-wrong'}"><b>Soal ${index + 1}: ${answers[index] === question.correct ? 'Benar' : 'Belum tepat'}</b><p>${esc(question.feedback)}</p></div>`).join('')}</div><button type="button" class="quiz-retry">Ulangi latihan</button></div>`; return; }
      const question = cfg.questions[current];
      app.innerHTML = `<div class="quiz-set-scroll"><header class="quiz-set-head"><div><span class="scene-eyebrow">LATIHAN KONSEP</span><h2>${esc(cfg.title)}</h2><p>${esc(cfg.intro)}</p></div><div class="quiz-count">Soal ${current + 1} dari ${cfg.questions.length}</div></header><section class="quiz-card"><fieldset><legend>${esc(question.question)}</legend>${question.options.map((option, index) => `<label class="quiz-option ${answers[current] === index ? 'is-selected' : ''}"><input type="radio" name="quiz-${esc(question.id)}" value="${index}" ${answers[current] === index ? 'checked' : ''}><span>${String.fromCharCode(65 + index)}. ${esc(option)}</span></label>`).join('')}</fieldset></section><footer class="quiz-actions"><button type="button" class="quiz-prev" ${current === 0 ? 'disabled' : ''}>Sebelumnya</button><span>${answers.filter((answer) => answer !== null).length} dari ${cfg.questions.length} dijawab</span><button type="button" class="quiz-next">${current === cfg.questions.length - 1 ? 'Periksa latihan' : 'Berikutnya'}</button></footer><p class="quiz-alert" role="status"></p></div>`;
    }
    app.addEventListener('change', (event) => { const input = event.target.closest('input[type="radio"]'); if (!input) return; answers[current] = Number(input.value); app.querySelectorAll(".quiz-option").forEach(label => label.classList.toggle("is-selected", label.contains(input))); });
    app.addEventListener('click', (event) => { if (event.target.closest('.quiz-prev')) { current = Math.max(0, current - 1); render(); return; } if (event.target.closest('.quiz-next')) { if (current < cfg.questions.length - 1) { current += 1; render(); return; } if (answers.some((answer) => answer === null)) { app.querySelector('.quiz-alert').textContent = 'Jawab seluruh pertanyaan sebelum menyelesaikan kuis.'; return; } const value = score(); root.dataset.score = String(value); root.dataset.complete = 'true'; root.dataset.scormSaved = persist(value) ? 'true' : 'false'; finished = true; render(); root.dispatchEvent(new CustomEvent(cfg.completeEvent || 'lcm-quiz-complete', { bubbles: true, detail: { score: value } })); return; } if (event.target.closest('.quiz-retry')) {
      answers.fill(null); current = 0; finished = false;
      root.dataset.complete = 'false'; root.dataset.score = ''; root.dataset.scormSaved = 'false';
      registry?.update(activityId, { evaluable: true, completionRequired: true, completed: false, answered: 0, total: cfg.questions.length, score: null, minimumScore: 0, maximumScore: 100, weight: 1, successThreshold: 0 });
      if (client?.isActive?.() && policy) {
        policy.reconcilePendingActivities?.(); policy.persistActivities(); client.commit();
      }
      render();
    } });
    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!document.body.classList.contains('exe-export')) return;
    document.querySelectorAll('.iv-root').forEach(initVideo);
    document.querySelectorAll('.hotspot-root').forEach(initHotspot);
    document.querySelectorAll('.quiz-set-root[data-renderer="lcm-question-set"]').forEach(initQuestionSet);
  });
})();
