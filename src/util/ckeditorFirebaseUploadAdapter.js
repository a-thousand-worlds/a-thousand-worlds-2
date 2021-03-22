import firebase from '@/firebase'

// eslint-disable-next-line fp/no-class
class ATWUploadAdapter {
  constructor(loader) {
    this.loader = loader
  }

  async upload() {
    const file = await this.loader.file
    return this.firebaseUpload(file)
  }

  firebaseUpload(file) {
    return new Promise((resolve, reject) => {
      const ref = firebase.storage().ref(`content/${file.name}`)
      this.task = ref.put(file)
      this.task.on('state_changed', snap => {
        this.loader.uploadTotal = snap.totalBytes
        this.loader.uploaded = snap.bytesTransferred
      }, err => {
        console.log('error on content file upload', err)
        reject(err)
      }, () => {
        ref.getDownloadURL().then(url => {
          this.task = null
          resolve({
            default: url
          })
        })
      })
    })
  }

  abort() {
    if (this.task) {
      this.task.cancel()
    }
  }

}

const FirebaseUploadAdapter = editor => {
  editor.plugins.get('FileRepository').createUploadAdapter = loader => new ATWUploadAdapter(loader)
}

export default FirebaseUploadAdapter
