const axios = require('axios').default
const sharp = require('sharp')

async function loadImage(url, scaleToMaxWidth = 0) {
  let res = null
  try {
    res = await axios.get(url, {
      responseType: 'arraybuffer'
    })
  }
  catch (e) {
    console.error(e, 'loadImage error')
    res = null
  }
  if (!res || !res.data) {
    return null
  }
  // use sharp to convert webp to png (Jimp does not support webp)
  let sharpImage = await sharp(res.data).toFormat('png')
  let meta = await sharpImage.metadata()
  if (scaleToMaxWidth && meta.width > scaleToMaxWidth) {
    sharpImage = await sharpImage.resize(scaleToMaxWidth)
    meta = await sharpImage.metadata()
  }
  const buffer = await sharpImage.toBuffer()

  return {
    url,
    buffer,
    base64: 'data:image/png;base64,' + buffer.toString('base64'),
    width: meta.width,
    height: meta.height
  }
}

module.exports = loadImage
