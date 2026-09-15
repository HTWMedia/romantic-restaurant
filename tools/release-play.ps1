# 一键发布在线试玩：Cocos 构建 Web 版 → 拷贝到 docs/play → 提交推送
# 用法：在本机 PowerShell 运行  powershell -File tools/release-play.ps1 [-CommitMsg "文案"]
# 注意：构建期间请先关闭 Cocos Creator 编辑器（避免项目占用）；CLI 进程构建完成后可能不自动退出，属正常现象。
param(
  [string]$CommitMsg = "chore: 更新在线试玩构建 [skip ci]",
  [string]$CocosExe = "D:\CocoEditor\Creator\3.8.8\CocosCreator.exe"
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host '▶ 构建 Web 版（最长等待 10 分钟）...'
$p = Start-Process -FilePath $CocosExe `
  -ArgumentList '--project', $root, '--build', 'platform=web-desktop;debug=true' -PassThru
$out = Join-Path $root 'build\web-desktop'
$last = -1; $stable = 0
for ($i = 0; $i -lt 60; $i++) {
  Start-Sleep -Seconds 10
  if (-not (Test-Path "$out\index.html")) { continue }
  $size = (Get-ChildItem $out -Recurse | Measure-Object Length -Sum).Sum
  if ($size -eq $last) { $stable++ } else { $stable = 0; $last = $size }
  if ($stable -ge 2) { break }
}
if (-not (Test-Path "$out\index.html")) { throw '构建失败：未生成 index.html' }
Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
Write-Host "✓ 构建完成（$([math]::Round($last / 1MB, 1)) MB）"

Write-Host '▶ 发布到 docs/play...'
Remove-Item docs\play -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory docs\play | Out-Null
Copy-Item build\web-desktop\* docs\play\ -Recurse -Force
New-Item -ItemType File docs\play\.nojekyll | Out-Null

Write-Host '▶ 提交推送...'
git add docs/play
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
  git commit -m $CommitMsg
  git push
  Write-Host '✅ 已发布，稍等一分钟后刷新在线页面即可'
} else {
  Write-Host '构建产物无变化，跳过推送'
}
