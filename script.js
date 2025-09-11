document.addEventListener('DOMContentLoaded', function () {
  // (1) 자동 콜론 입력
  function autoColonFormat(input) {
    input.addEventListener('input', function () {
      let raw = input.value.replace(/[^0-9]/g, '').slice(0, 6);
      if (raw.length >= 5) input.value = raw.replace(/(\d{2})(\d{2})(\d{0,2})/, '$1:$2:$3');
      else if (raw.length >= 3) input.value = raw.replace(/(\d{2})(\d{0,2})/, '$1:$2');
      else input.value = raw;
    });
  }
  ['rallyRemainTime', 'enemyMarchTime', 'utcTime', 'SwitchTime'].forEach(id => {
    autoColonFormat(document.getElementById(id));
  });

  // --------------------------
  // (2) Enemy / Switch 체크박스 & SwitchTime 활성/비활성 + 회색 처리
  // --------------------------
  const useEnemyCheckbox = document.getElementById('useEnemyTimeCheckbox');
  const useSwitchCheckbox = document.getElementById('useSwitchTimeCheckbox');
  const enemyFields = ['rallyRemainTime', 'enemyMarchTime'];
  const switchTimeInput = document.getElementById('SwitchTime');

  // Enemy 입력 필드 활성/비활성
  function toggleEnemyFields(enabled) {
    enemyFields.forEach(id => {
      const el = document.getElementById(id);
      el.disabled = !enabled;
      el.classList.toggle('bg-gray-200', !enabled);
    });
  }

  // SwitchTime 입력 활성/비활성 + 회색 처리
  function toggleSwitchField(enabled) {
    switchTimeInput.disabled = !enabled;
    switchTimeInput.classList.toggle('bg-gray-200', !enabled);
  }

  // Enemy 체크 변경
  useEnemyCheckbox.addEventListener('change', () => {
    if (useEnemyCheckbox.checked) {
      useSwitchCheckbox.checked = false; // Switch 체크 해제
      toggleSwitchField(false);          // SwitchTime 비활성화
    }
    toggleEnemyFields(useEnemyCheckbox.checked);
  });

  // Switch 체크 변경
  useSwitchCheckbox.addEventListener('change', () => {
    if (useSwitchCheckbox.checked) {
      useEnemyCheckbox.checked = false; // Enemy 체크 해제
      toggleEnemyFields(false);          // Enemy 필드 비활성화
    }
    toggleSwitchField(useSwitchCheckbox.checked);
  });

  // 초기 상태 적용
  toggleEnemyFields(useEnemyCheckbox.checked);
  toggleSwitchField(useSwitchCheckbox.checked);

  // --------------------------
  // (3) UTC 자동 입력
  // --------------------------
  const useUtcCheckbox = document.getElementById('useUtcCheckbox');
  const rallyRemainTime = document.getElementById('rallyRemainTime');
  const utcTimeInput = document.getElementById('utcTime');

  rallyRemainTime.addEventListener('input', () => {
    const value = rallyRemainTime.value.trim();
    const timeFormat = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
    if (useUtcCheckbox.checked && timeFormat.test(value)) {
      const now = new Date();
      const utcHours = String(now.getUTCHours()).padStart(2, '0');
      const utcMinutes = String(now.getUTCMinutes()).padStart(2, '0');
      const utcSeconds = String(now.getUTCSeconds()).padStart(2, '0');
      utcTimeInput.value = `${utcHours}:${utcMinutes}:${utcSeconds}`;
    }
  });

  // --------------------------
  // (4) 리셋 버튼
  // --------------------------
  document.getElementById('resetRallyRemainTime').addEventListener('click', () => rallyRemainTime.value = '');
  document.getElementById('resetEnemyMarchTime').addEventListener('click', () => document.getElementById('enemyMarchTime').value = '');
  document.getElementById('resetUtcTime').addEventListener('click', () => utcTimeInput.value = '');
  document.getElementById('resetSwitchTime').addEventListener('click', () => switchTimeInput.value = '');

  // --------------------------
  // (5) 설명 복사 버튼
  // --------------------------
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(() => { alert('복사에 실패했습니다.'); });
  }

  document.getElementById("btnCopyExplain").addEventListener("click", () => {
    let explainTexts = [];
    for (let i = 0; i <= 7; i++) {
      const el = document.getElementById(`explain${i}`) || document.getElementById("explainStart1");
      if (el && el.textContent.trim() !== '') {
        let text = el.innerHTML.replace(/<br\s*\/?>/gi, '\n').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        explainTexts.push(text.trim());
      }
    }
    if (explainTexts.length > 0) copyToClipboard(explainTexts.join("\n"));
  });

  // --------------------------
  // (6) 계산하기 버튼
  // --------------------------
  document.getElementById("btnCalcExplain").addEventListener("click", () => {
    const useEnemy = useEnemyCheckbox.checked;
    const useSwitch = useSwitchCheckbox.checked;

    if (!useEnemy && !useSwitch) {
      alert("적어도 하나의 체크박스를 선택해야 합니다.");
      return;
    }

    if (useEnemy && useSwitch) {
      alert("Enemy 계산과 Switch 계산은 동시에 선택할 수 없습니다.");
      return;
    }

    // 1️⃣ Enemy 계산
    if (useEnemy) {
      const rallySec = parseTimeToSeconds(rallyRemainTime.value);
      const enemySec = parseTimeToSeconds(document.getElementById('enemyMarchTime').value);
      const utcSec = parseTimeToSeconds(utcTimeInput.value);

      if (rallySec === null || enemySec === null || utcSec === null) {
        alert("모든 시간 입력이 올바른 HH:mm:ss 형식이어야 합니다.");
        return;
      }

      const totalSec = rallySec + enemySec + utcSec;
      const explainStartEl = document.getElementById("explainStart1");
      const totalMinSec = formatSecondsToMinSec(totalSec);
      explainStartEl.innerHTML = `※ 공격 도착시간 : ${totalMinSec}<br>- 주유 준비하세요<br><br>&lt;행군&gt; | 주유시간`;
      explainStartEl.classList.add("text-blue-600");

      const offsets = [60, 55, 50, 45, 40, 35, 30];
      offsets.forEach((offset, idx) => {
        const resultSec = totalSec - offset;
        const minSecText = formatSecondsToMinSec(resultSec);
        const el = document.getElementById(`explain${idx + 1}`);
        if (el) el.textContent = `*${offset}초* | ${minSecText}`;
      });
    }

    // 2️⃣ Switch 계산
    if (useSwitch) {
      const switchSec = parseTimeToSeconds(switchTimeInput.value);
      if (switchSec === null) {
        alert("SwitchTime 입력이 올바른 HH:mm:ss 형식이어야 합니다.");
        return;
      }

      const totalSec = switchSec;
      const explainStartEl = document.getElementById("explainStart1");
      const switchMinSec = formatSecondsToMinSec(switchSec);
      explainStartEl.innerHTML = `※ 스위칭 목표시간 : ${switchMinSec}<br>- 5초전 병력 비워주세요<br><br>&lt;행군&gt; | 주유시간`;
      explainStartEl.classList.add("text-blue-600");

      const offsets = [60, 55, 50, 45, 40, 35, 30];
      offsets.forEach((offset, idx) => {
        const resultSec = totalSec - offset;
        const minSecText = formatSecondsToMinSec(resultSec);
        const el = document.getElementById(`explain${idx + 1}`);
        if (el) el.textContent = `*${offset}초* | ${minSecText}`;
      });
    }
  });

  // --------------------------
  // (7) Switch 체크박스 그룹 → UTC + offset 자동 반영
  // --------------------------
  const switchCheckboxes = [
    {id: 'useSwitchCheckbox1', offset: 60},
    {id: 'useSwitchCheckbox2', offset: 90},
    {id: 'useSwitchCheckbox3', offset: 120}
  ];

  switchCheckboxes.forEach((item, idx) => {
    const cb = document.getElementById(item.id);
    cb.addEventListener('change', () => {
      if (cb.checked) {
        switchCheckboxes.forEach((other, j) => {
          if (j !== idx) document.getElementById(other.id).checked = false;
        });

        const now = new Date();
        const utcSeconds = now.getUTCHours()*3600 + now.getUTCMinutes()*60 + now.getUTCSeconds() + item.offset;
        const h = Math.floor(utcSeconds / 3600) % 24;
        const m = Math.floor((utcSeconds % 3600)/60);
        const s = utcSeconds % 60;
        switchTimeInput.value = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      } else {
        switchTimeInput.value = '';
      }
    });
  });

  // 유틸: HH:mm:ss → 초
  function parseTimeToSeconds(timeStr) {
    const parts = timeStr.trim().split(":").map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    return parts[0]*3600 + parts[1]*60 + parts[2];
  }

  // 초 → "분 초" (시간 제외)
  function formatSecondsToMinSec(seconds) {
    if (seconds < 0) seconds = 0;
    const totalMinutes = Math.floor(seconds/60);
    const s = seconds % 60;
    const m = totalMinutes % 60; // 시간 제외
    return `${m}분 ${s}초`;
  }
});