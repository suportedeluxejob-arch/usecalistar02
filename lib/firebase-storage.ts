import { storage, storageRef, uploadBytes, getDownloadURL, deleteObject } from "./firebase"

// Upload image and get URL
export async function uploadProductImage(file: File, productId: string): Promise<string> {
  const fileName = `${Date.now()}-${file.name}`
  const imageRef = storageRef(storage, `products/${productId}/${fileName}`)

  await uploadBytes(imageRef, file)
  const url = await getDownloadURL(imageRef)

  return url
}

// Delete image
export async function deleteProductImage(imageUrl: string): Promise<void> {
  try {
    const imageRef = storageRef(storage, imageUrl)
    await deleteObject(imageRef)
  } catch (error) {
    console.error("Error deleting image:", error)
  }
}

// Upload multiple images
export async function uploadProductImages(files: File[], productId: string): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadProductImage(file, productId))
  return Promise.all(uploadPromises)
}
