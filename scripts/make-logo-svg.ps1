Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"
$root = (Get-Location).Path
$svg  = Get-Content (Join-Path $root "var-logo-scoreboard-white-transparent.svg") -Raw

# ---- Parse all <circle cx cy r> from the SVG ----
$dots = [regex]::Matches($svg, 'cx="([\d.]+)"\s+cy="([\d.]+)"\s+r="([\d.]+)"') | ForEach-Object {
  [pscustomobject]@{ x=[double]$_.Groups[1].Value; y=[double]$_.Groups[2].Value; r=[double]$_.Groups[3].Value }
}
Write-Output "parsed $($dots.Count) dots"

$vbW = 248.0; $vbH = 130.0   # viewBox

function New-Icon($size, $out){
  $ico = New-Object System.Drawing.Bitmap($size,$size)
  $g = [System.Drawing.Graphics]::FromImage($ico)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.Clear([System.Drawing.Color]::Transparent)

  # blue rounded square
  $rad = [int]($size*0.22); $dd = $rad*2
  $gp = New-Object System.Drawing.Drawing2D.GraphicsPath
  $gp.AddArc(0,0,$dd,$dd,180,90)
  $gp.AddArc($size-$dd,0,$dd,$dd,270,90)
  $gp.AddArc($size-$dd,$size-$dd,$dd,$dd,0,90)
  $gp.AddArc(0,$size-$dd,$dd,$dd,90,90)
  $gp.CloseFigure()
  $g.FillPath((New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255,59,130,246))), $gp)

  # fit the viewBox centered at ~76% width
  $targetW = $size*0.76
  $scale = $targetW/$vbW
  $offX = ($size - $vbW*$scale)/2
  $offY = ($size - $vbH*$scale)/2
  $white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  foreach($d in $dots){
    $cx = $offX + $d.x*$scale
    $cy = $offY + $d.y*$scale
    $rr = $d.r*$scale
    $g.FillEllipse($white, [float]($cx-$rr), [float]($cy-$rr), [float]($rr*2), [float]($rr*2))
  }
  $g.Dispose()
  $ico.Save($out, [System.Drawing.Imaging.ImageFormat]::Png); $ico.Dispose()
  Write-Output "saved $out"
}

New-Icon 512 (Join-Path $root "app\icon.png")
New-Icon 180 (Join-Path $root "app\apple-icon.png")