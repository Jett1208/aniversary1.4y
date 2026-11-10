Add-Type -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;

public class StickerMaker
{
    public static void MakeSticker(string inputPath, string outputPath, int borderWidth)
    {
        using (Bitmap src = new Bitmap(inputPath))
        {
            int w = src.Width;
            int h = src.Height;
            int pad = borderWidth + 4;
            int nw = w + pad * 2;
            int nh = h + pad * 2;

            using (Bitmap dest = new Bitmap(nw, nh, PixelFormat.Format32bppArgb))
            {
                bool[,] hasContent = new bool[nw, nh];
                for (int y = 0; y < h; y++)
                {
                    for (int x = 0; x < w; x++)
                    {
                        if (src.GetPixel(x, y).A > 20)
                        {
                            hasContent[x + pad, y + pad] = true;
                        }
                    }
                }

                bool[,] stickerMask = new bool[nw, nh];
                for (int y = 0; y < nh; y++)
                {
                    for (int x = 0; x < nw; x++)
                    {
                        if (hasContent[x, y])
                        {
                            for (int dy = -borderWidth; dy <= borderWidth; dy++)
                            {
                                for (int dx = -borderWidth; dx <= borderWidth; dx++)
                                {
                                    if (dx * dx + dy * dy <= borderWidth * borderWidth)
                                    {
                                        int nx = x + dx;
                                        int ny = y + dy;
                                        if (nx >= 0 && nx < nw && ny >= 0 && ny < nh)
                                        {
                                            stickerMask[nx, ny] = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                using (Graphics g = Graphics.FromImage(dest))
                {
                    g.Clear(Color.Transparent);
                    for (int y = 0; y < nh; y++)
                    {
                        for (int x = 0; x < nw; x++)
                        {
                            if (stickerMask[x, y])
                            {
                                dest.SetPixel(x, y, Color.FromArgb(255, 255, 255, 255));
                            }
                        }
                    }
                    g.DrawImage(src, pad, pad, w, h);
                }

                dest.Save(outputPath, ImageFormat.Png);
            }
        }
    }
}
"@ -ReferencedAssemblies System.Drawing

$outProps = "public\images\ch3-taladnoi\props"
[StickerMaker]::MakeSticker("$outProps\pixel-heart.png", "$outProps\pixel-heart-sticker.png", 14)
[StickerMaker]::MakeSticker("$outProps\hp-bar.png", "$outProps\hp-bar-sticker.png", 10)
[StickerMaker]::MakeSticker("$outProps\coin.png", "$outProps\coin-sticker.png", 14)
[StickerMaker]::MakeSticker("$outProps\controller.png", "$outProps\controller-sticker.png", 16)
Write-Output "Stickers refreshed!"
