const getDownloadUrl = (fileName, bucketName, token) =>
  `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(
    fileName,
  )}?alt=media&token=${token}`

module.exports = getDownloadUrl
