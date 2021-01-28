const sharp = require('sharp')

async function image64ToBuffer(base64, scaleToMaxWidth = 0) {
  const data = base64.split(',').slice(1).join(',')
  const bin = Buffer.from(data, 'base64')
  let sharpImage = await sharp(bin).toFormat('png')
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
