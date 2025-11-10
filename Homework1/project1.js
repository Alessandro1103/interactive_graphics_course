// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
function composite( bgImg, fgImg, fgOpac, fgPos )
{
  var Opac = 0;
  var alphab = 0;
  var alphaf = 0;
  var bgIndex = 0;
  var fgIndex = 0;

  for (w=0; w<fgImg.height; w++) {
    for (h=0; h<fgImg.width; h++) {

      bgIndex = (fgPos.y * bgImg.width + fgPos.x + h + w * bgImg.width) * 4;
      fgIndex = (w * fgImg.width + h) * 4;

      if (fgPos.x + h >= 0 && fgPos.y + w >= 0 && fgPos.x + h < bgImg.width && fgPos.y + w < bgImg.height) {

        alphaf = fgImg.data[fgIndex+3]/255 * fgOpac
        alphab = bgImg.data[bgIndex+3]/255
        Opac = alphaf + (1-alphaf) * (alphab);
        
        bgImg.data[bgIndex] = (alphaf * fgImg.data[fgIndex] + (1-alphaf) * alphab * bgImg.data[bgIndex])/Opac;
        bgImg.data[bgIndex+1] = (alphaf * fgImg.data[fgIndex+1] + (1-alphaf) * alphab * bgImg.data[bgIndex+1])/Opac;
        bgImg.data[bgIndex+2] = (alphaf * fgImg.data[fgIndex+2] + (1-alphaf) * alphab * bgImg.data[bgIndex+2])/Opac;
        bgImg.data[bgIndex+3] = Opac * 255;
      }
    }
  }
}
