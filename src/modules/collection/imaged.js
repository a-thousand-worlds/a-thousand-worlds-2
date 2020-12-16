/** Imaged collection elements use `field` field for element related image, stored at Firestore */
import collection from '@/modules/collection/managed'
import mergeOne from '@/util/mergeOne'
import firebase from '@/firebase'
import Jimp from 'jimp'

const module = (name, field) => mergeOne(collection(name), {
  actions: {
    async saveWithImage(state, { key, value }) {
      if (!key) throw new Error('key required')
      if (typeof value !== 'object') throw new Error('value should be object')
      const image = value[field]
      if (image?.base64?.length) {
        const img = await Jimp.read(image.base64)
        const buff = await img.getBufferAsync(Jimp.MIME_PNG)
        const ref = await firebase.storage.ref(`${name}/${key}`)
        await ref.put(buff, { contentType: 'image/png', cacheControl: 'public,max-age=3600' })
        const url = await ref.getDownloadURL()
        value[field] = {
          url: url,
          base64: '',
          width: img.bitmap.width,
          height: img.bitmap.height
        }
      }
      await state.dispatch(`${name}/save`, { key, value })
    },
    /** removes element and related image from firestore */
    async removeWithImage(state, key) {
      if (!key) throw new Error('key required')
      await state.dispatch(`${name}/remove`, key)
      const ref = await firebase.storage.ref(`${name}/${key}`)
      await ref.delete()
    }
  }
})

export default module
