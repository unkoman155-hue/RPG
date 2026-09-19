const SAVE_KEY = "yuusha_rpg_save_v2";

const defaultData = {
  name: "勇者",
  job: "勇者",
  maxHp: 30,
  hp: 30,
  level: 0,
  xp: 0,
  attack: 0,
  skillSlots: 0,
  skills: [],
  bounty: 0,
  money: 250,
  weapon: "タガー",
  inventory: {
    タガー: 1
  },
  defeats: 0,
  townUnlocked: false,
  townTrust: 15,
  cityUnlocked: false,
  cityTrust: 50,
  encyclopedia: {},
  totalBattles: 0
};

let data = loadData();
let enemy = null;
let defending = false;

function copyData(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function loadData() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);

    if (!saved) {
      return copyData(defaultData);
    }

    const parsed = JSON.parse(saved);

    return Object.assign(
      copyData(defaultData),
      parsed
    );
  } catch (error) {
    console.error("セーブデータ読み込みエラー:", error);
    return copyData(defaultData);
  }
}

function saveData() {
  try {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(data)
    );

    logMessage("💾 セーブしました！");
    updateStatus();
  } catch (error) {
    console.error("セーブエラー:", error);
    logMessage("❌ セーブに失敗しました。");
  }
}

function logMessage(message) {
  const log = document.getElementById("log");

  if (!log) {
    return;
  }

  log.textContent =
    message + "\n" + log.textContent;
}

function updateStatus() {
  const status = document.getElementById("status");

  if (!status) {
    return;
  }

  status.innerHTML = `
    <div class="stat">
      名前
      <b>${escapeHtml(data.name)}</b>
    </div>

    <div class="stat">
      職業
      <b>${escapeHtml(data.job)}</b>
    </div>

    <div class="stat">
      Lv
      <b>${data.level}</b>
    </div>

    <div class="stat">
      HP
      <b>${data.hp}/${data.maxHp}</b>
    </div>

    <div class="stat">
      攻撃
      <b>${data.attack}</b>
    </div>

    <div class="stat">
      XP
      <b>${data.xp}</b>
    </div>

    <div class="stat">
      お金
      <b>${data.money}円</b>
    </div>

    <div class="stat">
      懸賞金
      <b>${data.bounty}円</b>
    </div>
  `;
}

function escapeHtml(text) {
  return String(text).replace(
    /[&<>"']/g,
    function (character) {
      const table = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      };

      return table[character];
    }
  );
}

const enemies = [
  {
    id: "monster_cat",
    name: "怪物猫",
    minLv: 1,
    maxLv: 5,
    hp: 20,
    xp: 25,
    area: "草原",
    drop: "タガー"
  },

  {
    id: "grass_slime",
    name: "草原スライム",
    minLv: 1,
    maxLv: 4,
    hp: 25,
    xp: 30,
    area: "草原",
    drop: "薬草"
  },

  {
    id: "goblin",
    name: "ゴブリン",
    minLv: 2,
    maxLv: 6,
    hp: 35,
    xp: 40,
    area: "町外れ",
    drop: "剣"
  },

  {
    id: "black_wolf",
    name: "黒狼",
    minLv: 3,
    maxLv: 7,
    hp: 45,
    xp: 55,
    area: "都市周辺",
    drop: "薬草"
  }
];

function showHome() {
  const screen = document.getElementById("screen");

  screen.innerHTML = `
    <h2>🏠 冒険のホーム</h2>

    <p>
      敵を倒してXPと戦利品を集めよう！
    </p>

    <div class="item">
      🗡️ 装備：${escapeHtml(data.weapon)}
    </div>

    <div class="item">
      🎯 撃破数：${data.defeats}体
    </div>

    <div class="item">
      🏘️ 町：
      ${data.townUnlocked ? "解放済み" : "3体撃破で解放"}
    </div>

    <div class="item">
      🏙️ 都市：
      ${data.cityUnlocked ? "解放済み" : "8体撃破で解放"}
    </div>

    <button onclick="startBattle()">
      ⚔️ 冒険へ
    </button>
  `;

  updateStatus();
}

