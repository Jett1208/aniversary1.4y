$csharp = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public class ImageDieCutterTheLake
{
    public static void ProcessImage(string inputPath, string outputPath, int threshold, bool floodFillOnly)
    {
        using (Bitmap src = new Bitmap(inputPath))
        {
            int w = src.Width;
            int h = src.Height;
            using (Bitmap dest = new Bitmap(w, h, PixelFormat.Format32bppArgb))
            {
                BitmapData srcData = src.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
                BitmapData destData = dest.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);

                int bytes = Math.Abs(srcData.Stride) * h;
                byte[] srcRgba = new byte[bytes];
                byte[] destRgba = new byte[bytes];

                Marshal.Copy(srcData.Scan0, srcRgba, 0, bytes);

                int stride = srcData.Stride;
                bool[,] isBg = new bool[w, h];

                if (floodFillOnly)
                {
                    Queue<Point> q = new Queue<Point>();
                    for (int x = 0; x < w; x++)
                    {
                        q.Enqueue(new Point(x, 0));
                        q.Enqueue(new Point(x, h - 1));
                    }
                    for (int y = 0; y < h; y++)
                    {
                        q.Enqueue(new Point(0, y));
                        q.Enqueue(new Point(w - 1, y));
                    }

                    while (q.Count > 0)
                    {
                        Point p = q.Dequeue();
                        int x = p.X;
                        int y = p.Y;

                        if (x < 0 || x >= w || y < 0 || y >= h) continue;
                        if (isBg[x, y]) continue;

                        int idx = y * stride + x * 4;
                        byte b = srcRgba[idx];
                        byte g = srcRgba[idx + 1];
                        byte r = srcRgba[idx + 2];

                        if (r >= threshold && g >= threshold && b >= threshold)
                        {
                            isBg[x, y] = true;
                            q.Enqueue(new Point(x + 1, y));
                            q.Enqueue(new Point(x - 1, y));
                            q.Enqueue(new Point(x, y + 1));
                            q.Enqueue(new Point(x, y - 1));
                        }
                    }
                }
                else
                {
                    for (int y = 0; y < h; y++)
                    {
                        for (int x = 0; x < w; x++)
                        {
                            int idx = y * stride + x * 4;
                            byte b = srcRgba[idx];
                            byte g = srcRgba[idx + 1];
                            byte r = srcRgba[idx + 2];
                            if (r >= threshold && g >= threshold && b >= threshold)
                            {
                                isBg[x, y] = true;
                            }
                        }
                    }
                }

                for (int y = 0; y < h; y++)
                {
                    for (int x = 0; x < w; x++)
                    {
                        int idx = y * stride + x * 4;
                        byte b = srcRgba[idx];
                        byte g = srcRgba[idx + 1];
                        byte r = srcRgba[idx + 2];

                        if (isBg[x, y])
                        {
                            destRgba[idx + 3] = 0;
                        }
                        else
                        {
                            destRgba[idx] = b;
                            destRgba[idx + 1] = g;
                            destRgba[idx + 2] = r;
                            destRgba[idx + 3] = 255;
                        }
                    }
                }

                // Soft alpha boundary feathering for clean anti-aliasing
                for (int y = 1; y < h - 1; y++)
                {
                    for (int x = 1; x < w - 1; x++)
                    {
                        int idx = y * stride + x * 4;
                        if (destRgba[idx + 3] == 255)
                        {
                            int bgNeighbors = 0;
                            if (isBg[x - 1, y]) bgNeighbors++;
                            if (isBg[x + 1, y]) bgNeighbors++;
                            if (isBg[x, y - 1]) bgNeighbors++;
                            if (isBg[x, y + 1]) bgNeighbors++;

                            if (bgNeighbors > 0)
                            {
                                byte b = srcRgba[idx];
                                byte g = srcRgba[idx + 1];
                                byte r = srcRgba[idx + 2];
                                int diff = 765 - (r + g + b);
                                if (diff < 80)
                                {
                                    destRgba[idx + 3] = (byte)Math.Max(30, Math.Min(220, diff * 3));
                                }
                            }
                        }
                    }
                }

                Marshal.Copy(destRgba, 0, destData.Scan0, bytes);
                src.UnlockBits(srcData);
                dest.UnlockBits(destData);

                dest.Save(outputPath, ImageFormat.Png);
            }
        }
    }
}
"@

Add-Type -TypeDefinition $csharp -ReferencedAssemblies "System.Drawing.dll"

$srcDir = "c:\Users\tatar\OneDrive\เดสก์ท็อป\AAA\asset(props)\thelake"
$outDir = "c:\Users\tatar\OneDrive\เดสก์ท็อป\AAA\public\images\ch6-lakeclub\props"

if (!(Test-Path $outDir)) {
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null
}

$allFiles = Get-ChildItem -Path $srcDir

Write-Host "Processing The Lake Club props..."

# 1. fairy-lights.png (from index 11: ไฟปิงปัง.png)
$lightsFile = $allFiles[11].FullName
[ImageDieCutterTheLake]::ProcessImage($lightsFile, "$outDir\fairy-lights.png", 240, $false)
Write-Host " fairy-lights.png done"

# 2. clubhouse.png (from index 3: prop (7).png)
$clubhouseFile = $allFiles[3].FullName
[ImageDieCutterTheLake]::ProcessImage($clubhouseFile, "$outDir\clubhouse.png", 240, $true)
Write-Host " clubhouse.png done"

# 3. lake-horizon.png (from index 2: prop (5).png)
$lakeFile = $allFiles[2].FullName
[ImageDieCutterTheLake]::ProcessImage($lakeFile, "$outDir\lake-horizon.png", 242, $true)
Write-Host " lake-horizon.png done"

# 4. pier.png (from index 5: prop (9).png)
$pierFile = $allFiles[5].FullName
[ImageDieCutterTheLake]::ProcessImage($pierFile, "$outDir\pier.png", 240, $true)
Write-Host " pier.png done"

# 5. cocktail.png (from index 4: prop (8).png)
$cocktailFile = $allFiles[4].FullName
[ImageDieCutterTheLake]::ProcessImage($cocktailFile, "$outDir\cocktail.png", 242, $true)
Write-Host " cocktail.png done"

# 6. water-ripples.png (from index 1: prop (4).png)
$waterFile = $allFiles[1].FullName
[ImageDieCutterTheLake]::ProcessImage($waterFile, "$outDir\water-ripples.png", 240, $false)
Write-Host " water-ripples.png done"

# 7. Watercolor clouds
$cloudTealFile = $allFiles[8].FullName
[ImageDieCutterTheLake]::ProcessImage($cloudTealFile, "$outDir\cloud-teal.png", 244, $false)
Write-Host " cloud-teal.png done"

$cloudBlueFile = $allFiles[9].FullName
[ImageDieCutterTheLake]::ProcessImage($cloudBlueFile, "$outDir\cloud-blue.png", 244, $false)
Write-Host " cloud-blue.png done"

$cloudWarmFile = $allFiles[10].FullName
[ImageDieCutterTheLake]::ProcessImage($cloudWarmFile, "$outDir\cloud-warm.png", 244, $false)
Write-Host " cloud-warm.png done"

Write-Host "All Chapter 6 assets successfully processed!"
