Add-Type -AssemblyName System.Drawing

$csharpSource = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;

public class PropTransparency
{
    public static void RemoveBackground(string srcPath, string destPath, int tolerance)
    {
        using (Bitmap src = new Bitmap(srcPath))
        {
            int w = src.Width;
            int h = src.Height;
            using (Bitmap dest = new Bitmap(w, h, PixelFormat.Format32bppArgb))
            {
                Rectangle rect = new Rectangle(0, 0, w, h);
                BitmapData srcData = src.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
                BitmapData destData = dest.LockBits(rect, ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
                
                int stride = srcData.Stride;
                int bytes = Math.Abs(stride) * h;
                byte[] srcPixels = new byte[bytes];
                byte[] destPixels = new byte[bytes];
                
                System.Runtime.InteropServices.Marshal.Copy(srcData.Scan0, srcPixels, 0, bytes);
                
                bool[] visited = new bool[w * h];
                Queue<int> queue = new Queue<int>();
                
                Func<int, int, bool> isWhite = (x, y) => {
                    int idx = y * stride + x * 4;
                    byte b = srcPixels[idx];
                    byte g = srcPixels[idx + 1];
                    byte r = srcPixels[idx + 2];
                    return r >= (255 - tolerance) && g >= (255 - tolerance) && b >= (255 - tolerance);
                };
                
                // Seed from all 4 borders
                for (int x = 0; x < w; x++) {
                    if (isWhite(x, 0)) { int p = 0 * w + x; if (!visited[p]) { visited[p] = true; queue.Enqueue(p); } }
                    if (isWhite(x, h - 1)) { int p = (h - 1) * w + x; if (!visited[p]) { visited[p] = true; queue.Enqueue(p); } }
                }
                for (int y = 0; y < h; y++) {
                    if (isWhite(0, y)) { int p = y * w + 0; if (!visited[p]) { visited[p] = true; queue.Enqueue(p); } }
                    if (isWhite(w - 1, y)) { int p = y * w + (w - 1); if (!visited[p]) { visited[p] = true; queue.Enqueue(p); } }
                }
                
                int[] dx = { -1, 1, 0, 0 };
                int[] dy = { 0, 0, -1, 1 };
                while (queue.Count > 0) {
                    int curr = queue.Dequeue();
                    int cx = curr % w;
                    int cy = curr / w;
                    for (int i = 0; i < 4; i++) {
                        int nx = cx + dx[i];
                        int ny = cy + dy[i];
                        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                            int nIdx = ny * w + nx;
                            if (!visited[nIdx] && isWhite(nx, ny)) {
                                visited[nIdx] = true;
                                queue.Enqueue(nIdx);
                            }
                        }
                    }
                }
                
                // Copy to dest setting visited border background to transparent
                for (int y = 0; y < h; y++) {
                    for (int x = 0; x < w; x++) {
                        int idx = y * stride + x * 4;
                        int p = y * w + x;
                        if (visited[p]) {
                            destPixels[idx] = 0;
                            destPixels[idx + 1] = 0;
                            destPixels[idx + 2] = 0;
                            destPixels[idx + 3] = 0;
                        } else {
                            destPixels[idx] = srcPixels[idx];
                            destPixels[idx + 1] = srcPixels[idx + 1];
                            destPixels[idx + 2] = srcPixels[idx + 2];
                            destPixels[idx + 3] = 255;
                        }
                    }
                }
                
                System.Runtime.InteropServices.Marshal.Copy(destPixels, 0, destData.Scan0, bytes);
                src.UnlockBits(srcData);
                dest.UnlockBits(destData);
                dest.Save(destPath, ImageFormat.Png);
            }
        }
    }
}
"@

Add-Type -TypeDefinition $csharpSource -ReferencedAssemblies "System.Drawing.dll"

$srcDir = "c:\Users\tatar\OneDrive\เดสก์ท็อป\AAA\asset(props)\พัทยา"
$outDir = "c:\Users\tatar\OneDrive\เดสก์ท็อป\AAA\public\images\ch7-pattaya\props"

if (!(Test-Path $outDir)) {
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null
}

$mappings = @{
    "news (1).png" = "sunset-sea.png"
    "news (2).png" = "direction-sign.png"
    "news (3).png" = "pattaya-skyline.png"
    "news (4).png" = "palm-sign.png"
    "news (5).png" = "beach-oasis.png"
    "news (6).png" = "fireworks-sky.png"
    "new (1).png"  = "sand-starfish-right.png"
}

foreach ($src in $mappings.Keys) {
    $srcPath = Join-Path $srcDir $src
    $destPath = Join-Path $outDir $mappings[$src]
    if (Test-Path $srcPath) {
        [PropTransparency]::RemoveBackground($srcPath, $destPath, 10)
        Write-Host "Processed transparent $src -> $($mappings[$src])"
    } else {
        Write-Warning "Source file not found: $srcPath"
    }
}

Write-Host "All Chapter 7 props successfully deployed with transparent alpha!"