function beginGame() {
  const input = document.getElementById("nameInput");

  if (input) {
    const name = input.value.trim();

    if (name !== "") {
      data.name = name;
    }
  }

  saveData();
  showJobSelect();
}

function showJobSelect() {
  const screen = document.getElementById("screen");

  screen.innerHTML = `
    <h2>🧑‍🎤 役職を選択</h2>

    <button
      class="choice"
      onclick="selectJob('勇者')"
    >
      🦸 勇者
      <br>
      バランス型
    </button>

    <button
      class="choice"
      onclick="selectJob('ヒーラー')"
    >
      💚 ヒーラー
      <br>
      回復に強い
    </button>

    <button
      class="choice"
      onclick="selectJob('剣士')"
    >
      ⚔️ 剣士
      <br>
      斬撃が使える
    </button>
  `;
}

function selectJob(job) {
  data.job = job;

  if (
    job === "剣士" &&
    data.skills.indexOf("斬撃") === -1
  ) {
    data.skills.push("斬撃");
  }

  saveData();
  showHome();
}

function createEnemy() {
  let available = enemies.filter(
    function (e) {
      if (!data.cityUnlocked) {
        return e.area !== "都市周辺";
      }

      return true;
    }
  );

  const base =
    available[
      Math.floor(Math.random() * available.length)
    ];

  const newEnemy = copyData(base);

  newEnemy.level =
    Math.floor(
      Math.random() *
        (newEnemy.maxLv - newEnemy.minLv + 1)
    ) + newEnemy.minLv;

  newEnemy.maxHp =
    newEnemy.hp +
    Math.max(0, newEnemy.level - 1) * 5;

  newEnemy.hp = newEnemy.maxHp;

  return newEnemy;
}

function startBattle() {
  enemy = createEnemy();
  defending = false;

  logMessage(
    "「" +
      enemy.name +
      "」が現れた！"
  );

  renderBattle();
}

function renderBattle() {
  if (!enemy) {
    showHome();
    return;
  }

  const screen = document.getElementById("screen");

  let skillButtons = "";

  if (data.skills.length === 0) {
    skillButtons =
      "<button disabled>スキルなし</button>";
  } else {
    data.skills.forEach(
      function (skill) {
        skillButtons += `
          <button onclick="useSkill('${skill}')">
            ${skill}
          </button>
        `;
      }
    );
  }

  const hpPercent =
    Math.max(
      0,
      Math.min(
        100,
        (enemy.hp / enemy.maxHp) * 100
      )
    );

  screen.innerHTML = `
    <h2>⚔️ 試合</h2>

    <div class="enemy">
      👾 ${escapeHtml(enemy.name)}
      Lv${enemy.level}
    </div>

    <div>
      敵HP ${enemy.hp}/${enemy.maxHp}
    </div>

    <div class="hpbar">
      <div
        class="hpfill"
        style="width:${hpPercent}%"
      ></div>
    </div>

    <div class="actions">

      <button
        class="primary"
        onclick="attackEnemy()"
      >
        コウゲキ
      </button>

      <button
        onclick="defend()"
      >
        ボウギョ
      </button>

      <button
        onclick="showSkillMenu()"
      >
        スキル
      </button>

      <button
        onclick="inspectEnemy()"
      >
        シラベル
      </button>

      <button
        onclick="runAway()"
      >
        ニゲル
      </button>

    </div>
  `;
}

function attackEnemy() {
  if (!enemy) {
    return;
  }

  let damage =
    5 + data.attack;

  let critical =
    Math.random() < 0.1;

  if (critical) {
    damage += 5;
  }

  enemy.hp -= damage;

  if (critical) {
    logMessage(
      "💥 クリティカルヒット！ " +
        damage +
        "ダメージ！"
    );
  } else {
    logMessage(
      "⚔️ " +
        damage +
        "ダメージ！"
    );
  }

  if (enemy.hp <= 0) {
    winBattle();
    return;
  }

  enemyAttack();
  renderBattle();
}

