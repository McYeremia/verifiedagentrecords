Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"
$root = (Get-Location).Path
$src  = Join-Path $root "VAR.png"   # red-dot variant

# ---- Load + read pixels (LockBits = fast) ----
$bmp = New-Object System.Drawing.Bitmap($src)
$w = $bmp.Width; $h = $bmp.Height
$rect = New-Object System.Drawing.Rectangle 0,0,$w,$h
$d = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$stride = $d.Stride
$bytes = New-Object byte[] ($stride*$h)
[System.Runtime.InteropServices.Marshal]::Copy($d.Scan0, $bytes, 0, $bytes.Length)
$bmp.UnlockBits($d)

# ---- Tight content bounding box (alpha > 20) ----
$minX=$w;$minY=$h;$maxX=0;$maxY=0
for($y=0;$y -lt $h;$y++){ $r=$y*$stride
  for($x=0;$x -lt $w;$x++){ if($bytes[$r+$x*4+3] -gt 20){
    if($x -lt $minX){$minX=$x}; if($x -gt $maxX){$maxX=$x}
    if($y -lt $minY){$minY=$y}; if($y -gt $maxY){$maxY=$y} } } }
$cw=$maxX-$minX+1; $ch=$maxY-$minY+1
Write-Output "content bbox: $minX,$minY -> $maxX,$maxY ($cw x $ch)"

# ---- Crop tight (+6% margin) -> public/logo.png ----
$m=[int]([Math]::Max($cw,$ch)*0.06)
$cx=[Math]::Max(0,$minX-$m); $cy=[Math]::Max(0,$minY-$m)
$cw2=[Math]::Min($w-$cx,$cw+2*$m); $ch2=[Math]::Min($h-$cy,$ch+2*$m)
$crop=New-Object System.Drawing.Bitmap($cw2,$ch2)
$g=[System.Drawing.Graphics]::FromImage($crop)
$g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($bmp,(New-Object System.Drawing.Rectangle 0,0,$cw2,$ch2),(New-Object System.Drawing.Rectangle $cx,$cy,$cw2,$ch2),[System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()
$crop.Save((Join-Path $root "public\logo.png"), [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "saved public/logo.png ($cw2 x $ch2)"

# ---- Square favicon icons: blue rounded square + centered logo ----
function New-Icon($size,$out){
  $ico=New-Object System.Drawing.Bitmap($size,$size)
  $gg=[System.Drawing.Graphics]::FromImage($ico)
  $gg.SmoothingMode=[System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $gg.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $gg.Clear([System.Drawing.Color]::Transparent)
  $rad=[int]($size*0.22); $dd=$rad*2
  $gp=New-Object System.Drawing.Drawing2D.GraphicsPath
  $gp.AddArc(0,0,$dd,$dd,180,90)
  $gp.AddArc($size-$dd,0,$dd,$dd,270,90)
  $gp.AddArc($size-$dd,$size-$dd,$dd,$dd,0,90)
  $gp.AddArc(0,$size-$dd,$dd,$dd,90,90)
  $gp.CloseFigure()
  $gg.FillPath((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255,59,130,246))),$gp)
  $target=[int]($size*0.66); $scale=$target/$cw2; $lh=[int]($ch2*$scale)
  $lx=[int](($size-$target)/2); $ly=[int](($size-$lh)/2)
  $gg.DrawImage($crop,(New-Object System.Drawing.Rectangle $lx,$ly,$target,$lh))
  $gg.Dispose()
  $ico.Save($out,[System.Drawing.Imaging.ImageFormat]::Png); $ico.Dispose()
  Write-Output "saved $out"
}
New-Icon 512 (Join-Path $root "app\icon.png")
New-Icon 180 (Join-Path $root "app\apple-icon.png")
$crop.Dispose(); $bmp.Dispose()