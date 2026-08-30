System.register("chunks:///_virtual/AdView.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Widgets.ts', './ArtView.ts'], function (exports) {
  var _createClass, cclegacy, Color, Node, makeRect, makeLabel, COLOR, ArtService;
  return {
    setters: [function (module) {
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      Color = module.Color;
      Node = module.Node;
    }, function (module) {
      makeRect = module.makeRect;
      makeLabel = module.makeLabel;
      COLOR = module.COLOR;
    }, function (module) {
      ArtService = module.ArtService;
    }],
    execute: function () {
      cclegacy._RF.push({}, "a7240EcGVZMIYm4gVlgoWo5", "AdView", undefined);

      // 模拟"看广告"：真实接入时把 play() 内部换成微信/抖音广告 SDK 的回调即可。
      var AdView = exports('AdView', /*#__PURE__*/function () {
        function AdView(parent) {
          this.overlay = void 0;
          this.panel = void 0;
          this.titleL = void 0;
          this.countL = void 0;
          this.remain = 0;
          this.reward = void 0;
          this.playing = false;
          this.overlay = makeRect('ad-overlay', parent, 960, 640, 0, 0, new Color(0, 0, 0, 175));
          this.overlay.active = false;
          this.overlay.on(Node.EventType.TOUCH_START, function () {});
          this.panel = ArtService.panelWithArt('ad-panel', parent, 'panel-popup', 480, 280, 0, 0);
          this.panel.active = false;
          if (!ArtService.attachIconSprite(this.panel, 'icon-ad', 0, 70, 64)) makeLabel('ad-icon', this.panel, '📺', 60, 0, 70, COLOR.text);
          this.titleL = makeLabel('ad-title', this.panel, '', 22, 0, 10, COLOR.text);
          this.titleL.isBold = true;
          this.countL = makeLabel('ad-count', this.panel, '', 44, 0, -50, COLOR.primary);
          this.countL.isBold = true;
          makeLabel('ad-tip', this.panel, '广告播放中，请稍候…', 14, 0, -105, COLOR.subtext);
        }
        var _proto = AdView.prototype;
        _proto.play = function play(durationSec, reward, title) {
          this.remain = durationSec;
          this.reward = reward;
          this.playing = true;
          this.titleL.string = title;
          this.countL.string = "" + Math.ceil(this.remain);
          this.overlay.active = true;
          this.panel.active = true;
        };
        _proto.update = function update(dt) {
          if (!this.playing) return;
          this.remain -= dt;
          this.countL.string = "" + Math.max(0, Math.ceil(this.remain));
          if (this.remain <= 0) {
            this.playing = false;
            this.overlay.active = false;
            this.panel.active = false;
            var r = this.reward;
            this.reward = undefined;
            r == null || r();
          }
        };
        _createClass(AdView, [{
          key: "isPlaying",
          get: function get() {
            return this.playing;
          }
        }]);
        return AdView;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/art.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports({
        entry: entry,
        hasArt: hasArt,
        markLoaded: markLoaded
      });
      cclegacy._RF.push({}, "ea658DRXTFEz6sb4HsggXfX", "art", undefined);
      // 全量美术清单：key = PNG 文件名（不放 .png），resources 路径 art/<key>
      var ART_MANIFEST = exports('ART_MANIFEST', [{
        key: 'bg',
        category: 'bg',
        w: 960,
        h: 640
      },
      // 顾客 6 形象
      {
        key: 'cust-1',
        category: 'customer',
        w: 160,
        h: 220
      }, {
        key: 'cust-2',
        category: 'customer',
        w: 160,
        h: 220
      }, {
        key: 'cust-3',
        category: 'customer',
        w: 160,
        h: 220
      }, {
        key: 'cust-4',
        category: 'customer',
        w: 160,
        h: 220
      }, {
        key: 'cust-5',
        category: 'customer',
        w: 160,
        h: 220
      }, {
        key: 'cust-6',
        category: 'customer',
        w: 160,
        h: 220
      },
      // 角色头像 + 旁白
      {
        key: 'char-xiaoqi',
        category: 'character',
        w: 150,
        h: 150
      }, {
        key: 'char-tangtang',
        category: 'character',
        w: 150,
        h: 150
      }, {
        key: 'char-laozhou',
        category: 'character',
        w: 150,
        h: 150
      }, {
        key: 'char-ashen',
        category: 'character',
        w: 150,
        h: 150
      }, {
        key: 'icon-narrator',
        category: 'character',
        w: 150,
        h: 150
      },
      // 5 张面板（9-slice）
      {
        key: 'panel-hud',
        category: 'panel',
        w: 960,
        h: 64
      }, {
        key: 'panel-orderboard',
        category: 'panel',
        w: 920,
        h: 46
      }, {
        key: 'panel-menu',
        category: 'panel',
        w: 920,
        h: 110
      }, {
        key: 'panel-dialogue',
        category: 'panel',
        w: 760,
        h: 200
      }, {
        key: 'panel-popup',
        category: 'panel',
        w: 560,
        h: 520
      },
      // 6 道菜
      {
        key: 'dish-fries',
        category: 'dish',
        w: 96,
        h: 96
      }, {
        key: 'dish-burger',
        category: 'dish',
        w: 96,
        h: 96
      }, {
        key: 'dish-pizza',
        category: 'dish',
        w: 96,
        h: 96
      }, {
        key: 'dish-pasta',
        category: 'dish',
        w: 96,
        h: 96
      }, {
        key: 'dish-steak',
        category: 'dish',
        w: 96,
        h: 96
      }, {
        key: 'dish-dessert',
        category: 'dish',
        w: 96,
        h: 96
      },
      // 合成链中间项（tools/make_merge_art.py 生成的程序占位图，可按 docs/ai-art-prompts.md 重出）
      {
        key: 'ing-veg',
        category: 'dish',
        w: 72,
        h: 72
      }, {
        key: 'ing-salad',
        category: 'dish',
        w: 72,
        h: 72
      }, {
        key: 'ing-meat',
        category: 'dish',
        w: 72,
        h: 72
      }, {
        key: 'ing-stew',
        category: 'dish',
        w: 72,
        h: 72
      }, {
        key: 'ing-dough',
        category: 'dish',
        w: 72,
        h: 72
      }, {
        key: 'ing-cake',
        category: 'dish',
        w: 72,
        h: 72
      }, {
        key: 'ing-cheese',
        category: 'dish',
        w: 72,
        h: 72
      }, {
        key: 'ing-pasta-dough',
        category: 'dish',
        w: 72,
        h: 72
      },
      // P1 小图标（仅列实际有消费点的）
      {
        key: 'icon-coin',
        category: 'icon',
        w: 32,
        h: 32
      }, {
        key: 'icon-energy',
        category: 'icon',
        w: 32,
        h: 32
      }, {
        key: 'icon-customer',
        category: 'icon',
        w: 32,
        h: 32
      }, {
        key: 'icon-chapter',
        category: 'icon',
        w: 32,
        h: 32
      }, {
        key: 'icon-lock',
        category: 'icon',
        w: 32,
        h: 32
      }, {
        key: 'icon-replay',
        category: 'icon',
        w: 32,
        h: 32
      }, {
        key: 'icon-ad',
        category: 'icon',
        w: 32,
        h: 32
      }, {
        key: 'icon-brush',
        category: 'icon',
        w: 32,
        h: 32
      }, {
        key: 'icon-chair',
        category: 'icon',
        w: 32,
        h: 32
      }, {
        key: 'icon-kitchen',
        category: 'icon',
        w: 32,
        h: 32
      },
      // P2 皮肤装饰道具
      {
        key: 'decor-classic-1',
        category: 'decor',
        w: 88,
        h: 88
      }, {
        key: 'decor-garden-1',
        category: 'decor',
        w: 88,
        h: 88
      }, {
        key: 'decor-garden-2',
        category: 'decor',
        w: 88,
        h: 88
      }, {
        key: 'decor-garden-3',
        category: 'decor',
        w: 88,
        h: 88
      }, {
        key: 'decor-retro-1',
        category: 'decor',
        w: 88,
        h: 88
      }, {
        key: 'decor-retro-2',
        category: 'decor',
        w: 88,
        h: 88
      }, {
        key: 'decor-retro-3',
        category: 'decor',
        w: 88,
        h: 88
      }, {
        key: 'decor-ocean-1',
        category: 'decor',
        w: 88,
        h: 88
      }, {
        key: 'decor-ocean-2',
        category: 'decor',
        w: 88,
        h: 88
      }, {
        key: 'decor-ocean-3',
        category: 'decor',
        w: 88,
        h: 88
      }, {
        key: 'decor-festival-1',
        category: 'decor',
        w: 88,
        h: 88
      }, {
        key: 'decor-festival-2',
        category: 'decor',
        w: 88,
        h: 88
      }, {
        key: 'decor-festival-3',
        category: 'decor',
        w: 88,
        h: 88
      },
      // 皮肤列表小图标
      {
        key: 'skin-classic',
        category: 'icon',
        w: 40,
        h: 40
      }, {
        key: 'skin-garden',
        category: 'icon',
        w: 40,
        h: 40
      }, {
        key: 'skin-retro',
        category: 'icon',
        w: 40,
        h: 40
      }, {
        key: 'skin-ocean',
        category: 'icon',
        w: 40,
        h: 40
      }, {
        key: 'skin-festival',
        category: 'icon',
        w: 40,
        h: 40
      }]);
      function entry(key) {
        return ART_MANIFEST.find(function (e) {
          return e.key === key;
        });
      }
      var CUSTOMER_ART = exports('CUSTOMER_ART', ['cust-1', 'cust-2', 'cust-3', 'cust-4', 'cust-5', 'cust-6']);

      // —— 已加载 key 注册表（cc-free，vitest 可测；ArtView.preload 完成后填充）——
      var loadedKeys = [];
      function markLoaded(key) {
        if (loadedKeys.indexOf(key) < 0) loadedKeys.push(key);
      }
      function hasArt(key) {
        return loadedKeys.indexOf(key) >= 0;
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/ArtView.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './art.ts', './Widgets.ts'], function (exports) {
  var _asyncToGenerator, _regeneratorRuntime, _createForOfIteratorHelperLoose, cclegacy, resources, SpriteFrame, Layers, Sprite, hasArt, markLoaded, ART_MANIFEST, makeNode, roundRect, COLOR;
  return {
    setters: [function (module) {
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      resources = module.resources;
      SpriteFrame = module.SpriteFrame;
      Layers = module.Layers;
      Sprite = module.Sprite;
    }, function (module) {
      hasArt = module.hasArt;
      markLoaded = module.markLoaded;
      ART_MANIFEST = module.ART_MANIFEST;
    }, function (module) {
      makeNode = module.makeNode;
      roundRect = module.roundRect;
      COLOR = module.COLOR;
    }],
    execute: function () {
      cclegacy._RF.push({}, "304c7YfjQxL4J1+LqbaG6OL", "ArtView", undefined);

      // 9-slice 内边距（单位：源图像素，出图规格为 2×显示尺寸）
      // l/r 必须覆盖两端圆弧的宽度（panel-dialogue 为整半圆胶囊头，约 200px），
      // 否则 SLICED 拉伸时圆弧过渡段会被横向拉平
      var PANEL_INSETS = {
        'panel-hud': {
          l: 130,
          r: 130,
          t: 28,
          b: 28
        },
        'panel-orderboard': {
          l: 160,
          r: 160,
          t: 18,
          b: 18
        },
        'panel-menu': {
          l: 160,
          r: 160,
          t: 24,
          b: 24
        },
        'panel-dialogue': {
          l: 210,
          r: 210,
          t: 60,
          b: 60
        },
        'panel-popup': {
          l: 130,
          r: 130,
          t: 130,
          b: 130
        }
      };
      var ArtService = exports('ArtService', /*#__PURE__*/function () {
        function ArtService() {}
        ArtService.preload = /*#__PURE__*/function () {
          var _preload = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
            var results, _iterator, _step, r;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  if (!(ArtService.frames.size > 0)) {
                    _context.next = 2;
                    break;
                  }
                  return _context.abrupt("return");
                case 2:
                  _context.next = 4;
                  return Promise.all(ART_MANIFEST.map(function (e) {
                    return ArtService.loadOne(e.key);
                  }));
                case 4:
                  results = _context.sent;
                  for (_iterator = _createForOfIteratorHelperLoose(results); !(_step = _iterator()).done;) {
                    r = _step.value;
                    if (r.sf) {
                      ArtService.frames.set(r.key, r.sf);
                      markLoaded(r.key);
                    }
                  }
                case 6:
                case "end":
                  return _context.stop();
              }
            }, _callee);
          }));
          function preload() {
            return _preload.apply(this, arguments);
          }
          return preload;
        }();
        ArtService.loadOne = function loadOne(key) {
          return new Promise(function (resolve) {
            resources.load("art/" + key + "/spriteFrame", SpriteFrame, function (err, sf) {
              if (!err && sf) {
                resolve({
                  key: key,
                  sf: sf
                });
                return;
              }
              if (!ArtService.warned.has(key)) {
                ArtService.warned.add(key);
                console.warn("[art] \u7F3A\u5C11\u7F8E\u672F\u8D44\u6E90: " + key + "\uFF08\u5DF2\u56DE\u9000\uFF09");
              }
              resolve({
                key: key,
                sf: null
              });
            });
          });
        };
        ArtService.hasArt = function hasArt$1(key) {
          return hasArt(key);
        };
        ArtService.getSpriteFrame = function getSpriteFrame(key) {
          var _ArtService$frames$ge;
          return (_ArtService$frames$ge = ArtService.frames.get(key)) != null ? _ArtService$frames$ge : null;
        };
        ArtService.makeSprite = function makeSprite(parent, key, w, h, x, y, name) {
          var sf = ArtService.getSpriteFrame(key);
          if (!sf) return null;
          var n = makeNode(name != null ? name : "art-" + key, parent, w, h, x, y);
          n.layer = Layers.Enum.UI_2D;
          var sp = n.addComponent(Sprite);
          // sizeMode 必须先于 spriteFrame：默认 TRIMMED 会在赋图时把节点尺寸改成图片原始尺寸
          sp.sizeMode = Sprite.SizeMode.CUSTOM;
          sp.type = Sprite.Type.SIMPLE;
          sp.spriteFrame = sf;
          return n;
        };
        ArtService.makePanel = function makePanel(parent, key, w, h, x, y, name) {
          var sf = ArtService.getSpriteFrame(key);
          if (!sf) return null;
          var n = makeNode(name != null ? name : "art-" + key, parent, w, h, x, y);
          n.layer = Layers.Enum.UI_2D;
          var sp = n.addComponent(Sprite);
          // 同 makeSprite：sizeMode 先行，防止赋图时节点尺寸被改成原始尺寸
          sp.sizeMode = Sprite.SizeMode.CUSTOM;
          var ins = PANEL_INSETS[key];
          if (ins) {
            sp.type = Sprite.Type.SLICED;
            sf.insetLeft = ins.l;
            sf.insetRight = ins.r;
            sf.insetTop = ins.t;
            sf.insetBottom = ins.b;
          } else {
            sp.type = Sprite.Type.SIMPLE;
          }
          sp.spriteFrame = sf;
          return n;
        };
        ArtService.panelWithArt = function panelWithArt(name, parent, key, w, h, x, y) {
          // 投影必须是面板的子节点：作为兄弟节点时面板隐藏（active=false）后投影会残留
          var root = makeNode(name, parent, w, h, x, y);
          var radius = Math.min(h / 2, 24);
          roundRect(name + '-shadow', root, w, h, 0, -4, radius, COLOR.shadow);
          var art = this.makePanel(root, key, w, h, 0, 0, name + '-art');
          if (!art) roundRect(name + '-bg', root, w, h, 0, 0, 16, COLOR.panel, COLOR.border);
          return root;
        }

        /** 给既有按钮/面板补一个图标 Sprite（有图才加，缺图返回 null，调用方维持原样） */;
        ArtService.attachIconSprite = function attachIconSprite(parent, key, x, y, size) {
          return ArtService.makeSprite(parent, key, size, size, x, y, "ic-" + key);
        };
        return ArtService;
      }());
      ArtService.frames = new Map();
      ArtService.warned = new Set();
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/chapters.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "83ee2oDPxFDf47Jw7gqGGsw", "chapters", undefined); // 章节与剧情数据：纯数据驱动，改这里就能加章节/改目标/改文案。
      var CHAPTERS = exports('CHAPTERS', [{
        id: 1,
        title: '继承破店',
        intro: [{
          who: '旁白',
          emoji: '📖',
          artKey: 'icon-narrator',
          text: '你叫小柒，刚结束一段糟糕的婚姻。带着女儿糖糖，你盘下了这家濒临倒闭的小餐厅。'
        }, {
          who: '小柒',
          emoji: '🙋‍♀️',
          artKey: 'char-xiaoqi',
          text: '从今天起，这家店就叫"暖柒餐厅"。我们要重新开始！'
        }, {
          who: '糖糖',
          emoji: '👧',
          artKey: 'char-tangtang',
          text: '妈妈加油！我最爱吃你做的薯条啦~'
        }],
        goals: [{
          kind: 'revenue',
          target: 200,
          label: '累计营业额达到 200 🪙'
        }, {
          kind: 'served',
          target: 8,
          label: '成功招待 8 位顾客'
        }],
        reward: {
          coins: 50
        },
        outro: [{
          who: '老周',
          emoji: '🧑',
          artKey: 'char-laozhou',
          text: '哟，新老板？给我来份薯条——哎还行，以后常来！'
        }, {
          who: '小柒',
          emoji: '🙋‍♀️',
          artKey: 'char-xiaoqi',
          text: '第一位熟客……这条路，走对了。'
        }]
      }, {
        id: 2,
        title: '招牌菜',
        intro: [{
          who: '阿婶',
          emoji: '👵',
          artKey: 'char-ashen',
          text: '小柒啊，光卖薯条留不住人，得有道拿手菜。'
        }, {
          who: '小柒',
          emoji: '🙋‍♀️',
          artKey: 'char-xiaoqi',
          text: '那我就研发一道"暖柒汉堡"！'
        }],
        goals: [{
          kind: 'revenue',
          target: 600,
          label: '累计营业额达到 600 🪙'
        }, {
          kind: 'served',
          target: 20,
          label: '成功招待 20 位顾客'
        }, {
          kind: 'happy',
          target: 10,
          label: '让 10 位顾客满意离店（满意度≥70）'
        }],
        reward: {
          coins: 120
        },
        outro: [{
          who: '糖糖',
          emoji: '👧',
          artKey: 'char-tangtang',
          text: '妈妈的汉堡是全天下最好吃的！'
        }, {
          who: '小柒',
          emoji: '🙋‍♀️',
          artKey: 'char-xiaoqi',
          text: '招牌立住了，下一站，让整条街都知道我们。'
        }]
      }, {
        id: 3,
        title: '小有名气',
        intro: [{
          who: '老周',
          emoji: '🧑',
          artKey: 'char-laozhou',
          text: '现在中午都得排队咯，小柒你行啊。'
        }, {
          who: '小柒',
          emoji: '🙋‍♀️',
          artKey: 'char-xiaoqi',
          text: '想把店面再扩一扩，招待更多客人。'
        }],
        goals: [{
          kind: 'revenue',
          target: 1500,
          label: '累计营业额达到 1500 🪙'
        }, {
          kind: 'served',
          target: 40,
          label: '成功招待 40 位顾客'
        }, {
          kind: 'happy',
          target: 25,
          label: '让 25 位顾客满意离店'
        }],
        reward: {
          coins: 250
        },
        outro: [{
          who: '阿婶',
          emoji: '👵',
          artKey: 'char-ashen',
          text: '当年那家要倒的破店，如今成了街角最暖的光。'
        }]
      }, {
        id: 4,
        title: '连锁梦想',
        intro: [{
          who: '小柒',
          emoji: '🙋‍♀️',
          artKey: 'char-xiaoqi',
          text: '糖糖，妈妈想开第二家店了。'
        }, {
          who: '糖糖',
          emoji: '👧',
          artKey: 'char-tangtang',
          text: '那我能当小老板娘吗？'
        }],
        goals: [{
          kind: 'revenue',
          target: 3500,
          label: '累计营业额达到 3500 🪙'
        }, {
          kind: 'served',
          target: 80,
          label: '成功招待 80 位顾客'
        }, {
          kind: 'happy',
          target: 50,
          label: '让 50 位顾客满意离店'
        }],
        reward: {
          coins: 500
        },
        outro: [{
          who: '旁白',
          emoji: '📖',
          artKey: 'icon-narrator',
          text: '第二家"暖柒"在城东亮灯，排队的人里，有当年和你一样迷茫的人。'
        }]
      }, {
        id: 5,
        title: '圆满',
        intro: [{
          who: '老周',
          emoji: '🧑',
          artKey: 'char-laozhou',
          text: '听说你要开第五家了？'
        }, {
          who: '小柒',
          emoji: '🙋‍♀️',
          artKey: 'char-xiaoqi',
          text: '不是为钱。是想让更多孤单的人，有处可去、有饭可暖。'
        }],
        goals: [{
          kind: 'revenue',
          target: 7000,
          label: '累计营业额达到 7000 🪙'
        }, {
          kind: 'served',
          target: 150,
          label: '成功招待 150 位顾客'
        }, {
          kind: 'happy',
          target: 100,
          label: '让 100 位顾客满意离店'
        }],
        reward: {
          coins: 1000
        },
        outro: [{
          who: '糖糖',
          emoji: '👧',
          artKey: 'char-tangtang',
          text: '妈妈，我以你为荣。'
        }, {
          who: '小柒',
          emoji: '🙋‍♀️',
          artKey: 'char-xiaoqi',
          text: '谢谢你，陪妈妈把日子，重新过成了想要的样子。'
        }]
      }]);
      // 合成台解锁新菜时的剧情反应：合成台是"小柒研发新菜"的工坊，
      // 每条链的最终菜解锁时，由店里的人给出一句回应，把玩法挂回经营叙事。
      var DISH_UNLOCK_SCRIPT = exports('DISH_UNLOCK_SCRIPT', {
        pizza: [{
          who: '小柒',
          emoji: '🙋‍♀️',
          artKey: 'char-xiaoqi',
          text: '蔬菜披萨出炉！从一棵生菜到一张披萨，我们的研发台立功了。'
        }, {
          who: '糖糖',
          emoji: '👧',
          artKey: 'char-tangtang',
          text: '披萨上有小森林耶！妈妈我可以吃第一块吗？'
        }],
        steak: [{
          who: '老周',
          emoji: '🧑',
          artKey: 'char-laozhou',
          text: '哟，菜单悄悄换了？这牛排的火候……有点当年老店的意思了。'
        }, {
          who: '小柒',
          emoji: '🙋‍♀️',
          artKey: 'char-xiaoqi',
          text: '老周叔这张嘴能认可，合成台上蹲的这几天就没白费！'
        }],
        dessert: [{
          who: '糖糖',
          emoji: '👧',
          artKey: 'char-tangtang',
          text: '甜品像云朵一样软！妈妈是魔法师吗？'
        }, {
          who: '小柒',
          emoji: '🙋‍♀️',
          artKey: 'char-xiaoqi',
          text: '傻瓜，新招牌要让日子也甜一点呀。'
        }],
        pasta: [{
          who: '小柒',
          emoji: '🙋‍♀️',
          artKey: 'char-xiaoqi',
          text: '奶酪意面出锅！从一团面团到一盘意面，我们真的做到了。'
        }, {
          who: '老周',
          emoji: '🧑',
          artKey: 'char-laozhou',
          text: '给我来一份，吃完写进"老周食记"里。'
        }]
      });
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/ChapterView.ts", ['cc', './chapters.ts', './Widgets.ts', './ArtView.ts'], function (exports) {
  var cclegacy, Color, Node, Label, Button, CHAPTERS, makeLabel, COLOR, makeRect, makeNode, pillButton, ArtService;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      Color = module.Color;
      Node = module.Node;
      Label = module.Label;
      Button = module.Button;
    }, function (module) {
      CHAPTERS = module.CHAPTERS;
    }, function (module) {
      makeLabel = module.makeLabel;
      COLOR = module.COLOR;
      makeRect = module.makeRect;
      makeNode = module.makeNode;
      pillButton = module.pillButton;
    }, function (module) {
      ArtService = module.ArtService;
    }],
    execute: function () {
      cclegacy._RF.push({}, "4edd4V2+51FSoCXi3itSKzS", "ChapterView", undefined);
      var ChapterView = exports('ChapterView', /*#__PURE__*/function () {
        function ChapterView(parent, onReplayIntro) {
          var _this = this;
          this.overlay = void 0;
          this.panel = void 0;
          this.subL = void 0;
          this.goalsBox = void 0;
          this.rewardL = void 0;
          this.isOpen = false;
          this.onReplayIntro = onReplayIntro;
          this.overlay = makeRect('ch-overlay', parent, 960, 640, 0, 0, new Color(0, 0, 0, 90));
          this.overlay.active = false;
          this.overlay.on(Node.EventType.TOUCH_START, function () {
            return _this.close();
          });
          this.panel = ArtService.panelWithArt('ch-panel', parent, 'panel-popup', 560, 400, 0, 0);
          this.panel.active = false;
          var chTitleIcon = ArtService.attachIconSprite(this.panel, 'icon-chapter', -86, 160, 28);
          makeLabel('ch-title', this.panel, (chTitleIcon ? '' : '📖 ') + "\u7ECF\u8425\u76EE\u6807", 24, chTitleIcon ? -12 : 0, 160, COLOR.text);
          this.subL = makeLabel('ch-sub', this.panel, '', 18, 0, 120, COLOR.primary);
          this.goalsBox = makeNode('ch-goals', this.panel, 500, 200, 0, 10);
          this.rewardL = makeLabel('ch-reward', this.panel, '', 16, 0, -110, COLOR.accent);
          var replay = pillButton('ch-replay', this.panel, 200, 40, 0, -160, COLOR.primary, '重看剧情 ▶', function () {
            return _this.onReplayIntro();
          });
          if (ArtService.attachIconSprite(replay, 'icon-replay', -62, 0, 22)) {
            var lbl = replay.getComponentInChildren(Label);
            if (lbl) lbl.string = '重看剧情';
          }
          var close = makeRect('ch-close', this.panel, 40, 40, 260, 175, COLOR.panel);
          close.addComponent(Button);
          makeLabel('ch-x', close, '✕', 24, 0, 0, COLOR.subtext);
          close.on(Button.EventType.CLICK, function () {
            return _this.close();
          });
        }
        var _proto = ChapterView.prototype;
        _proto.open = function open(data) {
          var _this2 = this;
          var idx = data.chapterIndex;
          var ch = CHAPTERS[idx];
          this.isOpen = true;
          this.overlay.active = true;
          this.panel.active = true;
          this.goalsBox.removeAllChildren();
          if (!ch) {
            this.subL.string = '🎉 全部章节完成！';
            this.rewardL.string = '你已把"暖柒餐厅"开成了想要的样子。';
            return;
          }
          this.subL.string = "\u7B2C " + (idx + 1) + " \u7AE0\uFF1A" + ch.title;
          ch.goals.forEach(function (g, i) {
            var cur = g.kind === 'revenue' ? data.totalRevenue : g.kind === 'served' ? data.servedTotal : data.happyTotal;
            var done = cur >= g.target;
            var line = (done ? '✔' : '◻') + " " + g.label + "\uFF08" + Math.min(cur, g.target) + "/" + g.target + "\uFF09";
            var lab = makeLabel("g-" + i, _this2.goalsBox, line, 17, 0, 75 - i * 40, done ? COLOR.green : COLOR.text);
            lab.isBold = done;
          });
          this.rewardL.string = "\u901A\u5173\u5956\u52B1\uFF1A+" + ch.reward.coins + " \uD83E\uDE99";
        };
        _proto.close = function close() {
          this.isOpen = false;
          this.overlay.active = false;
          this.panel.active = false;
        };
        return ChapterView;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/CustomerView.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './types.ts', './satisfaction.ts', './Widgets.ts', './ArtView.ts'], function (exports) {
  var _createClass, cclegacy, UIOpacity, tween, Vec3, Graphics, Color, Button, CustomerState, DEFAULT_MAX_WAIT, MAX_SATISFACTION, paidAmount, makeNode, COLOR, lerpColor, makeLabel, roundRect, ArtService;
  return {
    setters: [function (module) {
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      UIOpacity = module.UIOpacity;
      tween = module.tween;
      Vec3 = module.Vec3;
      Graphics = module.Graphics;
      Color = module.Color;
      Button = module.Button;
    }, function (module) {
      CustomerState = module.CustomerState;
    }, function (module) {
      DEFAULT_MAX_WAIT = module.DEFAULT_MAX_WAIT;
      MAX_SATISFACTION = module.MAX_SATISFACTION;
      paidAmount = module.paidAmount;
    }, function (module) {
      makeNode = module.makeNode;
      COLOR = module.COLOR;
      lerpColor = module.lerpColor;
      makeLabel = module.makeLabel;
      roundRect = module.roundRect;
    }, function (module) {
      ArtService = module.ArtService;
    }],
    execute: function () {
      cclegacy._RF.push({}, "bb50dx/E35CxIaPSlPB8Enp", "CustomerView", undefined);
      var EAT_SEC = 8; // 用餐时长（秒）：吃完即离场
      var CustomerView = exports('CustomerView', /*#__PURE__*/function () {
        function CustomerView(parent, x, y, dish, tableIndex, artKey, tableX, tableY, onLeave, onShowRecipe) {
          var _this = this;
          this.node = void 0;
          this._state = CustomerState.ORDERING;
          this.waitTimer = 0;
          this.eatTimer = 0;
          this.satBar = void 0;
          this.satBg = void 0;
          this.satColor = new Color();
          this.price = 0;
          this.maxWait = DEFAULT_MAX_WAIT;
          this.floatNode = null;
          this.floatTween = null;
          this.plateNode = null;
          this.plateShadow = null;
          this.leaving = false;
          this.dish = dish;
          this.tableIndex = tableIndex;
          this.artKey = artKey;
          this.tableX = tableX;
          this.tableY = tableY;
          this.onLeave = onLeave;
          this.onShowRecipe = onShowRecipe;
          this.price = dish.price;
          var hasArt = ArtService.hasArt(this.artKey);
          this.node = hasArt ? makeNode('customer', parent, 110, 151, x, y) : roundRect('customer', parent, 110, 151, x, y, 20, COLOR.panel, COLOR.border);
          if (hasArt) {
            var _float = makeNode('float', this.node, 110, 151, 0, 0);
            var sp = ArtService.makeSprite(_float, this.artKey, 110, 151, 0, 0, 'cust-art');
            if (sp) {
              this.node.setPosition(x, y);
              this.floatNode = _float;
              this.floatTween = tween(_float).repeatForever(tween(_float).to(1.2, {
                position: new Vec3(0, 4, 0)
              }).to(1.2, {
                position: new Vec3(0, -4, 0)
              })).start();
            }
          } else {
            var head = roundRect('head', this.node, 30, 30, 0, 22, 10, COLOR.primary, new Color(235, 120, 80, 255));
            makeLabel('face', this.node, '🙂', 18, 0, 4, COLOR.white);
          }

          // 气泡（圆角 + 小三角），显示所点菜名（有菜图加缩略图）
          // y 偏移要让人像坐桌后时气泡完全露在桌带上方
          var hasDishArt = ArtService.hasArt(dish.artKey);
          var bw = hasDishArt ? 104 : 70;
          var bubble = makeNode('bubble', this.node, bw, 30, 52, 112);
          var b = bubble.addComponent(Graphics);
          b.fillColor = COLOR.white;
          b.roundRect(-bw / 2, -15, bw, 30, 10);
          b.fill();
          b.moveTo(-18, -15);
          b.lineTo(-26, -25);
          b.lineTo(-10, -15);
          b.close();
          b.fill();
          if (hasDishArt) {
            ArtService.makeSprite(bubble, dish.artKey, 26, 26, -bw / 2 + 16, 0, 'bubble-dish');
            makeLabel('want', bubble, "" + dish.name, 13, -bw / 2 + 38, 0, COLOR.text);
          } else {
            makeLabel('want', bubble, dish.name, 14, 0, 0, COLOR.text);
          }
          // 点订单气泡弹出研发链路卡；角标提示可点
          bubble.addComponent(Button);
          bubble.on(Button.EventType.CLICK, function () {
            return _this.onShowRecipe == null ? void 0 : _this.onShowRecipe(dish);
          });
          makeLabel('bubble-info', bubble, 'ℹ', 13, bw / 2 - 12, 9, COLOR.subtext);

          // 满意度条：深色底衬 + 高亮前景，放在头顶上方（浅色背景上才看得清）
          this.satBg = makeNode('sat-bg', this.node, 64, 10, 0, 72);
          var bg = this.satBg.addComponent(Graphics);
          bg.fillColor = new Color(60, 45, 30, 150);
          bg.roundRect(-32, -5, 64, 10, 5);
          bg.fill();
          var fg = makeNode('sat', this.node, 60, 7, 0, 72);
          this.satBar = fg.addComponent(Graphics);
        }
        var _proto = CustomerView.prototype;
        _proto.update = function update(dt) {
          if (this.isGone || !this.node.isValid) return;
          if (this._state === CustomerState.ORDERING) {
            this.waitTimer += dt;
            if (this.wantsLeavesUpset) {
              this.startLeave();
            }
          } else if (this._state === CustomerState.EATING) {
            this.eatTimer += dt;
            if (this.eatTimer >= EAT_SEC) {
              this.startLeave();
            }
          } else if (this._state === CustomerState.LEAVING) ;
          this.updateSatBar();
        }

        /** 离场：原地渐隐 + 轻微左移，避免横穿整个场景与其他顾客叠在一起 */;
        _proto.startLeave = function startLeave() {
          var _this2 = this;
          if (this.leaving || this._state === CustomerState.LEAVING) return;
          this._state = CustomerState.LEAVING;
          if (this.floatTween) {
            this.floatTween.stop();
            this.floatTween = null;
            if (this.floatNode) this.floatNode.setPosition(0, 0);
          }
          var op = this.node.addComponent(UIOpacity);
          op.opacity = 255;
          tween(this.node).by(0.9, {
            position: new Vec3(-50, 0, 0)
          }).start();
          tween(op).to(0.9, {
            opacity: 0
          }).call(function () {
            return _this2.onLeave(_this2);
          }).start();
        }

        /** 装修加成：调整顾客耐心（等待时长倍率） */;
        _proto.setPatience = function setPatience(mult) {
          this.maxWait = DEFAULT_MAX_WAIT * mult;
        }

        /** 桌位重建（升级）后同步位置：顾客搬到新桌，已上的盘子/投影跟随 */;
        _proto.syncTable = function syncTable(x, tableY) {
          this.tableX = x;
          this.tableY = tableY;
          this.node.setPosition(x, tableY + 52);
          if (this.plateNode) this.plateNode.setPosition(x, this.tableY + 10);
          if (this.plateShadow) this.plateShadow.setPosition(x, this.tableY + 36);
        };
        _proto.serve = function serve() {
          if (this._state !== CustomerState.ORDERING) return;
          this._state = CustomerState.EATING;
          this.eatTimer = 0;
          if (ArtService.hasArt(this.dish.artKey) && this.node.parent) {
            // 投影垫底 + 盘子落在桌面上（桌面 abs 约 -178~-156），盘子在桌沿前、人像之下
            this.plateShadow = makeNode('plate-shadow', this.node.parent, 52, 12, this.tableX, this.tableY + 36);
            var g = this.plateShadow.addComponent(Graphics);
            g.fillColor = COLOR.shadow;
            g.ellipse(0, 0, 26, 6);
            g.fill();
            this.plateNode = ArtService.makeSprite(this.node.parent, this.dish.artKey, 44, 44, this.tableX, this.tableY + 10, 'served-plate');
          }
        };
        _proto.updateSatBar = function updateSatBar() {
          if (!this.satBg.isValid) return;
          var ratio = this.satisfaction / MAX_SATISFACTION;
          var g = this.satBar;
          g.clear();
          if (ratio <= 0.5) {
            lerpColor(COLOR.red, COLOR.accent, ratio * 2, this.satColor);
          } else {
            lerpColor(COLOR.accent, COLOR.green, (ratio - 0.5) * 2, this.satColor);
          }
          var w = ratio * 58;
          g.fillColor = this.satColor;
          g.roundRect(-w / 2, -3.5, w, 7, 3.5);
          g.fill();
        };
        _proto.markGone = function markGone() {
          if (this._state === CustomerState.GONE) return;
          this._state = CustomerState.GONE;
          if (this.floatTween) {
            this.floatTween.stop();
            this.floatTween = null;
          }
          if (this.plateNode) {
            this.plateNode.destroy();
            this.plateNode = null;
          }
          if (this.plateShadow) {
            this.plateShadow.destroy();
            this.plateShadow = null;
          }
          this.node.destroy();
        }

        /** 上菜收款时的飘字演出：上方弹出 +金额 */;
        _proto.showPay = function showPay(amount) {
          var lab = makeLabel('pay', this.node, "+" + amount + "\uD83E\uDE99", 18, 0, 140, COLOR.accent);
          lab.isBold = true;
          tween(lab.node).to(0.7, {
            position: new Vec3(0, 200, 0)
          }).call(function () {
            return lab.node.destroy();
          }).start();
          tween(this.node).to(0.1, {
            scale: new Vec3(1.12, 1.12, 1)
          }).to(0.1, {
            scale: new Vec3(1, 1, 1)
          }).start();
        };
        _createClass(CustomerView, [{
          key: "state",
          get: function get() {
            return this._state;
          }
        }, {
          key: "satisfaction",
          get: function get() {
            return Math.max(0, Math.round(MAX_SATISFACTION - MAX_SATISFACTION / this.maxWait * this.waitTimer));
          }
        }, {
          key: "paid",
          get: function get() {
            return paidAmount(this.price, this.satisfaction);
          }
        }, {
          key: "wantsLeavesUpset",
          get: function get() {
            return this.satisfaction <= 0 && this._state === CustomerState.ORDERING;
          }
        }, {
          key: "isGone",
          get: function get() {
            return this._state === CustomerState.GONE;
          }
        }]);
        return CustomerView;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/DialogueView.ts", ['cc', './Widgets.ts', './ArtView.ts'], function (exports) {
  var cclegacy, Color, Node, makeRect, makeLabel, COLOR, ArtService;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      Color = module.Color;
      Node = module.Node;
    }, function (module) {
      makeRect = module.makeRect;
      makeLabel = module.makeLabel;
      COLOR = module.COLOR;
    }, function (module) {
      ArtService = module.ArtService;
    }],
    execute: function () {
      cclegacy._RF.push({}, "12b4cxOnbhF3rUAgFy8C04H", "DialogueView", undefined);
      var DialogueView = exports('DialogueView', /*#__PURE__*/function () {
        function DialogueView(parent) {
          var _this = this;
          this.overlay = void 0;
          this.panel = void 0;
          this.avatar = void 0;
          this.avatarFrameRef = null;
          this.nameL = void 0;
          this.textL = void 0;
          this.lines = [];
          this.idx = 0;
          this.onDone = void 0;
          this.overlay = makeRect('dlg-overlay', parent, 960, 640, 0, 0, new Color(0, 0, 0, 120));
          this.overlay.active = false;
          this.overlay.on(Node.EventType.TOUCH_START, function () {
            return _this.next();
          });
          this.panel = ArtService.panelWithArt('dlg-panel', parent, 'panel-dialogue', 760, 200, 0, -200);
          this.panel.active = false;
          this.avatar = makeLabel('dlg-avatar', this.panel, '🙂', 54, -300, 0, COLOR.text);
          this.nameL = makeLabel('dlg-name', this.panel, '', 20, -170, 60, COLOR.primary);
          this.nameL.isBold = true;
          this.textL = makeLabel('dlg-text', this.panel, '', 18, -170, 0, COLOR.text);
          this.panel.on(Node.EventType.TOUCH_START, function () {
            return _this.next();
          });
        }
        var _proto = DialogueView.prototype;
        _proto.play = function play(lines, onDone) {
          if (!lines || lines.length === 0) {
            onDone == null || onDone();
            return;
          }
          this.lines = lines;
          this.idx = 0;
          this.onDone = onDone;
          this.overlay.active = true;
          this.panel.active = true;
          this.render();
        };
        _proto.render = function render() {
          var l = this.lines[this.idx];
          this.nameL.string = l.who;
          this.textL.string = l.text;
          if (this.avatarFrameRef) {
            this.avatarFrameRef.destroy();
            this.avatarFrameRef = null;
          }
          var head = ArtService.makeSprite(this.panel, l.artKey, 120, 120, -300, 0, 'dlg-avatar-art');
          if (head) {
            this.avatar.node.active = false;
            this.avatarFrameRef = head;
          } else {
            this.avatar.node.active = true;
            this.avatar.string = l.emoji;
          }
        };
        _proto.next = function next() {
          if (!this.panel.active) return;
          this.idx++;
          if (this.idx >= this.lines.length) {
            this.overlay.active = false;
            this.panel.active = false;
            var cb = this.onDone;
            this.onDone = undefined;
            cb == null || cb();
            return;
          }
          this.render();
        };
        return DialogueView;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/dishes.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports('dishById', dishById);
      cclegacy._RF.push({}, "6774eISopNDR4C5mN+Wmlwb", "dishes", undefined);
      var DISHES = exports('DISHES', [{
        id: 'fries',
        name: '薯条',
        price: 10,
        cookTime: 4,
        unlockCost: 0,
        artKey: 'dish-fries'
      }, {
        id: 'burger',
        name: '汉堡',
        price: 15,
        cookTime: 6,
        unlockCost: 0,
        artKey: 'dish-burger'
      }, {
        id: 'pizza',
        name: '披萨',
        price: 30,
        cookTime: 9,
        unlockCost: 80,
        artKey: 'dish-pizza'
      }, {
        id: 'pasta',
        name: '意面',
        price: 45,
        cookTime: 12,
        unlockCost: 200,
        artKey: 'dish-pasta'
      }, {
        id: 'steak',
        name: '牛排',
        price: 70,
        cookTime: 16,
        unlockCost: 450,
        artKey: 'dish-steak'
      }, {
        id: 'dessert',
        name: '甜品',
        price: 100,
        cookTime: 20,
        unlockCost: 800,
        artKey: 'dish-dessert'
      }]);
      function dishById(id) {
        return DISHES.find(function (d) {
          return d.id === id;
        });
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/EventBus.ts", ['cc'], function (exports) {
  var cclegacy, EventTarget;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      EventTarget = module.EventTarget;
    }],
    execute: function () {
      cclegacy._RF.push({}, "076ecLM6lRHH5ctSaiQruRf", "EventBus", undefined);
      var Events = exports('Events', {
        CoinsChanged: 'CoinsChanged',
        MenuChanged: 'MenuChanged',
        CustomerCountChanged: 'CustomerCountChanged'
      });
      var bus = exports('bus', new EventTarget());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/gameData.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './dishes.ts', './skins.ts'], function (exports) {
  var _createClass, cclegacy, DISHES, SKINS;
  return {
    setters: [function (module) {
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      DISHES = module.DISHES;
    }, function (module) {
      SKINS = module.SKINS;
    }],
    execute: function () {
      exports({
        cookTimeAtLevel: cookTimeAtLevel,
        createDefaultSave: createDefaultSave,
        kitchenSlotCount: kitchenSlotCount,
        kitchenUpgradeCost: kitchenUpgradeCost,
        tableCountAtLevel: tableCountAtLevel,
        tableUpgradeCost: tableUpgradeCost
      });
      cclegacy._RF.push({}, "4da46TwzTFAFZUyXwR2GNuT", "gameData", undefined);
      var SAVE_VERSION = exports('SAVE_VERSION', 1);
      var TABLE_LEVEL_MAX = exports('TABLE_LEVEL_MAX', 5);
      var KITCHEN_LEVEL_MAX = exports('KITCHEN_LEVEL_MAX', 5);
      var TABLE_BASE_COST = exports('TABLE_BASE_COST', 100);
      var KITCHEN_BASE_COST = exports('KITCHEN_BASE_COST', 150);
      var KITCHEN_TIME_REDUCTION = exports('KITCHEN_TIME_REDUCTION', 0.85);
      var COOK_TIME_FLOOR = exports('COOK_TIME_FLOOR', 1);
      var ENERGY_MAX = exports('ENERGY_MAX', 12);
      var ENERGY_REGEN_SEC = exports('ENERGY_REGEN_SEC', 5);
      function tableUpgradeCost(level) {
        return TABLE_BASE_COST * level * level;
      }
      function kitchenUpgradeCost(level) {
        return KITCHEN_BASE_COST * level * level;
      }
      function cookTimeAtLevel(baseTime, kitchenLevel) {
        var t = baseTime;
        for (var i = 1; i < kitchenLevel; i++) t *= KITCHEN_TIME_REDUCTION;
        return Math.max(COOK_TIME_FLOOR, Math.round(t));
      }
      function tableCountAtLevel(level) {
        return Math.max(1, level);
      }
      function kitchenSlotCount(level) {
        return Math.max(1, level);
      }
      function createDefaultSave() {
        return {
          version: SAVE_VERSION,
          coins: 100,
          unlockedDishIds: DISHES.filter(function (d) {
            return d.unlockCost === 0;
          }).map(function (d) {
            return d.id;
          }),
          tableLevel: 1,
          kitchenLevel: 1,
          totalRevenue: 0,
          chapterIndex: 0,
          servedTotal: 0,
          happyTotal: 0,
          introPlayed: false,
          energy: ENERGY_MAX,
          ownedSkinIds: ['classic'],
          activeSkinId: 'classic',
          mergeGrid: []
        };
      }
      var GameData = exports('GameData', /*#__PURE__*/function () {
        function GameData(save) {
          var _chapterIndex, _servedTotal, _happyTotal, _introPlayed, _energy, _ownedSkinIds, _activeSkinId, _mergeGrid;
          this.coins = void 0;
          this.unlockedDishIds = void 0;
          this.tableLevel = void 0;
          this.kitchenLevel = void 0;
          this.totalRevenue = void 0;
          this.chapterIndex = void 0;
          this.servedTotal = void 0;
          this.happyTotal = void 0;
          this.introPlayed = void 0;
          this.energy = void 0;
          this.ownedSkinIds = void 0;
          this.activeSkinId = void 0;
          this.mergeGrid = [];
          var base = save != null ? save : createDefaultSave();
          this.coins = base.coins;
          this.unlockedDishIds = [].concat(base.unlockedDishIds);
          this.tableLevel = base.tableLevel;
          this.kitchenLevel = base.kitchenLevel;
          this.totalRevenue = base.totalRevenue;
          this.chapterIndex = (_chapterIndex = base.chapterIndex) != null ? _chapterIndex : 0;
          this.servedTotal = (_servedTotal = base.servedTotal) != null ? _servedTotal : 0;
          this.happyTotal = (_happyTotal = base.happyTotal) != null ? _happyTotal : 0;
          this.introPlayed = (_introPlayed = base.introPlayed) != null ? _introPlayed : false;
          this.energy = (_energy = base.energy) != null ? _energy : ENERGY_MAX;
          this.ownedSkinIds = (_ownedSkinIds = base.ownedSkinIds) != null ? _ownedSkinIds : ['classic'];
          this.activeSkinId = (_activeSkinId = base.activeSkinId) != null ? _activeSkinId : 'classic';
          this.mergeGrid = (_mergeGrid = base.mergeGrid) != null ? _mergeGrid : [];
        }
        var _proto = GameData.prototype;
        _proto.dishUnlocked = function dishUnlocked(id) {
          return this.unlockedDishIds.indexOf(id) !== -1;
        };
        _proto.earn = function earn(amount) {
          this.coins += Math.max(0, Math.round(amount));
          this.totalRevenue += Math.max(0, Math.round(amount));
        };
        _proto.canSpend = function canSpend(amount) {
          return this.coins >= amount;
        };
        _proto.spend = function spend(amount) {
          if (!this.canSpend(amount)) return false;
          this.coins -= amount;
          return true;
        };
        _proto.canUnlockDish = function canUnlockDish(id) {
          var dish = DISHES.find(function (d) {
            return d.id === id;
          });
          if (!dish || dish.unlockCost === 0) return false;
          return !this.dishUnlocked(id) && this.canSpend(dish.unlockCost);
        };
        _proto.unlockDish = function unlockDish(id) {
          var dish = DISHES.find(function (d) {
            return d.id === id;
          });
          if (!dish || !this.canUnlockDish(id)) return false;
          this.spend(dish.unlockCost);
          this.unlockedDishIds.push(id);
          return true;
        };
        _proto.mergeUnlockDish = function mergeUnlockDish(id) {
          var dish = DISHES.find(function (d) {
            return d.id === id;
          });
          if (!dish || this.dishUnlocked(id)) return false;
          this.unlockedDishIds.push(id);
          return true;
        };
        _proto.skinOwned = function skinOwned(id) {
          return this.ownedSkinIds.indexOf(id) !== -1;
        };
        _proto.unlockSkin = function unlockSkin(id) {
          var skin = SKINS.find(function (s) {
            return s.id === id;
          });
          if (!skin || this.skinOwned(id)) return false;
          if (!this.canSpend(skin.cost)) return false;
          this.spend(skin.cost);
          this.ownedSkinIds.push(id);
          this.activeSkinId = id;
          return true;
        };
        _proto.setSkin = function setSkin(id) {
          if (!this.skinOwned(id)) return false;
          this.activeSkinId = id;
          return true;
        };
        _proto.canUpgradeTable = function canUpgradeTable() {
          return this.tableLevel < TABLE_LEVEL_MAX && this.canSpend(tableUpgradeCost(this.tableLevel));
        };
        _proto.upgradeTable = function upgradeTable() {
          if (!this.canUpgradeTable()) return false;
          this.spend(tableUpgradeCost(this.tableLevel));
          this.tableLevel++;
          return true;
        };
        _proto.canUpgradeKitchen = function canUpgradeKitchen() {
          return this.kitchenLevel < KITCHEN_LEVEL_MAX && this.canSpend(kitchenUpgradeCost(this.kitchenLevel));
        };
        _proto.upgradeKitchen = function upgradeKitchen() {
          if (!this.canUpgradeKitchen()) return false;
          this.spend(kitchenUpgradeCost(this.kitchenLevel));
          this.kitchenLevel++;
          return true;
        };
        _proto.toSave = function toSave() {
          return {
            version: SAVE_VERSION,
            coins: this.coins,
            unlockedDishIds: [].concat(this.unlockedDishIds),
            tableLevel: this.tableLevel,
            kitchenLevel: this.kitchenLevel,
            totalRevenue: this.totalRevenue,
            chapterIndex: this.chapterIndex,
            servedTotal: this.servedTotal,
            happyTotal: this.happyTotal,
            introPlayed: this.introPlayed,
            energy: this.energy,
            ownedSkinIds: [].concat(this.ownedSkinIds),
            activeSkinId: this.activeSkinId,
            mergeGrid: this.mergeGrid
          };
        };
        _createClass(GameData, [{
          key: "availableDishes",
          get: function get() {
            var _this = this;
            return DISHES.filter(function (d) {
              return _this.unlockedDishIds.indexOf(d.id) !== -1;
            });
          }
        }]);
        return GameData;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/HudView.ts", ['cc', './Widgets.ts', './ArtView.ts'], function (exports) {
  var cclegacy, Button, Label, tween, Vec3, Color, roundRect, makeLabel, COLOR, pillButton, ArtService;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      Button = module.Button;
      Label = module.Label;
      tween = module.tween;
      Vec3 = module.Vec3;
      Color = module.Color;
    }, function (module) {
      roundRect = module.roundRect;
      makeLabel = module.makeLabel;
      COLOR = module.COLOR;
      pillButton = module.pillButton;
    }, function (module) {
      ArtService = module.ArtService;
    }],
    execute: function () {
      cclegacy._RF.push({}, "04369tJdalKy6/X/ujsLgcI", "HudView", undefined);
      var HudView = exports('HudView', /*#__PURE__*/function () {
        function HudView(parent, upgradeCb, chapterCb, adCb, mergeCb) {
          this.coinsLabel = void 0;
          this.custLabel = void 0;
          this.tableLevelLabel = void 0;
          this.kitchenLevelLabel = void 0;
          this.comboLabel = void 0;
          this.chapterBtn = void 0;
          this.energyBtn = void 0;
          this.energyLabel = void 0;
          this.lastCoins = -1;
          this.energyHasIcon = false;
          this.custHasIcon = false;
          ArtService.panelWithArt('hud-bg', parent, 'panel-hud', 920, 58, 0, 293);

          // —— 左组：金币 / 体力 / 在店 / 合成台 ——
          roundRect('coin-badge', parent, 110, 38, -395, 293, 19, new Color(255, 201, 77, 60));
          var coinIcon = ArtService.attachIconSprite(parent, 'icon-coin', -432, 293, 26);
          if (!coinIcon) makeLabel('coin-icon', parent, '🪙', 20, -432, 293, COLOR.accent);
          this.coinsLabel = makeLabel('coins', parent, '0', 20, -378, 293, COLOR.text);
          this.coinsLabel.isBold = true;
          var energy = this.iconPill('energy-btn', parent, 96, -282, COLOR.primary, 'icon-energy', '⚡', adCb);
          this.energyBtn = energy.node;
          this.energyLabel = energy.label;
          this.energyHasIcon = energy.hasIcon;
          var cust = this.iconPill('cust-pill', parent, 96, -174, new Color(255, 201, 77, 60), 'icon-customer', '🧑', null);
          this.custHasIcon = cust.hasIcon;
          this.custLabel = cust.label;
          pillButton('merge-btn', parent, 88, 34, -74, 293, COLOR.accent, '合成台', mergeCb);
          this.comboLabel = makeLabel('combo', parent, '', 15, 17, 293, COLOR.accent);
          this.comboLabel.isBold = true;
          this.comboLabel.node.active = false;

          // —— 右组：桌等级 / 厨等级 / 章节 / 升级 ——
          this.tableLevelLabel = this.tag(parent, '桌 L1', 100);
          this.kitchenLevelLabel = this.tag(parent, '厨 L1', 184);
          this.chapterBtn = pillButton('chapter-btn', parent, 126, 34, 295, 293, COLOR.accent, '第1章', chapterCb);
          pillButton('upgrade-btn', parent, 80, 34, 410, 293, COLOR.primary, '升级', upgradeCb);
        }

        /** 图标 + 数字的药丸：图标固定在左侧，文字在剩余空间居中，互不重叠 */
        var _proto = HudView.prototype;
        _proto.iconPill = function iconPill(name, parent, w, x, bg, iconKey, fallbackIcon, cb) {
          var y = 293;
          var h = 34;
          var n = roundRect(name, parent, w, h, x, y, h / 2, bg);
          if (cb) {
            n.addComponent(Button);
            n.on(Button.EventType.CLICK, cb);
          }
          var hasIcon = ArtService.attachIconSprite(n, iconKey, -w / 2 + 22, 0, 26) !== null;
          if (!hasIcon) makeLabel(name + '-ic', n, fallbackIcon, 18, -w / 2 + 22, 0, COLOR.accent);
          var label = makeLabel(name + '-text', n, '', 16, 16, 0, COLOR.text);
          return {
            node: n,
            label: label,
            hasIcon: hasIcon
          };
        };
        _proto.setChapter = function setChapter(index, total, stars) {
          var label = this.chapterBtn.getComponentInChildren(Label);
          label.string = "\u7B2C" + (index + 1) + "/" + total + "\u7AE0 \u2B50" + stars;
          label.fontSize = 15;
        };
        _proto.setEnergy = function setEnergy(cur, max) {
          this.energyLabel.string = cur <= 0 ? '看广告' : cur + "/" + max;
        };
        _proto.setCombo = function setCombo(combo, mult) {
          if (combo <= 1) {
            this.comboLabel.node.active = false;
            return;
          }
          this.comboLabel.node.active = true;
          this.comboLabel.string = "x" + combo + " \xB7 " + mult.toFixed(1) + "\u500D";
          tween(this.comboLabel.node).to(0.12, {
            scale: new Vec3(1.2, 1.2, 1)
          }).to(0.12, {
            scale: new Vec3(1, 1, 1)
          }).start();
        };
        _proto.tag = function tag(parent, text, x) {
          roundRect("tag-bg", parent, 72, 26, x, 293, 13, new Color(255, 138, 92, 40));
          return makeLabel("tag-text", parent, text, 14, x, 293, COLOR.text);
        };
        _proto.refresh = function refresh(d) {
          if (d.coins !== this.lastCoins) {
            this.lastCoins = d.coins;
            this.coinsLabel.string = "" + d.coins;
            tween(this.coinsLabel.node).to(0.12, {
              scale: new Vec3(1.2, 1.2, 1)
            }).to(0.12, {
              scale: new Vec3(1, 1, 1)
            }).start();
          }
          this.custLabel.string = "\u5728\u5E97 " + d.customers;
          this.tableLevelLabel.string = "\u684C L" + d.tableLevel;
          this.kitchenLevelLabel.string = "\u53A8 L" + d.kitchenLevel;
        };
        return HudView;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Kitchen.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Widgets.ts', './ArtView.ts'], function (exports) {
  var _createForOfIteratorHelperLoose, _createClass, cclegacy, Color, Graphics, makeNode, roundRect, COLOR, makeLabel, ArtService;
  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      Color = module.Color;
      Graphics = module.Graphics;
    }, function (module) {
      makeNode = module.makeNode;
      roundRect = module.roundRect;
      COLOR = module.COLOR;
      makeLabel = module.makeLabel;
    }, function (module) {
      ArtService = module.ArtService;
    }],
    execute: function () {
      cclegacy._RF.push({}, "f742b1tTmJOj4GUfxTX+y5/", "Kitchen", undefined);
      var PLATED_MAX = 18; // 做好的菜最多摆 18 秒，没人要就浪费

      var Kitchen = exports('Kitchen', /*#__PURE__*/function () {
        function Kitchen(parent, x, y, cookTimeOf, slotCount) {
          this.onSlotReady = void 0;
          this.slots = [];
          this.slotLayer = void 0;
          this.slotCount = 1;
          this.cookTimeOf = cookTimeOf;
          // 无面板：只渲染一排小灶位图标，挂在顶部订单条下方，不遮挡场景
          this.slotLayer = makeNode('kitchen-slots', parent, 220, 50, x, y);
          this.setSlotCount(slotCount);
        }
        var _proto = Kitchen.prototype;
        _proto.setSlotCount = function setSlotCount(n) {
          this.slotCount = n;
          this.slotLayer.removeAllChildren();
          this.slots = [];
          var gap = 42;
          var startX = -((n - 1) * gap) / 2;
          for (var i = 0; i < n; i++) {
            var root = makeNode("slot-" + i, this.slotLayer, 44, 52, startX + i * gap, 0);
            // 深色底衬让白色灶位圈和文字在浅色背景上可读
            var back = roundRect('back', root, 42, 50, 0, 0, 10, new Color(60, 45, 30, 100));
            var ring = roundRect('ring', root, 34, 34, 0, 8, 17, COLOR.white, COLOR.border).getComponent(Graphics);
            var center = makeLabel('center', root, '', 14, 0, 8, COLOR.text);
            center.isBold = true;
            var name = makeLabel('name', root, '', 11, 0, -18, COLOR.white);
            this.slots.push({
              dish: null,
              remain: 0,
              total: 0,
              ready: false,
              plated: 0,
              root: root,
              ring: ring,
              center: center,
              name: name,
              dishArt: null
            });
          }
        }

        /** 把一道菜放进空闲槽开始做；满槽返回 false */;
        _proto.cookDish = function cookDish(dish) {
          var slot = this.slots.find(function (s) {
            return s.dish === null;
          });
          if (!slot) return false;
          slot.dish = dish;
          slot.total = this.cookTimeOf(dish);
          slot.remain = slot.total;
          slot.ready = false;
          slot.plated = 0;
          this.render(slot);
          return true;
        };
        _proto.update = function update(dt) {
          for (var _iterator = _createForOfIteratorHelperLoose(this.slots), _step; !(_step = _iterator()).done;) {
            var s = _step.value;
            if (s.dish === null) continue;
            if (!s.ready) {
              s.remain -= dt;
              if (s.remain <= 0) {
                var _this$onSlotReady;
                s.remain = 0;
                s.ready = true;
                (_this$onSlotReady = this.onSlotReady) == null || _this$onSlotReady.call(this, s.dish);
              }
              this.render(s);
            } else {
              s.plated += dt;
              if (s.plated >= PLATED_MAX) {
                s.dish = null;
                s.ready = false;
                s.plated = 0;
                this.render(s);
              }
            }
          }
        }

        /** 当前已做好、等待上菜的槽 */;
        _proto.readySlots = function readySlots() {
          return this.slots.filter(function (s) {
            return s.ready && s.dish !== null;
          });
        };
        _proto.takeSlot = function takeSlot(slot) {
          slot.dish = null;
          slot.ready = false;
          slot.plated = 0;
          slot.remain = 0;
          slot.total = 0;
          this.render(slot);
        };
        _proto.render = function render(s) {
          var hasDishArt = s.dish !== null && ArtService.hasArt(s.dish.artKey);
          if (!hasDishArt && s.dishArt) {
            s.dishArt.destroy();
            s.dishArt = null;
          }
          if (hasDishArt && !s.dishArt) {
            s.dishArt = ArtService.makeSprite(s.root, s.dish.artKey, 26, 26, 0, 8, 'dish-art');
          }
          var g = s.ring;
          g.clear();
          var r = 15;
          g.lineWidth = 5;
          g.strokeColor = COLOR.border;
          g.circle(0, 8, r);
          g.stroke();
          if (s.dish === null) {
            s.center.string = '空';
            s.center.color = COLOR.subtext;
            s.name.string = '空闲';
            s.name.color = COLOR.white;
            s.center.node.setPosition(0, 8);
            return;
          }
          s.center.node.setPosition(0, 8);
          if (s.ready) {
            s.center.string = '✓';
            s.center.color = COLOR.green;
            g.strokeColor = COLOR.green;
            g.arc(0, 0, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2, false);
            g.stroke();
            s.name.string = s.dish.name + " \u2713";
            s.name.color = COLOR.green;
          } else {
            var p = s.total > 0 ? 1 - s.remain / s.total : 0;
            s.center.string = Math.ceil(s.remain) + "s";
            s.center.color = COLOR.text;
            g.strokeColor = COLOR.primary;
            g.arc(0, 0, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p, false);
            g.stroke();
            s.name.string = s.dish.name;
            s.name.color = COLOR.white;
          }
        };
        _createClass(Kitchen, [{
          key: "freeSlot",
          get: function get() {
            return this.slots.some(function (s) {
              return s.dish === null;
            });
          }
        }]);
        return Kitchen;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/main", ['./art.ts', './chapters.ts', './dishes.ts', './gameData.ts', './merge.ts', './platform.ts', './satisfaction.ts', './skins.ts', './storage.ts', './types.ts', './EventBus.ts', './Sfx.ts', './AdView.ts', './ArtView.ts', './ChapterView.ts', './CustomerView.ts', './DialogueView.ts', './HudView.ts', './Kitchen.ts', './Main.ts', './MenuView.ts', './MergeView.ts', './RecipeCard.ts', './SkinView.ts', './UpgradeView.ts', './Widgets.ts'], function () {
  return {
    setters: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    execute: function () {}
  };
});

System.register("chunks:///_virtual/Main.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './gameData.ts', './storage.ts', './platform.ts', './dishes.ts', './types.ts', './CustomerView.ts', './Kitchen.ts', './HudView.ts', './MergeView.ts', './RecipeCard.ts', './MenuView.ts', './UpgradeView.ts', './DialogueView.ts', './ChapterView.ts', './AdView.ts', './SkinView.ts', './chapters.ts', './skins.ts', './Widgets.ts', './ArtView.ts', './art.ts', './Sfx.ts'], function (exports) {
  var _inheritsLoose, _createForOfIteratorHelperLoose, cclegacy, _decorator, Color, Graphics, Component, GameData, cookTimeAtLevel, kitchenSlotCount, ENERGY_MAX, ENERGY_REGEN_SEC, tableCountAtLevel, tableUpgradeCost, kitchenUpgradeCost, StorageService, createKVStore, createAdStrategy, dishById, DISHES, CustomerState, CustomerView, Kitchen, HudView, MergeView, RecipeCard, MenuView, UpgradeView, DialogueView, ChapterView, AdView, SkinView, CHAPTERS, DISH_UNLOCK_SCRIPT, skinById, makeNode, makeRect, COLOR, roundRect, makeLabel, ArtService, CUSTOMER_ART, Sfx;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Color = module.Color;
      Graphics = module.Graphics;
      Component = module.Component;
    }, function (module) {
      GameData = module.GameData;
      cookTimeAtLevel = module.cookTimeAtLevel;
      kitchenSlotCount = module.kitchenSlotCount;
      ENERGY_MAX = module.ENERGY_MAX;
      ENERGY_REGEN_SEC = module.ENERGY_REGEN_SEC;
      tableCountAtLevel = module.tableCountAtLevel;
      tableUpgradeCost = module.tableUpgradeCost;
      kitchenUpgradeCost = module.kitchenUpgradeCost;
    }, function (module) {
      StorageService = module.StorageService;
    }, function (module) {
      createKVStore = module.createKVStore;
      createAdStrategy = module.createAdStrategy;
    }, function (module) {
      dishById = module.dishById;
      DISHES = module.DISHES;
    }, function (module) {
      CustomerState = module.CustomerState;
    }, function (module) {
      CustomerView = module.CustomerView;
    }, function (module) {
      Kitchen = module.Kitchen;
    }, function (module) {
      HudView = module.HudView;
    }, function (module) {
      MergeView = module.MergeView;
    }, function (module) {
      RecipeCard = module.RecipeCard;
    }, function (module) {
      MenuView = module.MenuView;
    }, function (module) {
      UpgradeView = module.UpgradeView;
    }, function (module) {
      DialogueView = module.DialogueView;
    }, function (module) {
      ChapterView = module.ChapterView;
    }, function (module) {
      AdView = module.AdView;
    }, function (module) {
      SkinView = module.SkinView;
    }, function (module) {
      CHAPTERS = module.CHAPTERS;
      DISH_UNLOCK_SCRIPT = module.DISH_UNLOCK_SCRIPT;
    }, function (module) {
      skinById = module.skinById;
    }, function (module) {
      makeNode = module.makeNode;
      makeRect = module.makeRect;
      COLOR = module.COLOR;
      roundRect = module.roundRect;
      makeLabel = module.makeLabel;
    }, function (module) {
      ArtService = module.ArtService;
    }, function (module) {
      CUSTOMER_ART = module.CUSTOMER_ART;
    }, function (module) {
      Sfx = module.Sfx;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "a3ca3QlMstBp4lx7eRCF/h7", "Main", undefined);
      var AD_SEC = 15; // 模拟广告时长（秒）
      var ccclass = _decorator.ccclass;
      var Main = exports('Main', (_dec = ccclass('Main'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(Main, _Component);
        function Main() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this.data = void 0;
          _this.storage = void 0;
          _this.ready = false;
          _this.hud = void 0;
          _this.menu = void 0;
          _this.kitchen = void 0;
          _this.upgrade = void 0;
          _this.merge = void 0;
          _this.tables = [];
          _this.customers = [];
          _this.spawnTimer = 2;
          // 玩法层：桌椅/顾客/餐盘都装这里，面板弹窗在其上，动态节点再多也不会盖住弹窗
          _this.gameLayer = void 0;
          _this.combo = 0;
          _this.adBusy = false;
          // 平台广告播放中（微信原生广告没有 isPlaying 可查）
          _this.dialogue = void 0;
          _this.chapterView = void 0;
          _this.adView = void 0;
          _this.skinView = void 0;
          _this.decorNodes = [];
          _this.energyTimer = 0;
          _this.orderBoard = void 0;
          _this.orderList = void 0;
          _this.orderSig = '';
          return _this;
        }
        var _proto = Main.prototype;
        _proto.onLoad = function onLoad() {
          var _this2 = this;
          this.storage = new StorageService(createKVStore());
          this.data = new GameData(this.storage.load());
          void ArtService.preload().then(function () {
            if (!_this2.isValid || !_this2.node.isValid) return;
            _this2.buildGame();
            _this2.ready = true;
          });
        };
        _proto.buildGame = function buildGame() {
          var _this3 = this;
          this.buildBackground();
          this.gameLayer = makeNode('game-layer', this.node, 960, 640, 0, 0);
          this.buildDecor();
          this.buildTables();
          this.kitchen = new Kitchen(this.node, 340, -70, function (d) {
            return cookTimeAtLevel(d.cookTime, _this3.data.kitchenLevel) * (1 - skinById(_this3.data.activeSkinId).bonus.cook * 0.1);
          }, kitchenSlotCount(this.data.kitchenLevel));
          this.kitchen.onSlotReady = function () {
            return Sfx.cook();
          };
          this.hud = new HudView(this.node, function () {
            _this3.upgrade.open();
            _this3.refreshUpgrade();
          }, function () {
            return _this3.openChapters();
          }, function () {
            return _this3.onAdButton();
          }, function () {
            return _this3.merge.open();
          });
          this.hud.setCombo(0, 1);
          this.menu = new MenuView(this.node, function (id) {
            _this3.cookSelected(id);
          }, function (id) {
            if (_this3.data.unlockDish(id)) _this3.refreshAll();
          });
          this.upgrade = new UpgradeView(this.node, {
            onUpgradeTable: function onUpgradeTable() {
              if (_this3.data.upgradeTable()) _this3.refreshAll();
            },
            onUpgradeKitchen: function onUpgradeKitchen() {
              if (_this3.data.upgradeKitchen()) {
                _this3.kitchen.setSlotCount(kitchenSlotCount(_this3.data.kitchenLevel));
                _this3.refreshAll();
              }
            },
            onSkins: function onSkins() {
              return _this3.skinView.open(_this3.data);
            }
          });
          this.chapterView = new ChapterView(this.node, function () {
            var ch = CHAPTERS[_this3.data.chapterIndex];
            if (ch) _this3.dialogue.play(ch.intro, function () {});
          });
          this.dialogue = new DialogueView(this.node);
          this.adView = new AdView(this.node);
          this.skinView = new SkinView(this.node, function () {
            return _this3.applySkin();
          }, function () {
            _this3.refreshHud();
            _this3.saveGame();
          });
          this.applySkin();
          this.merge = new MergeView(this.node, this.data, function () {
            _this3.saveGame();
            _this3.refreshHud();
          }, function (dishId) {
            var lines = DISH_UNLOCK_SCRIPT[dishId];
            if (lines) _this3.dialogue.play(lines);
          });

          // 首次进入播放开场剧情
          if (!this.data.introPlayed) {
            this.data.introPlayed = true;
            this.saveGame();
            var first = CHAPTERS[0];
            if (first) this.dialogue.play(first.intro, function () {});
          }
          this.orderBoard = ArtService.panelWithArt('order-board', this.node, 'panel-orderboard', 920, 40, 0, 235);
          this.orderList = makeNode('order-list', this.orderBoard, 920, 40, 0, 0);
          this.refreshAll();
        };
        _proto.update = function update(dt) {
          if (!this.ready) return;
          this.updateSpawn(dt);
          this.kitchen.update(dt);
          this.serveIfReady();
          this.updateCustomers(dt);
          this.refreshOrderBoard();
          if (this.data.energy < ENERGY_MAX) {
            this.energyTimer += dt;
            if (this.energyTimer >= ENERGY_REGEN_SEC) {
              this.energyTimer = 0;
              this.data.energy++;
              this.refreshHud();
              this.saveGame();
            }
          }
          this.adView.update(dt);
        };
        _proto.cookSelected = function cookSelected(id) {
          var _this4 = this;
          var dish = dishById(id);
          if (!dish) return;
          if (this.data.energy <= 0) {
            this.onAdButton();
            return;
          }
          if (!this.kitchen.cookDish(dish)) {
            Sfx.fail();
            return;
          }
          this.data.energy--;
          this.menu.setSelected(id);
          this.menu.rebuild(this.data.availableDishes, DISHES.filter(function (d) {
            return !_this4.data.dishUnlocked(d.id);
          }), this.data.coins);
          this.refreshHud();
          this.saveGame();
        };
        _proto.onAdButton = function onAdButton() {
          var _this5 = this;
          if (this.data.energy < ENERGY_MAX) {
            this.watchAd(function () {
              _this5.data.energy = ENERGY_MAX;
              _this5.energyTimer = 0;
              _this5.refreshHud();
              _this5.saveGame();
            }, '看广告恢复体力');
          } else {
            this.watchAd(function () {
              _this5.data.earn(30);
              Sfx.coin();
              _this5.refreshHud();
              _this5.saveGame();
            }, '看广告领 30 🪙');
          }
        };
        _proto.watchAd = function watchAd(reward, title) {
          var _this6 = this;
          if (this.adView.isPlaying || this.adBusy) return;
          // 微信小游戏：平台自带广告 UI，直接播放；浏览器预览：走游戏内模拟倒计时面板
          var strategy = createAdStrategy();
          if (strategy["native"]) {
            this.adBusy = true;
            strategy.play(function (rewarded) {
              _this6.adBusy = false;
              if (rewarded) reward();
            });
            return;
          }
          this.adView.play(AD_SEC, reward, title);
        };
        _proto.buildBackground = function buildBackground() {
          var frame = makeRect('bg-frame', this.node, 960, 640, 0, 0, new Color(20, 16, 24, 255));
          frame.setSiblingIndex(0);
          var art = ArtService.makeSprite(this.node, 'bg', 960, 640, 0, 0, 'bg');
          if (art) {
            art.setSiblingIndex(1);
            return;
          }
          var rect = makeRect('bg', this.node, 960, 640, 0, 0, COLOR.bg);
          rect.setSiblingIndex(1);
        };
        _proto.buildTables = function buildTables() {
          for (var _iterator = _createForOfIteratorHelperLoose(this.tables), _step; !(_step = _iterator()).done;) {
            var t = _step.value;
            t.node.destroy();
          }
          var count = tableCountAtLevel(this.data.tableLevel);
          this.tables = [];
          var startX = -((count - 1) * 200) / 2;
          for (var i = 0; i < count; i++) {
            var x = startX + i * 200;
            var node = makeNode("table-" + i, this.gameLayer, 140, 100, x, -176);
            var g = node.addComponent(Graphics);
            // 自上而下：地面投影 → 桌腿 → 前缘 → 桌面（rel 值越小越靠屏幕下方）
            g.fillColor = COLOR.shadow;
            g.roundRect(-70, -48, 140, 14, 7);
            g.fill();
            g.fillColor = new Color(214, 170, 122, 255);
            g.roundRect(-52, -42, 12, 30, 3);
            g.fill();
            g.roundRect(40, -42, 12, 30, 3);
            g.fill();
            g.fillColor = new Color(226, 180, 130, 255);
            g.roundRect(-70, -22, 140, 18, 6);
            g.fill();
            g.fillColor = new Color(247, 230, 205, 255);
            g.roundRect(-70, -2, 140, 22, 10);
            g.fill();
            g.lineWidth = 2;
            g.strokeColor = COLOR.border;
            g.stroke();
            g.fillColor = new Color(255, 255, 255, 70);
            g.roundRect(-60, 2, 120, 6, 3);
            g.fill();
            this.tables.push({
              node: node,
              x: x
            });
          }
          // 桌位重建后让已入座顾客搬到新坐标（跳过已销毁/已离场的）
          for (var _iterator2 = _createForOfIteratorHelperLoose(this.customers), _step2; !(_step2 = _iterator2()).done;) {
            var c = _step2.value;
            if (c.isGone || !c.node.isValid) continue;
            var _t = this.tables[c.tableIndex];
            if (_t) c.syncTable(_t.x, -176);
          }
        };
        _proto.buildDecor = function buildDecor() {
          if (ArtService.hasArt('bg')) return;
          var floor = makeNode('floor', this.gameLayer, 960, 4, 0, -60);
          var fg = floor.addComponent(Graphics);
          fg.fillColor = COLOR.decor;
          fg.rect(-480, -2, 960, 4);
          fg.fill();
          var pic = roundRect('pic', this.gameLayer, 60, 50, -420, 200, 8, COLOR.panel, COLOR.border);
          makeLabel('pic-content', pic, '🌻', 30, 0, 0);
          makeLabel('plant-l', this.gameLayer, '🪴', 44, -450, -30, COLOR.text);
          makeLabel('plant-r', this.gameLayer, '🪴', 44, 450, -30, COLOR.text);
        };
        _proto.updateSpawn = function updateSpawn(dt) {
          var _this7 = this;
          var maxCustomers = this.tables.length;
          if (this.customers.length >= maxCustomers) return;
          this.spawnTimer -= dt;
          if (this.spawnTimer > 0) return;
          this.spawnTimer = 3 + Math.random() * 4;
          var avail = this.data.availableDishes;
          var dish = avail[Math.floor(Math.random() * avail.length)];
          var tableIndex = -1;
          var _loop = function _loop(i) {
            if (!_this7.customers.some(function (c) {
              return c.tableIndex === i;
            })) {
              tableIndex = i;
              return 1; // break
            }
          };

          for (var i = 0; i < this.tables.length; i++) {
            if (_loop(i)) break;
          }
          if (tableIndex < 0) return;
          var table = this.tables[tableIndex];
          // 同屏形象去重：排除当前在场角色
          var used = this.customers.map(function (c) {
            return c.artKey;
          });
          var pool = CUSTOMER_ART.filter(function (a) {
            return used.indexOf(a) === -1;
          });
          var artKey = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : CUSTOMER_ART[Math.floor(Math.random() * CUSTOMER_ART.length)];
          try {
            var c = new CustomerView(this.gameLayer, table.x, -124, dish, tableIndex, artKey, table.x, -176, function (c2) {
              return _this7.onCustomerLeave(c2);
            }, function (d) {
              return RecipeCard.show(_this7.node, d, _this7.data);
            });
            // 装修加成：顾客更有耐心（等待时间更长）
            c.setPatience(1 + skinById(this.data.activeSkinId).bonus.wait * 0.1);
            // 顾客坐桌后：插到桌子节点之下，桌沿遮挡其下半身，形成前后纵深
            c.node.setSiblingIndex(table.node.getSiblingIndex());
            this.customers.push(c);
          } catch (e) {
            console.error('[spawn] 顾客生成失败', e);
            return;
          }
          this.refreshHud();
        };
        _proto.updateCustomers = function updateCustomers(dt) {
          // 先跳过已离场的再更新，防止销毁节点引发的异常中断后续顾客
          for (var _iterator3 = _createForOfIteratorHelperLoose(this.customers), _step3; !(_step3 = _iterator3()).done;) {
            var c = _step3.value;
            if (!c.isGone && c.node.isValid) c.update(dt);
          }
          this.customers = this.customers.filter(function (c) {
            return !c.isGone;
          });
          this.refreshHud();
        };
        _proto.serveIfReady = function serveIfReady() {
          var _this8 = this;
          var _loop2 = function _loop2() {
            var slot = _step4.value;
            var dish = slot.dish;
            var waiting = _this8.customers.find(function (c) {
              return c.state === CustomerState.ORDERING && c.dish.id === dish.id;
            });
            if (waiting) {
              waiting.serve();
              _this8.kitchen.takeSlot(slot);
              _this8.onServed(waiting, dish);
            }
          };
          for (var _iterator4 = _createForOfIteratorHelperLoose(this.kitchen.readySlots()), _step4; !(_step4 = _iterator4()).done;) {
            _loop2();
          }
        };
        _proto.onServed = function onServed(c, _dish) {
          this.combo++;
          var mult = this.comboMultiplier();
          var bonus = skinById(this.data.activeSkinId).bonus;
          var pay = Math.round(c.paid * mult * (1 + bonus.coin * 0.1));
          this.data.earn(pay);
          this.data.servedTotal++;
          if (c.satisfaction >= 70) this.data.happyTotal++;
          Sfx.coin();
          c.showPay(pay);
          this.hud.setCombo(this.combo, mult);
          this.refreshHud();
          this.saveGame();
          this.checkChapter();
        };
        _proto.checkChapter = function checkChapter() {
          var _this9 = this;
          var ch = CHAPTERS[this.data.chapterIndex];
          if (!ch) return;
          var met = ch.goals.every(function (g) {
            if (g.kind === 'revenue') return _this9.data.totalRevenue >= g.target;
            if (g.kind === 'served') return _this9.data.servedTotal >= g.target;
            if (g.kind === 'happy') return _this9.data.happyTotal >= g.target;
            return false;
          });
          if (!met) return;
          this.data.earn(ch.reward.coins);
          this.data.chapterIndex++;
          this.saveGame();
          this.hud.setChapter(this.data.chapterIndex, CHAPTERS.length, this.data.chapterIndex);
          Sfx.coin();
          this.dialogue.play(ch.outro, function () {
            return _this9.openChapters();
          });
        };
        _proto.openChapters = function openChapters() {
          this.chapterView.open(this.data);
        };
        _proto.comboMultiplier = function comboMultiplier() {
          return Math.min(3, 1 + Math.floor(this.combo / 3) * 0.5);
        };
        _proto.onCustomerLeave = function onCustomerLeave(c) {
          var _this10 = this;
          if (c.wantsLeavesUpset) {
            this.combo = 0;
            Sfx.fail();
            this.hud.setCombo(0, 1);
          }
          c.markGone();
          // 离场只刷新菜单可点性和 HUD；重建桌子会打断在场顾客（对已销毁节点操作会抛错）
          this.menu.rebuild(this.data.availableDishes, DISHES.filter(function (d) {
            return !_this10.data.dishUnlocked(d.id);
          }), this.data.coins);
          this.refreshHud();
        };
        _proto.refreshOrderBoard = function refreshOrderBoard() {
          var _this11 = this;
          var pending = this.customers.filter(function (c) {
            return c.state === CustomerState.ORDERING;
          });
          var sig = pending.map(function (c) {
            return c.dish.id;
          }).join(',');
          if (sig === this.orderSig) return;
          this.orderSig = sig;
          this.orderList.removeAllChildren();
          makeLabel('ob-title', this.orderList, '📋 待办订单', 14, -430, 0, COLOR.subtext);
          // 按菜品合并，显示缩略图 + 菜名 + 份数
          var counts = [];
          var _loop3 = function _loop3() {
            var c = _step5.value;
            var it = counts.find(function (x) {
              return x.dish.id === c.dish.id;
            });
            if (it) it.n++;else counts.push({
              dish: c.dish,
              n: 1
            });
          };
          for (var _iterator5 = _createForOfIteratorHelperLoose(pending), _step5; !(_step5 = _iterator5()).done;) {
            _loop3();
          }
          counts.slice(0, 6).forEach(function (it, i) {
            var t = roundRect("ob-" + i, _this11.orderList, 110, 30, -330 + i * 116, 0, 8, COLOR.panel, COLOR.border);
            if (ArtService.hasArt(it.dish.artKey)) {
              ArtService.makeSprite(t, it.dish.artKey, 20, 20, -40, 0, 'ob-dish');
              makeLabel("obt-" + i, t, "" + it.dish.name + (it.n > 1 ? " \xD7" + it.n : ''), 13, -18, 0, COLOR.text);
            } else {
              makeLabel("obt-" + i, t, it.dish.name, 13, 0, 0, COLOR.text);
            }
          });
        };
        _proto.refreshAll = function refreshAll() {
          var _this12 = this;
          this.buildTables();
          this.menu.rebuild(this.data.availableDishes, DISHES.filter(function (d) {
            return !_this12.data.dishUnlocked(d.id);
          }), this.data.coins);
          this.refreshHud();
          if (this.upgrade.isOpen) this.refreshUpgrade();
        };
        _proto.refreshHud = function refreshHud() {
          this.hud.refresh({
            coins: this.data.coins,
            customers: this.customers.filter(function (c) {
              return !c.isGone;
            }).length,
            tableLevel: this.data.tableLevel,
            kitchenLevel: this.data.kitchenLevel
          });
          this.hud.setChapter(this.data.chapterIndex, CHAPTERS.length, this.data.chapterIndex);
          this.hud.setEnergy(this.data.energy, ENERGY_MAX);
          this.saveGame();
        };
        _proto.applySkin = function applySkin() {
          var skin = skinById(this.data.activeSkinId);
          var tint = this.node.getChildByName('skin-tint');
          if (tint) tint.destroy();
          var hasBg = ArtService.hasArt('bg');
          var alpha = hasBg ? 40 : 255;
          var bg = new Color(skin.bg.r, skin.bg.g, skin.bg.b, alpha);
          tint = makeRect('skin-tint', this.node, 960, 640, 0, 0, bg);
          tint.setSiblingIndex(2);
          for (var _iterator6 = _createForOfIteratorHelperLoose(this.decorNodes), _step6; !(_step6 = _iterator6()).done;) {
            var d = _step6.value;
            d.destroy();
          }
          this.decorNodes = [];
          for (var _iterator7 = _createForOfIteratorHelperLoose(skin.decor), _step7; !(_step7 = _iterator7()).done;) {
            var p = _step7.value;
            var art = ArtService.makeSprite(this.node, p.artKey, 88, 88, p.x, p.y, "decor-art-" + p.artKey);
            if (art) {
              art.setSiblingIndex(3);
              this.decorNodes.push(art);
              continue;
            }
            var l = makeLabel("decor-" + p.emoji, this.node, p.emoji, 40, p.x, p.y, COLOR.text);
            l.node.setSiblingIndex(3);
            this.decorNodes.push(l.node);
          }
        };
        _proto.refreshUpgrade = function refreshUpgrade() {
          this.upgrade.refresh({
            coins: this.data.coins,
            tableLevel: this.data.tableLevel,
            kitchenLevel: this.data.kitchenLevel,
            tableCost: tableUpgradeCost(this.data.tableLevel),
            kitchenCost: kitchenUpgradeCost(this.data.tableLevel),
            tableMaxed: this.data.tableLevel >= 5,
            kitchenMaxed: this.data.kitchenLevel >= 5
          });
        };
        _proto.saveGame = function saveGame() {
          this.storage.save(this.data.toSave());
        };
        return Main;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/MenuView.ts", ['cc', './Widgets.ts', './ArtView.ts'], function (exports) {
  var cclegacy, Color, Button, Vec3, roundRect, COLOR, makeLabel, makeRect, ArtService;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      Color = module.Color;
      Button = module.Button;
      Vec3 = module.Vec3;
    }, function (module) {
      roundRect = module.roundRect;
      COLOR = module.COLOR;
      makeLabel = module.makeLabel;
      makeRect = module.makeRect;
    }, function (module) {
      ArtService = module.ArtService;
    }],
    execute: function () {
      cclegacy._RF.push({}, "7633fJPVEdAmIFiL3pNPMVz", "MenuView", undefined);
      var MenuView = exports('MenuView', /*#__PURE__*/function () {
        function MenuView(parent, onSelect, onTryUnlock) {
          this.root = void 0;
          this.selectedId = null;
          this.parent = parent;
          this.onSelect = onSelect;
          this.onTryUnlock = onTryUnlock;
          this.root = ArtService.panelWithArt('menu-panel', parent, 'panel-menu', 920, 110, 0, -265);
          makeLabel('title', parent, '菜谱', 18, -420, -300, COLOR.text);
        }
        var _proto = MenuView.prototype;
        _proto.rebuild = function rebuild(available, locked, coins) {
          var _this = this;
          this.root.removeAllChildren();
          available.forEach(function (d, i) {
            var selected = d.id === _this.selectedId;
            var card = roundRect("dish-" + d.id, _this.root, 96, 96, -330 + i * 118, 0, 12, selected ? new Color(255, 138, 92, 45) : COLOR.panel, selected ? COLOR.primary : COLOR.border);
            card.addComponent(Button);
            if (selected) card.scale = new Vec3(1.05, 1.05, 1);
            var art = ArtService.makeSprite(card, d.artKey, 52, 52, 0, 6, 'dish-art');
            if (!art) {
              makeLabel('name', card, d.name, 14, 0, 0, COLOR.text);
              card.on(Button.EventType.CLICK, function () {
                return _this.pick(d.id);
              });
              return;
            }
            var nameL = makeLabel('name', card, d.name, 14, 0, -30, COLOR.text);
            nameL.isBold = true;
            makeLabel('price', card, d.price + " \uD83E\uDE99", 11, 0, -44, COLOR.accent);
            card.on(Button.EventType.CLICK, function () {
              return _this.pick(d.id);
            });
          });
          locked.forEach(function (d, i) {
            var afford = coins >= d.unlockCost;
            var card = roundRect("lock-" + d.id, _this.root, 96, 96, -330 + (available.length + i) * 118, 0, 12, new Color(156, 133, 104, 60), afford ? COLOR.accent : COLOR.border);
            card.addComponent(Button);
            var art = ArtService.makeSprite(card, d.artKey, 52, 52, 0, 6, 'dish-art');
            if (!art) {
              var lockIcon = ArtService.attachIconSprite(card, 'icon-lock', -46, -4, 18);
              var _nameL = makeLabel('name', card, "" + (lockIcon ? '' : '🔒 ') + d.name, 14, lockIcon ? 8 : 0, 14, COLOR.subtext);
              _nameL.isBold = true;
              makeLabel('price', card, d.unlockCost + " \uD83E\uDE99", 12, 0, -18, afford ? COLOR.accent : COLOR.subtext);
              card.on(Button.EventType.CLICK, function () {
                return _this.onTryUnlock(d.id);
              });
              return;
            }
            // 菜品图变暗 + 锁图标
            _this.darken(card);
            ArtService.attachIconSprite(card, 'icon-lock', 0, 8, 20);
            var nameL = makeLabel('name', card, d.name, 14, 0, -30, COLOR.subtext);
            nameL.isBold = true;
            makeLabel('price', card, d.unlockCost + " \uD83E\uDE99", 11, 0, -44, afford ? COLOR.accent : COLOR.subtext);
            card.on(Button.EventType.CLICK, function () {
              return _this.onTryUnlock(d.id);
            });
          });
        }

        /** 在主视觉菜品图位置叠一层半透明深灰罩（圆角），表达锁定态 */;
        _proto.darken = function darken(card) {
          makeRect('lock-veil', card, 52, 52, 0, 6, new Color(90, 70, 50, 90));
        };
        _proto.setSelected = function setSelected(id) {
          this.selectedId = id;
        };
        _proto.pick = function pick(id) {
          this.selectedId = id;
          this.onSelect(id);
        };
        return MenuView;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/merge.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _createForOfIteratorHelperLoose, cclegacy;
  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports({
        chainFor: chainFor,
        mergeItemById: mergeItemById,
        mergeNext: mergeNext
      });
      cclegacy._RF.push({}, "54496U7xelOv5Ogk3IdS4Tt", "merge", undefined);
      var MERGE_ITEMS = exports('MERGE_ITEMS', [
      // 链 A → pizza（ing-* 为程序占位图，正式素材按 docs/ai-art-prompts.md 重出）
      {
        id: 'm-veg',
        name: '蔬菜',
        glyph: '🥬',
        artKey: 'ing-veg',
        tier: 0,
        nextId: 'm-salad',
        cost: 12
      }, {
        id: 'm-salad',
        name: '沙拉',
        glyph: '🥗',
        artKey: 'ing-salad',
        tier: 1,
        nextId: 'm-pizza'
      }, {
        id: 'm-pizza',
        name: '披萨',
        glyph: '🍕',
        artKey: 'dish-pizza',
        tier: 2,
        nextId: null,
        unlocksDishId: 'pizza',
        sell: 36
      },
      // 链 B → steak
      {
        id: 'm-meat',
        name: '生肉',
        glyph: '🥩',
        artKey: 'ing-meat',
        tier: 0,
        nextId: 'm-stew',
        cost: 16
      }, {
        id: 'm-stew',
        name: '炖肉',
        glyph: '🍲',
        artKey: 'ing-stew',
        tier: 1,
        nextId: 'm-steak'
      }, {
        id: 'm-steak',
        name: '牛排',
        glyph: '🥩',
        artKey: 'dish-steak',
        tier: 2,
        nextId: null,
        unlocksDishId: 'steak',
        sell: 46
      },
      // 链 C → dessert
      {
        id: 'm-dough',
        name: '面团',
        glyph: '🍞',
        artKey: 'ing-dough',
        tier: 0,
        nextId: 'm-cake',
        cost: 14
      }, {
        id: 'm-cake',
        name: '蛋糕胚',
        glyph: '🍰',
        artKey: 'ing-cake',
        tier: 1,
        nextId: 'm-dessert'
      }, {
        id: 'm-dessert',
        name: '甜品',
        glyph: '🍰',
        artKey: 'dish-dessert',
        tier: 2,
        nextId: null,
        unlocksDishId: 'dessert',
        sell: 42
      },
      // 链 D → pasta
      {
        id: 'm-cheese',
        name: '奶酪',
        glyph: '🧀',
        artKey: 'ing-cheese',
        tier: 0,
        nextId: 'm-pastadough',
        cost: 18
      }, {
        id: 'm-pastadough',
        name: '面坯',
        glyph: '🥟',
        artKey: 'ing-pasta-dough',
        tier: 1,
        nextId: 'm-pasta'
      }, {
        id: 'm-pasta',
        name: '意面',
        glyph: '🍝',
        artKey: 'dish-pasta',
        tier: 2,
        nextId: null,
        unlocksDishId: 'pasta',
        sell: 50
      }]);
      var MERGE_BASE_IDS = exports('MERGE_BASE_IDS', ['m-veg', 'm-meat', 'm-dough', 'm-cheese']);
      var BY_ID = {};
      for (var _i = 0, _MERGE_ITEMS = MERGE_ITEMS; _i < _MERGE_ITEMS.length; _i++) {
        var it = _MERGE_ITEMS[_i];
        BY_ID[it.id] = it;
      }
      function mergeItemById(id) {
        return BY_ID[id];
      }
      function mergeNext(id) {
        var it = BY_ID[id];
        return it ? it.nextId : null;
      }

      /** 按菜品 id 找到它的研发链（基础 → 中间 → 最终）；找不到返回空数组 */
      function chainFor(dishId) {
        for (var _iterator = _createForOfIteratorHelperLoose(MERGE_BASE_IDS), _step; !(_step = _iterator()).done;) {
          var base = _step.value;
          var chain = [];
          var cur = base;
          while (cur) {
            var _it = BY_ID[cur];
            if (!_it) break;
            chain.push(_it);
            if (_it.unlocksDishId === dishId) return chain;
            cur = _it.nextId;
          }
        }
        return [];
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/MergeView.ts", ['cc', './merge.ts', './Widgets.ts', './ArtView.ts'], function (exports) {
  var cclegacy, Color, Node, Button, tween, MERGE_BASE_IDS, mergeItemById, mergeNext, makeNode, makeRect, roundRect, COLOR, makeLabel, pillButton, ArtService;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      Color = module.Color;
      Node = module.Node;
      Button = module.Button;
      tween = module.tween;
    }, function (module) {
      MERGE_BASE_IDS = module.MERGE_BASE_IDS;
      mergeItemById = module.mergeItemById;
      mergeNext = module.mergeNext;
    }, function (module) {
      makeNode = module.makeNode;
      makeRect = module.makeRect;
      roundRect = module.roundRect;
      COLOR = module.COLOR;
      makeLabel = module.makeLabel;
      pillButton = module.pillButton;
    }, function (module) {
      ArtService = module.ArtService;
    }],
    execute: function () {
      cclegacy._RF.push({}, "79060+mi2xBL7V7cFmOyjI6", "MergeView", undefined);
      var COLS = 4;
      var ROWS = 4;
      var CELLS = COLS * ROWS;
      var CELL_W = 110;
      var CELL_H = 74;

      // 基础素材商店：花金币定向买入，替代旧的随机产出（随机会让玩家凑不齐配对而卡死）
      var BASE_OFFERS = MERGE_BASE_IDS.map(function (id) {
        var _mergeItemById$cost, _mergeItemById;
        return {
          id: id,
          cost: (_mergeItemById$cost = (_mergeItemById = mergeItemById(id)) == null ? void 0 : _mergeItemById.cost) != null ? _mergeItemById$cost : 0
        };
      });
      var MergeView = exports('MergeView', /*#__PURE__*/function () {
        function MergeView(parent, data, save, onUnlock) {
          this.root = void 0;
          this.contents = [];
          this.itemIds = [];
          this.selected = -1;
          this.chainStrip = null;
          this.genLabel = void 0;
          this.genCdEnd = 0;
          this.parent = parent;
          this.data = data;
          this.save = save;
          this.onUnlock = onUnlock;
          this.itemIds = this.data.mergeGrid && this.data.mergeGrid.length === CELLS ? [].concat(this.data.mergeGrid) : new Array(CELLS).fill(null);
          this.build();
        }
        var _proto = MergeView.prototype;
        _proto.open = function open() {
          this.root.active = true;
        };
        _proto.build = function build() {
          var _this = this;
          // 布局自上而下：标题 → 合成链路图 → 素材商店 → 规则提示 → 4×4 格子
          this.root = makeNode('merge-root', this.parent, 960, 640, 0, 0);
          this.root.active = false;
          makeRect('merge-shade', this.root, 960, 640, 0, 0, new Color(0, 0, 0, 150)).on(Node.EventType.TOUCH_END, function () {
            return _this.close();
          });
          roundRect('merge-panel', this.root, 560, 470, 0, -75, 18, COLOR.panel, COLOR.border);
          makeLabel('merge-title', this.root, '🧩 合成台 · 研发新菜', 20, -30, 210, COLOR.text);
          pillButton('merge-close', this.root, 80, 34, 235, 210, COLOR.border, '关闭', function () {
            return _this.close();
          });
          this.renderChains();

          // 素材行：免费生成器（带冷却）+ 四种金币购买
          var genCard = roundRect('gen-card', this.root, 102, 46, -216, 120, 12, new Color(126, 217, 167, 70), COLOR.green);
          genCard.addComponent(Button);
          genCard.on(Button.EventType.CLICK, function () {
            return _this.gen();
          });
          var genIcon = makeLabel('gen-icon', genCard, '🤖', 20, -26, 0, COLOR.text);
          this.genLabel = makeLabel('gen-label', genCard, '免费生成', 13, 12, 0, COLOR.text);
          tween(this.genLabel.node).repeatForever(tween(this.genLabel.node).delay(0.5).call(function () {
            var remain = _this.genCdEnd - Date.now();
            _this.genLabel.string = remain > 0 ? "\u51B7\u5374 " + Math.ceil(remain / 1000) + "s" : '免费生成';
          })).start();
          BASE_OFFERS.forEach(function (offer, i) {
            var _it$artKey, _it$glyph;
            var x = -106 + i * 110;
            var btn = roundRect("buy-" + offer.id, _this.root, 102, 46, x, 120, 12, COLOR.panel, COLOR.accent);
            btn.addComponent(Button);
            btn.on(Button.EventType.CLICK, function () {
              return _this.buy(offer.id);
            });
            var it = mergeItemById(offer.id);
            var icon = ArtService.attachIconSprite(btn, (_it$artKey = it == null ? void 0 : it.artKey) != null ? _it$artKey : '', -26, 0, 26);
            if (!icon) makeLabel("buy-ic-" + i, btn, (_it$glyph = it == null ? void 0 : it.glyph) != null ? _it$glyph : '❓', 20, -26, 0, COLOR.text);
            makeLabel("buy-price-" + i, btn, offer.cost + "\uD83E\uDE99", 13, 12, 0, COLOR.accent);
          });
          makeLabel('merge-hint', this.root, '买素材放入格子 · 两两相同合成升阶 · 最高阶解锁新菜', 12, 0, 70, COLOR.subtext);
          var grid = makeNode('merge-grid', this.root, COLS * CELL_W, ROWS * CELL_H, 0, -80);
          var startX = -((COLS - 1) * CELL_W) / 2;
          var startY = (ROWS - 1) * CELL_H / 2;
          var _loop = function _loop(i) {
            var col = i % COLS;
            var row = Math.floor(i / COLS);
            var x = startX + col * CELL_W;
            var y = startY - row * CELL_H;
            var cell = makeNode("cell-" + i, grid, CELL_W - 10, CELL_H - 10, x, y);
            roundRect("cell-bg-" + i, cell, CELL_W - 10, CELL_H - 10, 0, 0, 8, COLOR.panel, COLOR.border);
            var content = makeNode("cell-content-" + i, cell, CELL_W - 10, CELL_H - 10, 0, 0);
            _this.contents.push(content);
            cell.on(Node.EventType.TOUCH_END, function () {
              return _this.onCellTap(i);
            });
          };
          for (var i = 0; i < CELLS; i++) {
            _loop(i);
          }
          this.renderGrid();
        }

        /** 四条合成链一览：基础 → 中间 → 最终菜；最终阶已解锁描绿框、未解锁描灰框 */;
        _proto.renderChains = function renderChains() {
          var _this2 = this;
          if (this.chainStrip) this.chainStrip.destroy();
          this.chainStrip = makeNode('chain-strip', this.root, 560, 34, 0, 170);
          BASE_OFFERS.forEach(function (offer, i) {
            var cx = -210 + i * 140;
            var ids = [];
            var cur = offer.id;
            while (cur) {
              ids.push(cur);
              cur = mergeNext(cur);
            }
            ids.forEach(function (id, j) {
              var _it$artKey2, _it$glyph2;
              var it = mergeItemById(id);
              if (!it) return;
              var x = cx - 30 + j * 30;
              var icon = ArtService.attachIconSprite(_this2.chainStrip, (_it$artKey2 = it.artKey) != null ? _it$artKey2 : '', x, 0, 26);
              if (!icon) makeLabel("chain-" + i + "-" + j, _this2.chainStrip, (_it$glyph2 = it.glyph) != null ? _it$glyph2 : '?', 17, x, 0, COLOR.text);
              if (it.unlocksDishId) {
                var unlocked = _this2.data.dishUnlocked(it.unlocksDishId);
                roundRect("chain-ring-" + i, _this2.chainStrip, 32, 32, x, 0, 8, new Color(0, 0, 0, 0), unlocked ? COLOR.green : COLOR.subtext);
              } else if (j < ids.length - 1) {
                makeLabel("chain-arrow-" + i + "-" + j, _this2.chainStrip, '→', 11, x + 15, 0, COLOR.subtext);
              }
            });
          });
        };
        _proto.renderGrid = function renderGrid() {
          for (var i = 0; i < CELLS; i++) this.renderCell(i);
        };
        _proto.renderCell = function renderCell(i) {
          var content = this.contents[i];
          if (!content) return;
          content.removeAllChildren();
          var id = this.itemIds[i];
          if (id) {
            var it = mergeItemById(id);
            if (it) {
              var drew = it.artKey ? ArtService.makeSprite(content, it.artKey, 58, 58, 0, 0, 'mi') !== null : false;
              if (!drew && it.glyph) makeLabel('mi', content, it.glyph, 32, 0, 0, COLOR.text);
            }
          }
          if (i === this.selected) {
            roundRect('sel', content, CELL_W - 4, CELL_H - 4, 0, 0, 10, new Color(0, 0, 0, 0), COLOR.primary);
          }
          // 最高阶成品：橙框 + 💰 角标，提示可出售
          if (id && this.isFinal(id)) {
            roundRect("fin-ring-" + i, content, CELL_W - 8, CELL_H - 8, 0, 0, 8, new Color(0, 0, 0, 0), COLOR.accent);
            makeLabel("fin-tag-" + i, content, '💰', 13, CELL_W / 2 - 16, -CELL_H / 2 + 13, COLOR.accent);
          }
        }

        /** 花金币买一个基础素材放入第一个空格；金币不足或格子已满时不扣钱 */;
        _proto.buy = function buy(baseId) {
          var offer = BASE_OFFERS.find(function (o) {
            return o.id === baseId;
          });
          if (!offer) return;
          var idx = this.itemIds.findIndex(function (id) {
            return id === null;
          });
          if (idx === -1) {
            this.toast('格子已满，先合成腾出空格', COLOR.subtext);
            return;
          }
          if (!this.data.spend(offer.cost)) {
            this.toast('金币不足，先招待几位客人吧', COLOR.red);
            return;
          }
          this.itemIds[idx] = baseId;
          this.persist();
          this.renderGrid();
        }

        /** 免费生成器：30 秒冷却，随机产出一种基础素材（金币购买是即时加速项） */;
        _proto.gen = function gen() {
          var now = Date.now();
          if (now < this.genCdEnd) {
            this.toast("\u751F\u6210\u5668\u51B7\u5374\u4E2D " + Math.ceil((this.genCdEnd - now) / 1000) + "s", COLOR.subtext);
            return;
          }
          var idx = this.itemIds.findIndex(function (id) {
            return id === null;
          });
          if (idx === -1) {
            this.toast('格子已满，先合成腾出空格', COLOR.subtext);
            return;
          }
          var baseId = MERGE_BASE_IDS[Math.floor(Math.random() * MERGE_BASE_IDS.length)];
          this.itemIds[idx] = baseId;
          this.genCdEnd = now + 30000;
          this.persist();
          this.renderGrid();
        };
        _proto.toast = function toast(text, color) {
          var lab = makeLabel('merge-toast', this.root, text, 15, 0, -80, color);
          lab.isBold = true;
          tween(lab.node).delay(1.2).call(function () {
            return lab.node.destroy();
          }).start();
        };
        _proto.isFinal = function isFinal(id) {
          return !!id && mergeNext(id) === null;
        };
        _proto.sellValue = function sellValue(id) {
          var _mergeItemById$sell, _mergeItemById2;
          return (_mergeItemById$sell = (_mergeItemById2 = mergeItemById(id)) == null ? void 0 : _mergeItemById2.sell) != null ? _mergeItemById$sell : 0;
        };
        _proto.onCellTap = function onCellTap(i) {
          var id = this.itemIds[i];
          if (this.selected === -1) {
            if (id) {
              this.selected = i;
              // 最高阶成品不能再合成：提示并进入出售流程（再点一次卖出）
              if (this.isFinal(id)) {
                this.toast("\u5DF2\u7814\u53D1\u5B8C\u6210 \xB7 \u518D\u70B9\u4E00\u6B21\u51FA\u552E +" + this.sellValue(id) + "\uD83E\uDE99", COLOR.accent);
              }
            }
          } else if (this.selected === i) {
            if (this.isFinal(id)) {
              var v = this.sellValue(id);
              this.data.coins += v;
              this.itemIds[i] = null;
              this.selected = -1;
              this.toast("\u6210\u54C1\u552E\u51FA +" + v + "\uD83E\uDE99", COLOR.accent);
            } else {
              this.selected = -1;
            }
          } else {
            var selId = this.itemIds[this.selected];
            if (id && selId && id === selId && !this.isFinal(id)) {
              var next = mergeNext(id);
              if (next) {
                this.itemIds[i] = next;
                this.itemIds[this.selected] = null;
                this.selected = -1;
                this.maybeUnlock(next);
              } else {
                this.selected = -1;
              }
            } else {
              this.selected = id ? i : -1;
            }
          }
          this.persist();
          this.renderGrid();
        };
        _proto.maybeUnlock = function maybeUnlock(id) {
          var it = mergeItemById(id);
          if (it && it.unlocksDishId && !this.data.dishUnlocked(it.unlocksDishId)) {
            var _this$onUnlock;
            this.data.mergeUnlockDish(it.unlocksDishId);
            this.renderChains();
            // 解锁即"新菜研发成功"：收起合成台，播放店里人的剧情反应
            var _dishId = it.unlocksDishId;
            this.close();
            (_this$onUnlock = this.onUnlock) == null || _this$onUnlock.call(this, _dishId);
          }
        };
        _proto.persist = function persist() {
          this.data.mergeGrid = [].concat(this.itemIds);
          this.save();
        };
        _proto.close = function close() {
          this.persist();
          this.root.active = false;
        };
        return MergeView;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/platform.ts", ['cc', './storage.ts'], function (exports) {
  var cclegacy, BrowserKVStore;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      BrowserKVStore = module.BrowserKVStore;
    }],
    execute: function () {
      exports({
        createAdStrategy: createAdStrategy,
        createKVStore: createKVStore,
        currentPlatform: currentPlatform
      });
      cclegacy._RF.push({}, "9fd12KcU1NJ7b+ZG+BmYdZD", "platform", undefined);
      // 微信小游戏全局对象（仅在微信环境存在，浏览器预览中为 undefined）
      var wxAny = function wxAny() {
        return globalThis.wx;
      };
      function currentPlatform() {
        var wx = wxAny();
        return wx && typeof wx.getStorageSync === 'function' ? 'wechat' : 'browser';
      }
      function createKVStore() {
        if (currentPlatform() === 'wechat') {
          return {
            getItem: function getItem(key) {
              try {
                return wxAny().getStorageSync(key) || null;
              } catch (_unused) {
                return null;
              }
            },
            setItem: function setItem(key, value) {
              try {
                wxAny().setStorageSync(key, value);
              } catch (_unused2) {/* 存储异常静默降级 */}
            }
          };
        }
        return new BrowserKVStore();
      }
      var SimulatedAdStrategy = exports('SimulatedAdStrategy', /*#__PURE__*/function () {
        function SimulatedAdStrategy() {
          this["native"] = false;
        }
        var _proto = SimulatedAdStrategy.prototype;
        /** 浏览器预览：倒计时面板由 AdView 驱动，这里只负责立即回调解锁 */
        _proto.play = function play(_sec, onDone) {
          onDone(true);
        };
        return SimulatedAdStrategy;
      }());
      var WECHAT_AD_UNIT_ID = ''; // TODO: 上线时填入微信激励视频广告位 ID

      var WeChatAdStrategy = exports('WeChatAdStrategy', /*#__PURE__*/function () {
        function WeChatAdStrategy() {
          this["native"] = true;
          this.ad = null;
        }
        var _proto2 = WeChatAdStrategy.prototype;
        _proto2.play = function play(_sec, onDone) {
          var _this = this;
          var wx = wxAny();
          if (!this.ad) this.ad = wx.createRewardedVideoAd({
            adUnitId: WECHAT_AD_UNIT_ID
          });
          var onClose = function onClose(res) {
            _this.ad.offClose(onClose);
            onDone(!!(res && res.isEnded));
          };
          this.ad.onClose(onClose);
          this.ad.show()["catch"](function () {
            // 首次拉取失败：重载一次再试；仍失败按未完成处理，不发放奖励
            _this.ad.load().then(function () {
              return _this.ad.show();
            })["catch"](function () {
              return onDone(false);
            });
          });
        };
        return WeChatAdStrategy;
      }());
      var adStrategy = null;
      function createAdStrategy() {
        if (!adStrategy) {
          adStrategy = currentPlatform() === 'wechat' ? new WeChatAdStrategy() : new SimulatedAdStrategy();
        }
        return adStrategy;
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/RecipeCard.ts", ['cc', './merge.ts', './Widgets.ts', './ArtView.ts'], function (exports) {
  var cclegacy, Color, Node, chainFor, mergeItemById, makeNode, makeRect, roundRect, COLOR, makeLabel, ArtService;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      Color = module.Color;
      Node = module.Node;
    }, function (module) {
      chainFor = module.chainFor;
      mergeItemById = module.mergeItemById;
    }, function (module) {
      makeNode = module.makeNode;
      makeRect = module.makeRect;
      roundRect = module.roundRect;
      COLOR = module.COLOR;
      makeLabel = module.makeLabel;
    }, function (module) {
      ArtService = module.ArtService;
    }],
    execute: function () {
      cclegacy._RF.push({}, "5191fLjq4FO/ZQ623z3otju", "RecipeCard", undefined);

      /**
       * 菜品研发链路卡：点顾客订单弹出，展示 基础素材 → 中间成品 → 最终菜 的完整链路，
       * 以及在合成台的研发成本。借鉴《浪漫餐厅》"点订单查看合成线"的设计。
       */
      var RecipeCard = exports('RecipeCard', /*#__PURE__*/function () {
        function RecipeCard() {}
        RecipeCard.show = function show(parent, dish, data) {
          RecipeCard.hide(parent);
          var root = makeNode('recipe-card', parent, 960, 640, 0, 0);
          makeRect('rc-shade', root, 960, 640, 0, 0, new Color(0, 0, 0, 150)).on(Node.EventType.TOUCH_END, function () {
            return RecipeCard.hide(parent);
          });
          var panel = roundRect('rc-panel', root, 500, 330, 0, 30, 18, COLOR.panel, COLOR.accent);
          var icon = ArtService.makeSprite(panel, dish.artKey, 56, 56, -190, 110);
          if (!icon) makeLabel('rc-icon', panel, dish.name.slice(0, 1), 28, -190, 110, COLOR.primary);
          makeLabel('rc-title', panel, dish.name + " \xB7 \u7814\u53D1\u94FE\u8DEF", 22, 40, 110, COLOR.text);
          makeLabel('rc-price', panel, "\u552E\u4EF7 " + dish.price + "\uD83E\uDE99/\u5355", 15, 40, 76, COLOR.accent);
          var chain = chainFor(dish.id);
          if (chain.length === 0) {
            makeLabel('rc-empty', panel, '这道菜暂无合成链，直接解锁即可', 14, 0, -10, COLOR.subtext);
            return;
          }
          var spacing = 130;
          var startX = -((chain.length - 1) * spacing) / 2;
          chain.forEach(function (it, j) {
            var _it$artKey, _it$glyph;
            var x = startX + j * spacing;
            var isFinal = j === chain.length - 1;
            var unlocked = it.unlocksDishId ? data.dishUnlocked(it.unlocksDishId) : false;
            if (isFinal) {
              roundRect("rc-ring-" + j, panel, 62, 62, x, 20, 10, new Color(0, 0, 0, 0), unlocked ? COLOR.green : COLOR.subtext);
            }
            var ic = ArtService.makeSprite(panel, (_it$artKey = it.artKey) != null ? _it$artKey : '', 48, 48, x, 20);
            if (!ic) makeLabel("rc-node-" + j, panel, (_it$glyph = it.glyph) != null ? _it$glyph : '?', 26, x, 20, COLOR.text);
            makeLabel("rc-name-" + j, panel, it.name, 13, x, -22, COLOR.text);
            if (isFinal) {
              makeLabel("rc-state-" + j, panel, unlocked ? '已上菜单' : '未解锁', 12, x, -44, unlocked ? COLOR.green : COLOR.subtext);
            } else {
              makeLabel("rc-arrow-" + j, panel, '→', 20, x + spacing / 2, 20, COLOR.subtext);
            }
          });
          var base = chain[0] ? mergeItemById(chain[0].id) : undefined;
          if (base != null && base.cost) {
            makeLabel('rc-cost', panel, "\u5408\u6210\u53F0\u914D\u65B9\uFF1A2 \xD7 " + base.name + " = " + base.cost * 2 + "\uD83E\uDE99", 14, 0, -95, COLOR.text);
          }
          makeLabel('rc-tip', panel, '点击空白处关闭', 12, 0, -130, COLOR.subtext);
        };
        RecipeCard.hide = function hide(parent) {
          var _parent$getChildByNam;
          (_parent$getChildByNam = parent.getChildByName('recipe-card')) == null || _parent$getChildByNam.destroy();
        };
        return RecipeCard;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/satisfaction.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports({
        paidAmount: paidAmount,
        payRatio: payRatio,
        satisfactionAfterWaiting: satisfactionAfterWaiting
      });
      cclegacy._RF.push({}, "16584LptgFDbqP19E6md4xo", "satisfaction", undefined);
      var MAX_SATISFACTION = exports('MAX_SATISFACTION', 100);
      var DEFAULT_MAX_WAIT = exports('DEFAULT_MAX_WAIT', 30); // 秒

      function satisfactionAfterWaiting(start, waited, maxWait) {
        if (maxWait === void 0) {
          maxWait = DEFAULT_MAX_WAIT;
        }
        var next = start - start / maxWait * waited;
        return Math.max(0, Math.min(start, Math.round(next)));
      }
      function payRatio(satisfaction) {
        return Math.max(0, Math.min(1, satisfaction / MAX_SATISFACTION));
      }
      function paidAmount(price, satisfaction) {
        return Math.round(price * payRatio(satisfaction));
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Sfx.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _createClass, cclegacy;
  return {
    setters: [function (module) {
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "8d417q7MpRE5ZAbxR1bUi0M", "Sfx", undefined);
      // 轻量音效：用浏览器 WebAudio 直接合成，无需任何音频资源文件。
      // 浏览器要求音频在用户手势后才能播放，首次点击（选菜/升级）即会触发，之后正常出声。
      var Sfx = exports('Sfx', /*#__PURE__*/function () {
        function Sfx() {}
        Sfx.blip = function blip(freq, dur, type, gain, delay) {
          if (type === void 0) {
            type = 'sine';
          }
          if (gain === void 0) {
            gain = 0.04;
          }
          if (delay === void 0) {
            delay = 0;
          }
          var ctx = this.c;
          if (!ctx) return;
          var t0 = ctx.currentTime + delay;
          var osc = ctx.createOscillator();
          var g = ctx.createGain();
          osc.type = type;
          osc.frequency.value = freq;
          g.gain.setValueAtTime(gain, t0);
          g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
          osc.connect(g);
          g.connect(ctx.destination);
          osc.start(t0);
          osc.stop(t0 + dur);
        };
        Sfx.cook = function cook() {
          this.blip(520, 0.12, 'sine');
        };
        Sfx.serve = function serve() {
          this.blip(700, 0.1, 'triangle');
        };
        Sfx.coin = function coin() {
          this.blip(880, 0.07, 'square', 0.05);
          this.blip(1320, 0.09, 'square', 0.05, 0.07);
        };
        Sfx.fail = function fail() {
          this.blip(180, 0.3, 'sawtooth', 0.05);
        };
        _createClass(Sfx, null, [{
          key: "c",
          get: function get() {
            if (typeof window === 'undefined') return null;
            var Ctor = window.AudioContext || window.webkitAudioContext;
            if (!Ctor) return null;
            if (!this.ctx) this.ctx = new Ctor();
            var ctx = this.ctx;
            if (ctx.state === 'suspended') ctx.resume();
            return ctx;
          }
        }]);
        return Sfx;
      }());
      Sfx.ctx = null;
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/skins.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports('skinById', skinById);
      cclegacy._RF.push({}, "b6ce1uLoMVJurlJxh1xODnn", "skins", undefined);
      var SKINS = exports('SKINS', [{
        id: 'classic',
        name: '暖柒初开',
        icon: '🍳',
        iconArtKey: 'skin-classic',
        cost: 0,
        bg: {
          r: 255,
          g: 248,
          b: 240
        },
        decor: [{
          emoji: '🪴',
          artKey: 'decor-classic-1',
          x: -120,
          y: 92
        }],
        bonus: {
          wait: 0,
          coin: 0,
          cook: 0
        }
      }, {
        id: 'garden',
        name: '小院清风',
        icon: '🌿',
        iconArtKey: 'skin-garden',
        cost: 200,
        bg: {
          r: 238,
          g: 248,
          b: 232
        },
        bonus: {
          wait: 2,
          coin: 0,
          cook: 0
        },
        decor: [{
          emoji: '🪴',
          artKey: 'decor-garden-1',
          x: -235,
          y: 84
        }, {
          emoji: '🌸',
          artKey: 'decor-garden-2',
          x: 10,
          y: 84
        }, {
          emoji: '🍃',
          artKey: 'decor-garden-3',
          x: -120,
          y: 98
        }]
      }, {
        id: 'retro',
        name: '复古档口',
        icon: '📻',
        iconArtKey: 'skin-retro',
        cost: 400,
        bg: {
          r: 252,
          g: 242,
          b: 228
        },
        bonus: {
          wait: 0,
          coin: 2,
          cook: 0
        },
        decor: [{
          emoji: '📻',
          artKey: 'decor-retro-1',
          x: -120,
          y: 98
        }, {
          emoji: '🍭',
          artKey: 'decor-retro-2',
          x: -235,
          y: 84
        }, {
          emoji: '🎞',
          artKey: 'decor-retro-3',
          x: 10,
          y: 84
        }]
      }, {
        id: 'ocean',
        name: '海边小馆',
        icon: '🐚',
        iconArtKey: 'skin-ocean',
        cost: 600,
        bg: {
          r: 230,
          g: 244,
          b: 250
        },
        bonus: {
          wait: 0,
          coin: 0,
          cook: 2
        },
        decor: [{
          emoji: '🐚',
          artKey: 'decor-ocean-1',
          x: -235,
          y: 84
        }, {
          emoji: '⛱',
          artKey: 'decor-ocean-2',
          x: 10,
          y: 84
        }, {
          emoji: '🌊',
          artKey: 'decor-ocean-3',
          x: -120,
          y: 98
        }]
      }, {
        id: 'festival',
        name: '节日暖光',
        icon: '🏮',
        iconArtKey: 'skin-festival',
        cost: 800,
        bg: {
          r: 252,
          g: 236,
          b: 242
        },
        bonus: {
          wait: 1,
          coin: 1,
          cook: 1
        },
        decor: [{
          emoji: '🏮',
          artKey: 'decor-festival-1',
          x: -235,
          y: 84
        }, {
          emoji: '🎏',
          artKey: 'decor-festival-2',
          x: 10,
          y: 84
        }, {
          emoji: '✨',
          artKey: 'decor-festival-3',
          x: -120,
          y: 98
        }]
      }]);
      function skinById(id) {
        var _SKINS$find;
        return (_SKINS$find = SKINS.find(function (s) {
          return s.id === id;
        })) != null ? _SKINS$find : SKINS[0];
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/SkinView.ts", ['cc', './skins.ts', './Widgets.ts', './ArtView.ts'], function (exports) {
  var cclegacy, Button, Color, Node, SKINS, roundRect, COLOR, makeLabel, makeRect, makeNode, ArtService;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      Button = module.Button;
      Color = module.Color;
      Node = module.Node;
    }, function (module) {
      SKINS = module.SKINS;
    }, function (module) {
      roundRect = module.roundRect;
      COLOR = module.COLOR;
      makeLabel = module.makeLabel;
      makeRect = module.makeRect;
      makeNode = module.makeNode;
    }, function (module) {
      ArtService = module.ArtService;
    }],
    execute: function () {
      cclegacy._RF.push({}, "8f9f1D7qd1E9abet53Rz6fC", "SkinView", undefined);
      var SkinView = exports('SkinView', /*#__PURE__*/function () {
        function SkinView(parent, onApply, onChange) {
          var _this = this;
          this.overlay = void 0;
          this.panel = void 0;
          this.list = void 0;
          this.isOpen = false;
          this.onApply = onApply;
          this.onChange = onChange;
          this.overlay = makeRect('skin-overlay', parent, 960, 640, 0, 0, new Color(0, 0, 0, 90));
          this.overlay.active = false;
          this.overlay.on(Node.EventType.TOUCH_START, function () {
            return _this.close();
          });
          this.panel = ArtService.panelWithArt('skin-panel', parent, 'panel-popup', 560, 420, 0, 0);
          this.panel.active = false;
          var skinTitleIcon = ArtService.attachIconSprite(this.panel, 'icon-brush', -86, 175, 28);
          makeLabel('skin-title', this.panel, (skinTitleIcon ? '' : '🎨 ') + "\u88C5\u4FEE\u5C0F\u5E97", 24, skinTitleIcon ? -12 : 0, 175, COLOR.text);
          this.list = makeNode('skin-list', this.panel, 500, 300, 0, -10);
          var close = makeRect('skin-close', this.panel, 40, 40, 260, 190, COLOR.panel);
          close.addComponent(Button);
          makeLabel('skin-x', close, '✕', 24, 0, 0, COLOR.subtext);
          close.on(Button.EventType.CLICK, function () {
            return _this.close();
          });
        }
        var _proto = SkinView.prototype;
        _proto.open = function open(data) {
          this.isOpen = true;
          this.overlay.active = true;
          this.panel.active = true;
          this.render(data);
        };
        _proto.render = function render(data) {
          var _this2 = this;
          this.list.removeAllChildren();
          SKINS.forEach(function (s, i) {
            var y = 120 - i * 64;
            var row = roundRect("skin-row-" + i, _this2.list, 480, 54, 0, y, 12, COLOR.panel, COLOR.border);
            row.addComponent(Button);
            var skinIcon = ArtService.attachIconSprite(row, s.iconArtKey, -200, 0, 40);
            if (!skinIcon) makeLabel("skin-ic-" + i, row, s.icon, 28, -200, 0, COLOR.text);
            makeLabel("skin-nm-" + i, row, s.name, 18, -150, 8, COLOR.text);
            // 装修加成说明
            var eff = [];
            if (s.bonus.wait) eff.push("\u987E\u5BA2\u8010\u5FC3 +" + s.bonus.wait * 10 + "%");
            if (s.bonus.coin) eff.push("\u6BCF\u5355\u6536\u5165 +" + s.bonus.coin * 10 + "%");
            if (s.bonus.cook) eff.push("\u70F9\u996A\u901F\u5EA6 +" + s.bonus.cook * 10 + "%");
            makeLabel("skin-eff-" + i, row, eff.length ? eff.join(' / ') : '基础装修', 11, -60, -16, COLOR.subtext);
            var owned = data.skinOwned(s.id);
            var active = data.activeSkinId === s.id;
            var right = makeLabel("skin-st-" + i, row, '', 16, 150, 0, COLOR.subtext);
            if (active) {
              right.string = '使用中';
              right.color = COLOR.green;
            } else if (owned) {
              right.string = '装备';
              right.color = COLOR.primary;
            } else {
              right.string = "\uD83D\uDCB0 " + s.cost;
              right.color = data.coins >= s.cost ? COLOR.accent : COLOR.subtext;
            }
            row.getComponent(Button).interactable = !active;
            row.on(Button.EventType.CLICK, function () {
              if (active) return;
              if (owned) {
                data.setSkin(s.id);
              } else {
                if (!data.unlockSkin(s.id)) return;
              }
              _this2.onApply();
              _this2.onChange();
              _this2.render(data);
            });
          });
        };
        _proto.close = function close() {
          this.isOpen = false;
          this.overlay.active = false;
          this.panel.active = false;
        };
        return SkinView;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/storage.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "c456dlpJT1Ml54tOvHJz4aU", "storage", undefined);
      var STORAGE_KEY = exports('STORAGE_KEY', 'romantic-restaurant-save');
      var BrowserKVStore = exports('BrowserKVStore', /*#__PURE__*/function () {
        function BrowserKVStore() {}
        var _proto = BrowserKVStore.prototype;
        _proto.getItem = function getItem(key) {
          if (typeof localStorage === 'undefined') return null;
          return localStorage.getItem(key);
        };
        _proto.setItem = function setItem(key, value) {
          if (typeof localStorage === 'undefined') return;
          localStorage.setItem(key, value);
        };
        return BrowserKVStore;
      }());
      var MemoryKVStore = exports('MemoryKVStore', /*#__PURE__*/function () {
        function MemoryKVStore() {
          this.map = new Map();
        }
        var _proto2 = MemoryKVStore.prototype;
        _proto2.getItem = function getItem(key) {
          var _this$map$get;
          return (_this$map$get = this.map.get(key)) != null ? _this$map$get : null;
        };
        _proto2.setItem = function setItem(key, value) {
          this.map.set(key, value);
        };
        return MemoryKVStore;
      }());
      var StorageService = exports('StorageService', /*#__PURE__*/function () {
        function StorageService(kv) {
          this.kv = kv;
        }
        var _proto3 = StorageService.prototype;
        _proto3.load = function load() {
          var raw = this.kv.getItem(STORAGE_KEY);
          if (!raw) return null;
          try {
            return JSON.parse(raw);
          } catch (_unused) {
            return null;
          }
        };
        _proto3.save = function save(data) {
          try {
            this.kv.setItem(STORAGE_KEY, JSON.stringify(data));
          } catch (_unused2) {
            // 存储满等异常：静默降级，不阻塞游玩（符合 spec §6.3）
          }
        };
        return StorageService;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/types.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "a2de2rDJmpFK575uxpPf4/P", "types", undefined);
      var CustomerState = exports('CustomerState', /*#__PURE__*/function (CustomerState) {
        CustomerState["ORDERING"] = "ORDERING";
        CustomerState["EATING"] = "EATING";
        CustomerState["LEAVING"] = "LEAVING";
        CustomerState["GONE"] = "GONE";
        return CustomerState;
      }({})); // 已移除
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/UpgradeView.ts", ['cc', './gameData.ts', './Widgets.ts', './ArtView.ts'], function (exports) {
  var cclegacy, Vec3, tween, Button, Color, Label, tableCountAtLevel, kitchenSlotCount, restyleCard, COLOR, makeRect, makeLabel, roundRect, pillButton, ArtService;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      Vec3 = module.Vec3;
      tween = module.tween;
      Button = module.Button;
      Color = module.Color;
      Label = module.Label;
    }, function (module) {
      tableCountAtLevel = module.tableCountAtLevel;
      kitchenSlotCount = module.kitchenSlotCount;
    }, function (module) {
      restyleCard = module.restyleCard;
      COLOR = module.COLOR;
      makeRect = module.makeRect;
      makeLabel = module.makeLabel;
      roundRect = module.roundRect;
      pillButton = module.pillButton;
    }, function (module) {
      ArtService = module.ArtService;
    }],
    execute: function () {
      cclegacy._RF.push({}, "3adee7fRh9H1Z16WK+WypaZ", "UpgradeView", undefined);
      var UpgradeView = exports('UpgradeView', /*#__PURE__*/function () {
        function UpgradeView(parent, cb) {
          var _this = this;
          this.overlay = void 0;
          this.panel = void 0;
          this.infoLabel = void 0;
          this.tableBtn = void 0;
          this.kitchenBtn = void 0;
          this.tableLabel = void 0;
          this.kitchenLabel = void 0;
          this.msgLabel = void 0;
          this.tableDiff = 0;
          this.kitchenDiff = 0;
          this.tableDisabled = true;
          this.kitchenDisabled = true;
          this.tableMaxed = false;
          this.kitchenMaxed = false;
          this.isOpen = false;
          this.parent = parent;
          this.cb = cb;
          this.overlay = makeRect('upgrade-overlay', parent, 960, 640, 0, 0, new Color(0, 0, 0, 90));
          this.overlay.active = false;
          this.panel = ArtService.panelWithArt('upgrade-panel', parent, 'panel-popup', 520, 320, 0, 0);
          this.panel.active = false;
          makeLabel('up-title', this.panel, '✨ 餐厅升级', 24, 0, 120, COLOR.text);
          this.infoLabel = makeLabel('info', this.panel, '', 16, 0, 78, COLOR.subtext);
          this.msgLabel = makeLabel('up-msg', this.panel, '', 15, 0, -75, COLOR.red);
          this.tableBtn = roundRect('tb', this.panel, 220, 80, -120, -20, 14, COLOR.panel, COLOR.border);
          this.tableBtn.addComponent(Button);
          if (!ArtService.attachIconSprite(this.tableBtn, 'icon-chair', -80, 0, 30)) makeLabel('tb-icon', this.tableBtn, '🪑', 28, -80, 0, COLOR.text);
          this.tableLabel = makeLabel('tb-info', this.tableBtn, '', 14, 10, 0, COLOR.text);
          this.tableBtn.on(Button.EventType.CLICK, function () {
            if (_this.tableDisabled) {
              _this.warnInsufficient(_this.tableDiff, _this.tableBtn, _this.tableMaxed);
              return;
            }
            _this.cb.onUpgradeTable();
          });
          this.kitchenBtn = roundRect('kb', this.panel, 220, 80, 120, -20, 14, COLOR.panel, COLOR.border);
          this.kitchenBtn.addComponent(Button);
          if (!ArtService.attachIconSprite(this.kitchenBtn, 'icon-kitchen', -80, 0, 30)) makeLabel('kb-icon', this.kitchenBtn, '⚡', 28, -80, 0, COLOR.text);
          this.kitchenLabel = makeLabel('kb-info', this.kitchenBtn, '', 14, 10, 0, COLOR.text);
          this.kitchenBtn.on(Button.EventType.CLICK, function () {
            if (_this.kitchenDisabled) {
              _this.warnInsufficient(_this.kitchenDiff, _this.kitchenBtn, _this.kitchenMaxed);
              return;
            }
            _this.cb.onUpgradeKitchen();
          });
          var entry = pillButton('skin-entry', this.panel, 440, 40, 0, -120, COLOR.accent, '🎨 装修小店', function () {
            return _this.cb.onSkins();
          });
          var brushIcon = ArtService.attachIconSprite(entry, 'icon-brush', -120, 0, 26);
          if (brushIcon) {
            var lbl = entry.getComponentInChildren(Label);
            if (lbl) lbl.string = '装修小店';
          }

          // 右上角 ✕ 关闭
          var closeBtn = makeRect('close-btn', this.panel, 40, 40, 230, 135, COLOR.panel);
          closeBtn.addComponent(Button);
          makeLabel('close-x', closeBtn, '✕', 24, 0, 0, COLOR.subtext);
          closeBtn.on(Button.EventType.CLICK, function () {
            return _this.close();
          });
        }
        var _proto = UpgradeView.prototype;
        _proto.open = function open() {
          this.isOpen = true;
          this.overlay.active = true;
          this.panel.active = true;
          this.panel.scale = new Vec3(0.9, 0.9, 1);
          tween(this.panel).to(0.12, {
            scale: new Vec3(1, 1, 1)
          }).start();
        };
        _proto.close = function close() {
          var _this2 = this;
          this.isOpen = false;
          tween(this.panel).to(0.1, {
            scale: new Vec3(0.9, 0.9, 1)
          }).call(function () {
            _this2.panel.active = false;
            _this2.overlay.active = false;
          }).start();
        };
        _proto.refresh = function refresh(d) {
          // 下一级奖励预告：让玩家升级前知道能得到什么（借鉴《浪漫餐厅》等级福利预览）
          var nextTables = d.tableMaxed ? d.tableLevel : d.tableLevel + 1;
          var nextSlots = d.kitchenMaxed ? d.kitchenLevel : d.kitchenLevel + 1;
          var preview = d.tableMaxed && d.kitchenMaxed ? '全部满级啦！' : "\u4E0B\u4E00\u7EA7\uFF1A" + tableCountAtLevel(nextTables) + " \u5F20\u684C \xB7 " + kitchenSlotCount(nextSlots) + " \u4E2A\u7076\u4F4D";
          this.infoLabel.string = "\u91D1\u5E01 " + d.coins + " \uFF5C " + preview;
          this.tableDiff = Math.max(0, d.tableCost - d.coins);
          this.kitchenDiff = Math.max(0, d.kitchenCost - d.coins);
          this.tableMaxed = d.tableMaxed;
          this.kitchenMaxed = d.kitchenMaxed;
          this.tableDisabled = d.tableMaxed || d.coins < d.tableCost;
          this.kitchenDisabled = d.kitchenMaxed || d.coins < d.kitchenCost;
          this.styleCard(this.tableBtn, this.tableLabel, d.tableMaxed ? '已满级' : "\u684C " + d.tableLevel + " \u2192 " + (d.tableLevel + 1) + "\n\u8D39\u7528 " + d.tableCost + " \uD83E\uDE99", this.tableDisabled);
          this.styleCard(this.kitchenBtn, this.kitchenLabel, d.kitchenMaxed ? '已满级' : "\u53A8\u623F L" + d.kitchenLevel + " \u2192 L" + (d.kitchenLevel + 1) + "\n\u8D39\u7528 " + d.kitchenCost + " \uD83E\uDE99", this.kitchenDisabled);
        };
        _proto.styleCard = function styleCard(btn, label, text, disabled) {
          label.string = text;
          // 按钮保持可点（点击时给出"金币不足"反馈），只做视觉置灰
          btn.getComponent(Button).interactable = true;
          if (disabled) {
            restyleCard(btn, new Color(156, 133, 104, 80), COLOR.border, 14);
          } else {
            restyleCard(btn, COLOR.panel, COLOR.accent, 14);
          }
        }

        /** 金币不足反馈：面板红字提示差额 + 目标按钮左右抖动 */;
        _proto.warnInsufficient = function warnInsufficient(diff, node, maxed) {
          var _this3 = this;
          this.msgLabel.string = maxed ? '已满级，无需升级' : "\u91D1\u5E01\u4E0D\u8DB3\uFF0C\u8FD8\u5DEE " + diff + "\uD83E\uDE99";
          this.msgLabel.color = maxed ? COLOR.subtext : COLOR.red;
          tween(this.msgLabel.node).delay(1.6).call(function () {
            _this3.msgLabel.string = '';
          }).start();
          var p = node.position;
          tween(node).to(0.05, {
            position: new Vec3(p.x + 8, p.y, 0)
          }).to(0.05, {
            position: new Vec3(p.x - 8, p.y, 0)
          }).to(0.05, {
            position: new Vec3(p.x + 4, p.y, 0)
          }).to(0.05, {
            position: new Vec3(p.x, p.y, 0)
          }).start();
        };
        return UpgradeView;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Widgets.ts", ['cc'], function (exports) {
  var cclegacy, Color, Node, Layers, UITransform, Graphics, Button, Label;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      Color = module.Color;
      Node = module.Node;
      Layers = module.Layers;
      UITransform = module.UITransform;
      Graphics = module.Graphics;
      Button = module.Button;
      Label = module.Label;
    }],
    execute: function () {
      exports({
        lerpColor: lerpColor,
        makeButton: makeButton,
        makeLabel: makeLabel,
        makeNode: makeNode,
        makeRect: makeRect,
        panelWithShadow: panelWithShadow,
        pillButton: pillButton,
        restyleCard: restyleCard,
        roundRect: roundRect
      });
      cclegacy._RF.push({}, "9868djPF/JN5pZ5FGR1ny48", "Widgets", undefined);
      var COLOR = exports('COLOR', {
        bg: new Color(247, 232, 215, 255),
        // #F7E8D7 奶油米色
        decor: new Color(232, 211, 188, 255),
        // #E8D3BC 地面/装饰
        panel: new Color(255, 247, 238, 255),
        // #FFF7EE 奶油白
        border: new Color(227, 205, 180, 255),
        // #E3CDB4 浅木描边
        primary: new Color(255, 138, 92, 255),
        // #FF8A5C 暖橙
        accent: new Color(255, 201, 77, 255),
        // #FFC94D 蜂蜜黄
        green: new Color(126, 217, 167, 255),
        // #7ED9A7 薄荷绿
        red: new Color(232, 106, 94, 255),
        // #E86A5E 警示红
        text: new Color(90, 70, 50, 255),
        // #5A4632 深棕
        subtext: new Color(156, 133, 104, 255),
        // #9C8568 浅棕
        white: new Color(255, 255, 255, 255),
        shadow: new Color(90, 70, 50, 38) // 投影半透明
      });

      function makeNode(name, parent, w, h, x, y) {
        var n = new Node(name);
        n.layer = Layers.Enum.UI_2D;
        var t = n.addComponent(UITransform);
        t.setContentSize(w, h);
        n.setPosition(x, y);
        parent.addChild(n);
        return n;
      }
      function makeRect(name, parent, w, h, x, y, color) {
        var n = makeNode(name, parent, w, h, x, y);
        var g = n.addComponent(Graphics);
        g.fillColor = color;
        g.rect(-w / 2, -h / 2, w, h);
        g.fill();
        return n;
      }
      function roundRect(name, parent, w, h, x, y, radius, fill, stroke) {
        var n = makeNode(name, parent, w, h, x, y);
        var g = n.addComponent(Graphics);
        var r = Math.max(0, Math.min(radius, Math.min(w, h) / 2));
        g.fillColor = fill;
        g.roundRect(-w / 2, -h / 2, w, h, r);
        g.fill();
        if (stroke) {
          g.lineWidth = 2;
          g.strokeColor = stroke;
          g.stroke();
        }
        return n;
      }
      function panelWithShadow(name, parent, w, h, x, y, radius, fill, stroke) {
        makeRect(name + '-shadow', parent, w, h, x, y - 4, COLOR.shadow);
        return roundRect(name, parent, w, h, x, y, radius, fill, stroke);
      }
      function pillButton(name, parent, w, h, x, y, bg, text, onClick) {
        var n = roundRect(name, parent, w, h, x, y, h / 2, bg);
        n.addComponent(Button);
        makeLabel('btn-text', n, text, 18, 0, 0, COLOR.white);
        n.on(Button.EventType.CLICK, onClick);
        return n;
      }
      function makeLabel(name, parent, text, fontSize, x, y, color) {
        var n = makeNode(name, parent, 200, 40, x, y);
        var l = n.addComponent(Label);
        l.string = text;
        l.fontSize = fontSize;
        l.lineHeight = fontSize + 4;
        l.color = color != null ? color : COLOR.text;
        return l;
      }
      function makeButton(name, parent, w, h, x, y, bg, text, onClick) {
        var n = roundRect(name, parent, w, h, x, y, 10, bg);
        n.addComponent(Button);
        makeLabel('btn-text', n, text, 18, 0, 0, COLOR.white);
        n.on(Button.EventType.CLICK, onClick);
        return n;
      }
      function restyleCard(node, fill, stroke, radius) {
        var t = node.getComponent(UITransform);
        var w = t.contentSize.width;
        var h = t.contentSize.height;
        var g = node.getComponent(Graphics);
        g.clear();
        g.fillColor = fill;
        g.roundRect(-w / 2, -h / 2, w, h, radius);
        g.fill();
        g.lineWidth = 2;
        g.strokeColor = stroke;
        g.stroke();
      }
      function lerpColor(a, b, t, out) {
        var k = Math.max(0, Math.min(1, t));
        var result = out != null ? out : new Color();
        result.r = Math.round(a.r + (b.r - a.r) * k);
        result.g = Math.round(a.g + (b.g - a.g) * k);
        result.b = Math.round(a.b + (b.b - a.b) * k);
        result.a = Math.round(a.a + (b.a - a.a) * k);
        return result;
      }
      cclegacy._RF.pop();
    }
  };
});

(function(r) {
  r('virtual:///prerequisite-imports/main', 'chunks:///_virtual/main'); 
})(function(mid, cid) {
    System.register(mid, [cid], function (_export, _context) {
    return {
        setters: [function(_m) {
            var _exportObj = {};

            for (var _key in _m) {
              if (_key !== "default" && _key !== "__esModule") _exportObj[_key] = _m[_key];
            }
      
            _export(_exportObj);
        }],
        execute: function () { }
    };
    });
});