function defend() {
  if (!enemy) {
    return;
  }

  defending = true;

  logMessage(
    "🛡️ 防御した！"
  );

  enemyAttack();

  if (enemy) {
    renderBattle();
  }
}

function showSkillMenu() {
  const screen = document.getElementById("screen");

  let html = `
    <h2>✨ スキル</h2>
  `;

  if (data.skills.length === 0) {
    html += `
      <p>
        まだスキルがありません。
      </p>
    `;
  } else {
    html += `<div class="actions">`;

    data.skills.forEach(
      function (skill) {
        html += `
          <button
            onclick="useSkill('${skill}')"
          >
            ${skill}
          </button>
        `;
      }
    );

    html += `</div>`;
  }

  html += `
    <button onclick="renderBattle()">
      戻る
    </button>
  `;

  screen.innerHTML = html;
}

function useSkill(skill) {
  if (!enemy) {
    return;
  }

  let damage = 0;

  if (skill === "斬撃") {
    damage = 35;
  } else if (skill === "高速切り") {
    damage =
      Math.floor(
        Math.random() * 61
      ) + 5;
  } else {
    damage = 5;
  }

  enemy.hp -= damage;

  logMessage(
    "✨ " +
      skill +
      "！ " +
      damage +
      "ダメージ！"
  );

  if (enemy.hp <= 0) {
    winBattle();
    return;
  }

  enemyAttack();
  renderBattle();
}

function enemyAttack() {
  if (!enemy) {
    return;
  }

  let damage =
    Math.floor(
      enemy.level * 2 +
        Math.random() * 5
    );

  damage = Math.max(1, damage);

  if (defending) {
    damage = Math.ceil(
      damage / 2
    );

    defending = false;
  }

  data.hp -= damage;

  logMessage(
    "👾 " +
      enemy.name +
      "の攻撃！ " +
      damage +
      "ダメージ！"
  );

  updateStatus();

  if (data.hp <= 0) {
    data.hp = 0;

    saveData();

    showDefeat();
  }
}

function inspectEnemy() {
  if (!enemy) {
    return;
  }

  logMessage(
    "🔎 " +
      enemy.name +
      "\nHP：" +
      enemy.hp +
      "/" +
      enemy.maxHp +
      "\nLv：" +
      enemy.level +
      "\n獲得XP：" +
      enemy.xp
  );

  renderBattle();
}

function runAway() {
  if (!enemy) {
    return;
  }

  if (Math.random() < 0.7) {
    logMessage(
      "🏃 逃げ切った！"
    );

    enemy = null;
    showHome();

    return;
  }

  logMessage(
    "❌ 逃げられない！"
  );

  enemyAttack();

  if (enemy) {
    renderBattle();
  }
}

function winBattle() {
  if (!enemy) {
    return;
  }

  const defeatedEnemy = enemy;

  data.defeats++;
  data.totalBattles++;

  data.xp += defeatedEnemy.xp;

  if (!data.encyclopedia) {
    data.encyclopedia = {};
  }

  data.encyclopedia[
    defeatedEnemy.id
  ] = true;

  let dropped = null;

  if (Math.random() < 0.75) {
    dropped = defeatedEnemy.drop;

    data.inventory[dropped] =
      (data.inventory[dropped] || 0) + 1;

    logMessage(
      "🎁 戦利品「" +
        dropped +
        "」を落とした！"
    );
  }

  logMessage(
    "✨ XPを" +
      defeatedEnemy.xp +
      "獲得した！"
  );

  if (data.defeats >= 3) {
    data.townUnlocked = true;
  }

  if (data.defeats >= 8) {
    data.cityUnlocked = true;
  }

  enemy = null;

  checkLevelUp();
}

