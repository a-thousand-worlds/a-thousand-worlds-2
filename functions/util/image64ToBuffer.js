const sharp = require('sharp')

async function image64ToBuffer(base64, scaleToMaxWidth = 0) {
  let sharpImage = await sharp(base64).toFormat('png')
  let meta = await sharpImage.metadata()
  if (scaleToMaxWidth && meta.width > scaleToMaxWidth) {
    sharpImage = await sharpImage.resize(scaleToMaxWidth)
    meta = await sharpImage.metadata()
  }
  const buffer = await sharpImage.toBuffer()
  return {
    buffer,
    width: meta.width,
    height: meta.height
  }
}

module.exports = image64ToBuffer
