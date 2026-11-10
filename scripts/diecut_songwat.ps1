$csharp = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public class ImageDieCutterSongWat2
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
                            destRgba[idx] = 0;
                            destRgba[idx + 1] = 0;
                            destRgba[idx + 2] = 0;
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

                Marshal.Copy(destRgba, 0, destData.Scan0, bytes);

                src.UnlockBits(srcData);
                dest.UnlockBits(destData);

                dest.Save(outputPath, ImageFormat.Png);
            }
        }
    }
}
"@

Add-Type -TypeDefinition $csharp -ReferencedAssemblies System.Drawing

$dirs = Get-ChildItem -LiteralPath "asset(props)" -Directory
$songwatDir = $dirs[2]
$outFolder = "public\images\ch2-songwat\props"

Get-ChildItem -LiteralPath $songwatDir.FullName -File | ForEach-Object {
    $img = [System.Drawing.Image]::FromFile($_.FullName)
    $w = $img.Width
    $h = $img.Height
    $img.Dispose()

    if ($w -eq 1361 -and $h -eq 864) {
        Write-Output "Processing camera (1361x864) -> camera.png"
        [ImageDieCutterSongWat2]::ProcessImage($_.FullName, "$outFolder\camera.png", 242, $true)
    }
    elseif ($w -eq 1417 -and $h -eq 864) {
        Write-Output "Processing cloud-teal (1417x864) -> cloud-teal.png"
        [ImageDieCutterSongWat2]::ProcessImage($_.FullName, "$outFolder\cloud-teal.png", 246, $true)
    }
    elseif ($w -eq 1704 -and $h -eq 767) {
        Write-Output "Processing cloud-warm (1704x767) -> cloud-warm.png"
        [ImageDieCutterSongWat2]::ProcessImage($_.FullName, "$outFolder\cloud-warm.png", 246, $true)
    }
    elseif ($w -eq 1704 -and $h -eq 835) {
        Write-Output "Processing cloud-blue (1704x835) -> cloud-blue.png"
        [ImageDieCutterSongWat2]::ProcessImage($_.FullName, "$outFolder\cloud-blue.png", 246, $true)
    }
}

Write-Output "Camera and Clouds processed!"