function checkLevelUp() {
  const requiredXp =
    (data.level + 1) * 50;

  if (data.xp >= requiredXp) {
    data.xp -= requiredXp;
    data.level++;

    saveData();

    showLevelUp();

    return;
  }

  data.hp =
    Math.min(
      data.maxHp,
      data.hp + 5
    );

  saveData();
  showHome();
}

function showLevelUp() {
  const screen = document.getElementById("screen");

  screen.innerHTML = `
    <h2>🎉 レベルアップ！</h2>

    <p>
      現在 Lv${data.level}
    </p>

    <p>
      強化するものを1つ選んでください。
    </p>

    <div class="actions">

      <button
        onclick="chooseLevelUp('hp')"
      >
        ❤️ HP増加
        <br>
        最大HP +5
      </button>

      <button
        onclick="chooseLevelUp('attack')"
      >
        ⚔️ 攻撃増加
        <br>
        攻撃 +20
      </button>

      <button
        onclick="chooseLevelUp('skill')"
      >
        ✨ スキル解放
        <br>
        スキル +1
      </button>

    </div>
  `;
}

function chooseLevelUp(type) {
  if (type === "hp") {
    data.maxHp += 5;
  }

  if (type === "attack") {
    data.attack += 20;
  }

  if (type === "skill") {
    data.skillSlots++;

    if (
      data.skills.indexOf("高速切り") === -1
    ) {
      data.skills.push("高速切り");
    }
  }

  data.hp = data.maxHp;

  saveData();
  showHome();
}

function showDefeat() {
  const screen = document.getElementById("screen");

  screen.innerHTML = `
    <h2>💀 敗北</h2>

    <p>
      HPが0になった……
    </p>

    <p>
      HP30で復帰できます。
    </p>

    <button onclick="revivePlayer()">
      🔄 復帰
    </button>
  `;
}

function revivePlayer() {
  data.hp = Math.min(
    30,
    data.maxHp
  );

  if (data.hp <= 0) {
    data.hp = 30;
  }

  saveData();
  showHome();
}

function showBag() {
  const screen = document.getElementById("screen");

  const entries =
    Object.entries(
      data.inventory || {}
    ).filter(
      function (entry) {
        return entry[1] > 0;
      }
    );

  let html = `
    <h2>🎒 バック</h2>

    <div class="item">
      🗡️ 装備：
      ${escapeHtml(data.weapon)}
    </div>
  `;

  if (entries.length === 0) {
    html += `
      <p>
        アイテムはありません。
      </p>
    `;
  }

  entries.forEach(
    function (entry) {
      html += `
        <div class="item">
          ${escapeHtml(entry[0])}
          × ${entry[1]}
        </div>
      `;
    }
  );

  html += `
    <button onclick="showEquipment()">
      🗡️ 装備変更
    </button>
  `;

  screen.innerHTML = html;
}

function showEquipment() {
  const screen =
    document.getElementById("screen");

  let html = `
    <h2>🗡️ 装備変更</h2>
  `;

  ["タガー", "剣"].forEach(
    function (weapon) {
      const count =
        data.inventory[weapon] || 0;

      if (count > 0) {
        html += `
          <button
            class="choice"
            onclick="equipWeapon('${weapon}')"
          >
            ${weapon}
            ×${count}
          </button>
        `;
      }
    }
  );

  html += `
    <button onclick="showBag()">
      戻る
    </button>
  `;

  screen.innerHTML = html;
}

function equipWeapon(weapon) {
  data.weapon = weapon;

  saveData();
  showBag();
}

function showGacha() {
  const screen =
    document.getElementById("screen");

  screen.innerHTML = `
    <h2>🎰 ノーマルガチャ</h2>

    <p>
      1回 100円
    </p>

    <button onclick="playGacha()">
      🎰 ガチャを回す
    </button>

    <div class="item">
      🗡️ タガー
      <br>
      15ダメージ
      <br>
      出血すると追加5ダメージ
    </div>

    <div class="item">
      ⚔️ 剣
      <br>
      5ダメージ
      <br>
      ごく普通の剣
    </div>
  `;
}

