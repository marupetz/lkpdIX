(() => {
  'use strict';

  // Tempel URL Web App Google Apps Script Anda yang berakhiran /exec.
  const GOOGLE_SCRIPT_URL = "TEMPEL_URL_WEB_APP_GOOGLE_APPS_SCRIPT_DI_SINI";

  let xp = 0;
  const done = {};
  let understanding = 'Belum dipilih';
  let finalData = null;
  let alreadySent = false;

  const $ = (id) => document.getElementById(id);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  function go(n) {
    $$('.page').forEach(page => page.classList.remove('on'));
    const target = $('p' + n);
    if (!target) return;
    target.classList.add('on');
    const progress = $('pb');
    if (progress) progress.style.width = Math.min(100, n * 10) + '%';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function add(points, key) {
    if (!done[key]) {
      done[key] = 1;
      xp += points;
      $('xp').textContent = String(xp);
    }
  }

  function selectIn(parentSelector, button) {
    $$(parentSelector + ' .opt').forEach(x => x.classList.remove('sel'));
    button.classList.add('sel');
  }

  function warm(value, button) {
    selectIn('#p3', button);
    const feedback = $('wf');
    const correct = Number(value) === 10;
    feedback.className = 'fb ' + (correct ? 'good' : 'bad');
    feedback.textContent = correct
      ? '🎯 Tepat! Polanya bertambah 2.'
      : '🔎 Coba lagi. Perhatikan selisihnya: +2.';
    if (correct) add(10, 'w');
  }

  function buildPattern() {
    const grid = $('eg');
    if (!grid || grid.children.length) return;
    for (let i = 0; i < 9; i++) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'cell';
      button.dataset.index = String(i);
      button.setAttribute('aria-label', 'Kotak ' + (i + 1));
      grid.appendChild(button);
    }
  }

  function checkPattern() {
    const selected = $$('#eg .cell.b')
      .map(x => Number(x.dataset.index))
      .sort((a, b) => a - b);
    const correct = JSON.stringify(selected) === JSON.stringify([0, 4, 8]);
    const feedback = $('ef');
    feedback.className = 'fb ' + (correct ? 'good' : 'bad');
    feedback.textContent = correct
      ? '🎯 Tepat! Polanya membentuk diagonal.'
      : '🔎 Belum tepat. Amati arah dari kiri atas ke kanan bawah.';
    if (correct) add(15, 'pat');
  }

  function logic(value, button) {
    selectIn('#p5', button);
    const correct = value === true;
    const feedback = $('lf');
    feedback.className = 'fb ' + (correct ? 'good' : 'bad');
    feedback.textContent = correct
      ? '🎯 Benar! XOR = True jika berbeda.'
      : '🔎 True dan False berbeda, jadi XOR = True.';
    if (correct) add(10, 'xor');
  }

  function level(number, correct, button) {
    button.parentElement.querySelectorAll('.opt').forEach(x => x.classList.remove('sel'));
    button.classList.add('sel');
    const box = $('l' + number);
    box.className = 'fb ' + (correct ? 'good' : 'bad');
    box.textContent = correct
      ? '🎯 Good job! Jawaban benar.'
      : '🔎 Belum tepat. Gunakan aturan operator.';
    if (correct) add([0, 10, 15, 25][number], 'l' + number);
  }

  function operator(value, button) {
    selectIn('#p7', button);
    const correct = value === 'AND';
    const feedback = $('of');
    feedback.className = 'fb ' + (correct ? 'good' : 'bad');
    feedback.textContent = correct
      ? '🎯 Tepat! Kedua syarat harus terpenuhi.'
      : '🔎 Kata kuncinya adalah “DAN”: kedua syarat harus benar.';
    if (correct) add(15, 'op');
  }

  function setUnderstanding(value, button) {
    selectIn('#p9', button);
    understanding = value;
  }

  function calculateScore() {
    let earned = 0;
    let max = 0;
    const items = [['w', 10], ['pat', 15], ['xor', 10], ['l1', 10], ['l2', 15], ['l3', 25], ['op', 15]];
    items.forEach(([key, value]) => {
      max += value;
      if (done[key]) earned += value;
    });
    return max ? Math.round((earned / max) * 100) : 0;
  }

  function values(ids) {
    return ids.map(id => ($(id)?.value || '').trim());
  }

  function collectAnswers() {
    return {
      aktivitas: done,
      analisis: values(['analisisMasalah', 'analisisKondisi', 'analisisOperator', 'analisisSyarat']),
      project: values(['projectMasalah', 'projectData', 'projectStrategi', 'projectSolusi', 'projectAlasan']),
      refleksi: values(['refleksiKonsep', 'refleksiBaru', 'refleksiTantangan', 'refleksiManfaat']),
      checklist: {
        pola: $('checkPola')?.checked || false,
        logika: $('checkLogika')?.checked || false,
        alasan: $('checkAlasan')?.checked || false
      },
      pemahaman: understanding
    };
  }

  function buildResult() {
    return {
      action: 'submit',
      nama: $('nama')?.value.trim() || 'Peserta didik',
      kelas: $('kelas')?.value || '',
      xp: xp,
      nilai: calculateScore(),
      pemahaman: understanding,
      selesai: new Date().toISOString(),
      jawaban: JSON.stringify(collectAnswers())
    };
  }

  function complete() {
    const nama = $('nama');
    const kelas = $('kelas');
    if (!nama || !nama.value.trim()) {
      alert('Silakan isi Nama terlebih dahulu.');
      go(2);
      nama?.focus();
      return;
    }
    if (!kelas || !kelas.value) {
      alert('Silakan pilih Kelas terlebih dahulu.');
      go(2);
      kelas?.focus();
      return;
    }
    finalData = buildResult();
    $('rn').textContent = finalData.nama;
    $('rx').textContent = xp + ' XP';
    $('ru').textContent = understanding;
    go(10);
  }

  async function sendResult() {
    const status = $('sendStatus');
    const button = $('sendBtn');
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('TEMPEL_URL')) {
      status.className = 'fb bad send-status';
      status.textContent = '⚠️ URL Google Apps Script belum dipasang. Tempel URL /exec pada GOOGLE_SCRIPT_URL terlebih dahulu.';
      return;
    }
    if (alreadySent) {
      status.className = 'fb good send-status';
      status.textContent = '✅ Hasil sudah dikirim ke Google Sheets.';
      return;
    }
    finalData = finalData || buildResult();
    button.disabled = true;
    button.textContent = '⏳ Mengirim...';
    status.className = 'fb good send-status';
    status.textContent = '⏳ Mengirim hasil ke Google Sheets...';

    try {
      // application/x-www-form-urlencoded aman untuk request no-cors ke Apps Script.
      const body = new URLSearchParams(finalData).toString();
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: body
      });
      alreadySent = true;
      button.textContent = '✅ HASIL TERKIRIM';
      status.textContent = '✅ Hasil berhasil dikirim. Guru dapat melihatnya di Google Sheets.';
    } catch (error) {
      button.disabled = false;
      button.textContent = '📤 KIRIM HASIL KE GURU';
      status.className = 'fb bad send-status';
      status.textContent = '❌ Pengiriman gagal. Periksa koneksi internet dan URL Google Apps Script.';
      console.error('Pengiriman LKPD gagal:', error);
    }
  }

  function handleAction(event) {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    if (action === 'go') go(Number(target.dataset.page));
    else if (action === 'warm') warm(Number(target.dataset.value), target);
    else if (action === 'toggle-example') $('ex')?.classList.toggle('hidden');
    else if (action === 'check-pattern') checkPattern();
    else if (action === 'logic') logic(target.dataset.value === 'true', target);
    else if (action === 'level') level(Number(target.dataset.level), target.dataset.correct === 'true', target);
    else if (action === 'operator') operator(target.dataset.value, target);
    else if (action === 'understanding') setUnderstanding(target.dataset.value, target);
    else if (action === 'complete') complete();
    else if (action === 'send-result') sendResult();
  }

  document.addEventListener('click', handleAction);
  document.addEventListener('click', event => {
    const cell = event.target.closest('#eg .cell');
    if (cell) cell.classList.toggle('b');
  });

  buildPattern();
  window.addEventListener('DOMContentLoaded', buildPattern);
})();
