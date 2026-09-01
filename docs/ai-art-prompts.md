# AI 出图提示词（重出/替换程序占位素材）

本项目的正式美术为暖色水彩风格（参考 `assets/resources/art/dish-*.png`、`char-*.png`）。
以下键值对应的图目前是程序占位，重出后**同名覆盖** `assets/resources/art/<key>.png` 即可，
代码按路径 `art/<key>` 加载，无需改动。

## 出图流程（从生成到入库 6 步）

0. **批量出图脚本（推荐，历史图片均由此产出）**：剪映生图链路（生图 + 自动抠图），
   脚本在 **`D:\ai-media-agent\backend\tools\gen_restaurant_art.py`**
   （临时工具，不在本仓库内；生图/抠图 HTTP 封装在同仓库
   `backend/core/jianying_gen.py`）。脚本内 `ITEMS` 已含本项目全部 key 及
   完整中文提示词（含小柒表情帧 `char-xiaoqi-idle/say/happy`），生成后自动
   裁剪到目标尺寸并直接写入本项目 `assets/resources/art/`。
   用法（Git Bash，从 `D:\ai-media-agent` 运行，需先清代理）：

   ```bash
   cd /d/ai-media-agent
   unset HTTP_PROXY HTTPS_PROXY ALL_PROXY http_proxy https_proxy all_proxy
   C:/Python314/python.exe backend/tools/gen_restaurant_art.py --list p0                  # P0 全部
   C:/Python314/python.exe backend/tools/gen_restaurant_art.py --list full               # 全量
   C:/Python314/python.exe backend/tools/gen_restaurant_art.py --keys char-xiaoqi-happy  # 单独重出某张
   C:/Python314/python.exe backend/tools/gen_restaurant_art.py --keys xxx --skip-existing
   ```

   注意：剪映接口不支持固定 seed，同一 key 重出结果会有差异；人物类 key
   （char-xiaoqi 及三张表情帧）共用同一形象描述词，单帧不满意可单独重出覆盖；
   需要剪映登录 cookie（脚本经 `core/jianying_http.load_cookie` 读取，此前跑通即已配置）。
   出完记得对 >50KB 的图执行第 5 步压缩。

1. **生成**：任选支持透明背景的 AI 出图工具（即梦、Recraft、Firefly 等；
   不支持透明的先出纯白/纯灰底，再用 remove.bg / Photoshop「删除背景」抠成透明）。
   提示词 = 本文各条目提示词，前拼「统一风格前缀」；尺寸按下方规格表（出图尺寸 = 显示尺寸 ×2）。
2. **透明化**：面板（panel-*）和所有小图交稿必须是真透明 PNG。
   AI 生成的"透明背景"常是烙进像素的假棋盘格——肉眼在深色底上看一眼即可辨别；
   白底抠图时注意别把图内浅色区域（奶油色面板内部）误抠。
3. **入库**：按 key 命名覆盖 `assets/resources/art/<key>.png`
   （全量 key 清单见根目录 `ART-MANIFEST.md`；背景图对应 `bg.jpg`，JPG 无需透明）。
4. **面板验证**：跑 `python tools/fix_panel_alpha.py <panel 文件>`，
   输出「四角不透明=False」即合格（该脚本同时能清掉轻度棋盘格残留）。
5. **压缩**：对超过 50KB 的新 PNG 跑 `python tools/compress_art.py <文件或目录>`
   （256 色量化 + 抖动，有损；只对新图跑一次，勿重复执行）。
6. **编辑器验证**：打开 Cocos Creator 等资源重新导入（新文件会自动生成 .meta），
   预览确认：面板 9-slice 拉伸不变形、背景无穿帮、合成板图标风格统一。

## 统一风格前缀（拼在各条提示词前）

> 水彩手绘风格，暖色调（奶油米色、蜜橙、暖棕），柔软边缘，白纸质感，
> 简洁可爱的小游戏素材，单件主体居中，纯透明背景，无文字。

英文版：

> Warm watercolor illustration, soft edges, cream / honey-orange / warm-brown palette,
> cute casual-game asset, single object centered, plain transparent background, no text.

## 背景留白版（bg，1920×1280，JPG 即可）

> 水彩风格温馨小餐馆室内，俯视视角：米色墙面、左侧木门、墙上花卉挂画、
> 右侧厨房吧台与橱柜、绿植点缀；**地面中央大片空旷留白**（留给玩法桌椅），
> 不要画任何餐桌椅。暖色、柔和光影。

## 面板（panel-menu，1840×220，透明背景 PNG）

> 横向木质托盘 / 菜单板，全圆角胶囊形长条，暖棕色木纹，
> 真透明背景（边缘以外 alpha=0，不要棋盘格），四边留 20px 透明边距。

注意：所有 panel-* 出图必须真透明背景；收货时用
`python tools/fix_panel_alpha.py`（或检查四角 alpha=0）验证。

## 合成链中间项（ing-*，192×192，透明背景 PNG）

| key | 名称 | 提示词（接统一前缀） |
|-----|------|----------------------|
| ing-veg | 蔬菜 | 一颗新鲜生菜/卷心菜，翠绿色菜叶层层包裹 |
| ing-salad | 沙拉 | 陶土色碗里装满蔬菜沙拉，露出番茄和绿叶 |
| ing-meat | 生肉 | 一块带白色脂肪边的鲜红生牛排 |
| ing-stew | 炖肉 | 陶土炖锅盛着浓稠炖肉，锅两侧有把手 |
| ing-dough | 面团 | 一团光滑的生面团，表面撒少许面粉 |
| ing-cake | 蛋糕胚 | 两层圆形海绵蛋糕胚夹一层奶油，无装饰 |
| ing-cheese | 奶酪 | 一块带圆孔的黄色奶酪三角楔 |
| ing-pasta-dough | 面坯 | 一张扁平的圆形意面生面坯，撒粗粒小麦粉 |

## 规格速查

| 类别 | 出图尺寸 | 格式 |
|------|----------|------|
| bg | 1920×1280 | JPG（质量 85-90，无透明需求） |
| panel-* | 显示尺寸 ×2，PNG 透明 | PNG（真透明，第 4 步验证后压缩） |
| dish / ing-* | 192×192 | PNG 透明，256 色量化 |
| cust-* / char-* | 320×440 / 300×300 | PNG 透明，256 色量化 |

## 替换后自检清单

- [ ] 文件名与 key 完全一致，放对目录（全量清单见 `ART-MANIFEST.md`）
- [ ] 面板四角 alpha=0（`fix_panel_alpha.py` 输出 False）
- [ ] PNG 已量化压缩（`compress_art.py`），单张 ≤ 200KB（bg ≤ 500KB）
- [ ] Cocos Creator 重新导入后预览无穿帮、风格与现有水彩图统一
