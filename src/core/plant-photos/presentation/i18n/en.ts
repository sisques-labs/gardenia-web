const dict = {
  addPhoto: 'Add photo',
  uploading: 'Uploading...',
  uploadError: 'Could not upload the photo. Try again.',
  deletePhoto: 'Delete photo',
  deleteError: 'Could not delete the photo. Try again.',
} as const;

export default dict;
export type PlantPhotosDict = typeof dict;