function playGacha() {
  if (data.money < 100) {
    logMessage(
      "💸 お金が足りない！"
    );

    return;
  }

  data.money -= 100;

  const item =
    Math.random() < 0.5
      ? "タガー"
      : "剣";

  data.inventory[item] =
    (data.inventory[item] || 0) + 1;

  logMessage(
    "🎰 ガチャ結果：「" +
      item +
      "」を入手！"
  );

  saveData();
  showGacha();
}

function showTown() {
  const screen =
    document.getElementById("screen");

  if (!data.townUnlocked) {
    screen.innerHTML = `
      <h2>🏘️ 町</h2>

      <p>
        町に入るには3体倒してください。
      </p>

      <p>
        現在：
        ${Math.min(data.defeats, 3)}/3
      </p>
    `;

    return;
  }

  screen.innerHTML = `
    <h2>🏘️ 町</h2>

    <p>
      町の信頼度：
      ${data.townTrust}
    </p>

    <div class="item">
      お手軽にショップで買い物ができる！
    </div>

    <button onclick="townShop()">
      🛒 ショップ
    </button>

    <button onclick="townGift()">
      🎁 町の人に話しかける
    </button>
  `;
}

function townShop() {
  const screen =
    document.getElementById("screen");

  screen.innerHTML = `
    <h2>🛒 町のショップ</h2>

    <div class="item">
      🌿 薬草
      <br>
      30円
      <br>
      HP +10
    </div>

    <button onclick="buyHerb()">
      30円で買う
    </button>

    <button onclick="showTown()">
      戻る
    </button>
  `;
}

function buyHerb() {
  if (data.money < 30) {
    logMessage(
      "💸 お金が足りない！"
    );

    return;
  }

  data.money -= 30;

  data.hp =
    Math.min(
      data.maxHp,
      data.hp + 10
    );

  logMessage(
    "🌿 薬草を使った！HP+10"
  );

  saveData();
  townShop();
}

function townGift() {
  const gift =
    Math.random() < 0.5
      ? "タガー"
      : "薬草";

  data.inventory[gift] =
    (data.inventory[gift] || 0) + 1;

  logMessage(
    "🎁 町の人が「" +
      gift +
      "」を譲ってくれた！"
  );

  saveData();
  showTown();
}

function showCity() {
  const screen =
    document.getElementById("screen");

  if (!data.cityUnlocked) {
    screen.innerHTML = `
      <h2>🏙️ 都市</h2>

      <p>
        都市は強敵が出現する場所です。
      </p>

      <p>
        現在の撃破数：
        ${data.defeats}/8
      </p>
    `;

    return;
  }

  screen.innerHTML = `
    <h2>🏙️ 都市</h2>

    <p>
      都市の信頼度：
      ${data.cityTrust}
    </p>

    <div class="item">
      超お手軽に買い物ができる！
      <br>
      ときどき強い敵が現れるため注意！
    </div>

    <button onclick="startBattle()">
      ⚔️ 都市で戦う
    </button>

    <button onclick="cityShop()">
      🛒 都市ショップ
    </button>
  `;
}

function cityShop() {
  const screen =
    document.getElementById("screen");

  screen.innerHTML = `
    <h2>🏙️ 都市ショップ</h2>

    <div class="item">
      🧪 強化薬
      <br>
      100円
      <br>
      HP +30
    </div>

    <button onclick="buyStrongMedicine()">
      100円で買う
    </button>

    <button onclick="showCity()">
      戻る
    </button>
  `;
}

function buyStrongMedicine() {
  if (data.money < 100) {
    logMessage(
      "💸 お金が足りない！"
    );

    return;
  }

  data.money -= 100;

  data.hp =
    Math.min(
      data.maxHp,
      data.hp + 30
    );

  logMessage(
    "🧪 強化薬を使った！"
  );

  saveData();
  cityShop();
}

