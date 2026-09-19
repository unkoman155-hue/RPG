"use strict";

/* =========================================
   勇者の懸賞金RPG
   game.js 完成版
========================================= */

const SAVE_KEY = "yuusha_rpg_save_v3";

/* =========================================
   基本データ
========================================= */

const defaultData = {
  started: false,
  gameOver: false,

  name: "",
  job: "勇者",

  maxHp: 30,
  hp: 30,

  level: 0,
  xp: 0,
  attack: 0,

  skillSlots: 3,
  skills: [],

  bounty: 0,
  money: 250,

  weapon: "タガー",

  inventory: {
    "タガー": 1
  },

  defeats: 0,

  townUnlocked: false,
  townTrust: 15,

  cityUnlocked: false,
  cityTrust: 50,

  encyclopedia: {},
  totalBattles: 0
};

let data = JSON.parse(JSON.stringify(defaultData));

let currentEnemy = null;
let defending = false;
let battleActive = false;
let battleTurn = "player";

/* =========================================
   スキル
========================================= */

const SKILLS = {
  勇者: [
    {
      name: "斬撃",
      type: "damage",
      damage: 35,
      description: "敵に35ダメージ。"
    },
    {
      name: "パワースラッシュ",
      type: "damage",
      damage: 50,
      description: "強力な一撃。50ダメージ。"
    },
    {
      name: "連続斬り",
      type: "multi",
      damage: 20,
      hits: 2,
      description: "20ダメージを2回与える。"
    },
    {
      name: "勇者の一撃",
      type: "damage",
      damage: 65,
      description: "65ダメージ。"
    },
    {
      name: "気合い",
      type: "buff",
      heal: 8,
      description: "HPを8回復し、次の攻撃を強化。"
    }
  ],

  剣士: [
    {
      name: "斬撃",
      type: "damage",
      damage: 35,
      description: "敵に35ダメージ。"
    },
    {
      name: "強斬り",
      type: "damage",
      damage: 45,
      description: "敵に45ダメージ。"
    },
    {
      name: "居合斬り",
      type: "damage",
      damage: 70,
      description: "敵に70ダメージ。"
    },
    {
      name: "回転斬り",
      type: "multi",
      damage: 30,
      hits: 2,
      description: "30ダメージを2回与える。"
    },
    {
      name: "見切り",
      type: "heal",
      heal: 10,
      description: "HPを10回復。"
    }
  ],

  ヒーラー: [
    {
      name: "ヒール",
      type: "heal",
      heal: 15,
      description: "HPを15回復。"
    },
    {
      name: "聖撃",
      type: "damage",
      damage: 25,
      description: "敵に25ダメージ。"
    },
    {
      name: "聖なる光",
      type: "damageHeal",
      damage: 40,
      heal: 5,
      description: "40ダメージを与え、自分のHPを5回復。"
    },
    {
      name: "大回復",
      type: "heal",
      heal: 25,
      description: "HPを25回復。"
    },
    {
      name: "ホーリーバースト",
      type: "damage",
      damage: 55,
      description: "聖なる力で55ダメージ。"
    }
  ]
};

/* =========================================
   敵
========================================= */

const ENEMIES = [
  {
    id: "monster_cat",
    name: "怪物猫",
    minLevel: 1,
    maxLevel: 5,
    hp: 20,
    xp: 25,
    area: "草原",
    drop: "タガー",
    dropRate: 0.35,
    attackMin: 4,
    attackMax: 9
  },

  {
    id: "grass_slime",
    name: "草原スライム",
    minLevel: 1,
    maxLevel: 4,
    hp: 25,
    xp: 30,
    area: "草原",
    drop: "薬草",
    dropRate: 0.65,
    attackMin: 4,
    attackMax: 10
  },

  {
    id: "goblin",
    name: "ゴブリン",
    minLevel: 2,
    maxLevel: 6,
    hp: 35,
    xp: 40,
    area: "町外