function showSettings() {
  const screen =
    document.getElementById("screen");

  screen.innerHTML = `
    <h2>⚙️ 設定一覧</h2>

    <button
      class="choice"
      onclick="showSkills()"
    >
      ✨ スキル情報
    </button>

    <button
      class="choice"
      onclick="showLevelInfo()"
    >
      📈 レベル確認
    </button>

    <button
      class="choice"
      onclick="showEncyclopedia()"
    >
      📖 図鑑表確認
    </button>

    <button
      class="choice"
      onclick="manualSave()"
    >
      💾 セーブ
    </button>

    <button
      class="choice"
      onclick="manualLoad()"
    >
      🔄 ロード
    </button>

    <button
      class="choice"
      onclick="deleteSaveData()"
    >
      🗑️ データを消去
    </button>
  `;
}

function showSkills() {
  const screen =
    document.getElementById("screen");

  screen.innerHTML = `
    <h2>✨ スキル情報</h2>

    <div class="item">
      ⚔️ 斬撃
      <br>
      35ダメージ
    </div>

    <div class="item">
      ⚡ 高速切り
      <br>
      5～65ダメージ
    </div>

    <p>
      解放スキル数：
      ${data.skillSlots}
    </p>

    <button onclick="showSettings()">
      戻る
    </button>
  `;
}

function showLevelInfo() {
  const required =
    (data.level + 1) * 50;

  const remaining =
    Math.max(
      0,
      required - data.xp
    );

  const screen =
    document.getElementById("screen");

  screen.innerHTML = `
    <h2>📈 レベル確認</h2>

    <p>
      レベル：Lv${data.level}
    </p>

    <p>
      XP：${data.xp}
    </p>

    <p>
      次のレベルまで：
      ${remaining} XP
    </p>

    <button onclick="showSettings()">
      戻る
    </button>
  `;
}

function showEncyclopedia() {
  const screen =
    document.getElementById("screen");

  let html = `
    <h2>📖 図鑑表</h2>
  `;

  enemies.forEach(
    function (e) {
      const discovered =
        data.encyclopedia &&
        data.encyclopedia[e.id];

      if (discovered) {
        html += `
          <div class="item">
            <b>${e.name}</b>
            <br>
            HP：${e.hp}
            <br>
            Lv：${e.minLv}～${e.maxLv}
            <br>
            出現エリア：${e.area}
            <br>
            獲得XP：${e.xp}
          </div>
        `;
      } else {
        html += `
          <div class="item">
            ❓ 未発見
          </div>
        `;
      }
    }
  );

  screen.innerHTML =
    html +
    `
      <button onclick="showSettings()">
        戻る
      </button>
    `;
}

function manualSave() {
  saveData();
}

function manualLoad() {
  data = loadData();

  updateStatus();

  logMessage(
    "🔄 セーブデータをロードしました！"
  );

  showHome();
}

function deleteSaveData() {
  const answer =
    window.confirm(
      "本当にセーブデータを消去しますか？"
    );

  if (!answer) {
    return;
  }

  localStorage.removeItem(
    SAVE_KEY
  );

  data = copyData(
    defaultData
  );

  enemy = null;

  logMessage(
    "🗑️ セーブデータを消去しました。"
  );

  updateStatus();
  showHome();
}

function initializeGame() {
  updateStatus();

  const log =
    document.getElementById("log");

  if (log) {
    log.textContent =
      "ゲーム開始！";
  }

  const screen =
    document.getElementById("screen");

  const hasExistingData =
    localStorage.getItem(
      SAVE_KEY
    );

  if (!hasExistingData) {
    screen.innerHTML = `
      <h2>⚔️ はじめに</h2>

      <p>
        勇者の名前を入力してください。
      </p>

      <input
        id="nameInput"
        maxlength="12"
        placeholder="名前を入力"
      >

      <button onclick="beginGame()">
        ゲーム開始
      </button>
    `;

    return;
  }

  showHome();
}

document.addEventListener(
  "DOMContentLoaded",
  initializeGame
);
