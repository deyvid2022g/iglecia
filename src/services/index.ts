// Servicios de validación
export {
  validateEmail,
  validateColombianPhone,
  validatePassword,
  validateFullName,
  validateAge,
  validateUrl,
  validateSlug,
  validateEventDates,
  validateTimeRange,
  validateEventCapacity,
  validateContent,
  validateFile,
  sanitizeText,
  generateSlug,
  validateEventRegistration
} from './validationService';

// Servicios de utilidades
export {
  formatDate,
  formatRelativeTime,
  formatDuration,
  formatNumber,
  truncateText,
  extractExcerpt,
  calculateReadTime,
  generateAvatarColor,
  generateInitials,
  formatPhoneNumber,
  formatUrl,
  generateId,
  debounce,
  throttle,
  copyToClipboard,
  downloadFile,
  fileToBase64,
  resizeImage,
  getDeviceInfo,
  scrollToElement,
  getUrlParams,
  updateUrlParams,
  formatDayOfWeek,
  getDateRanges,
  generateThemeColors
} from './utilsService';

// Servicios de archivos
export {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  getSignedUrl,
  listFiles,
  getFileInfo,
  createBucketsIfNotExist,
  useFileUpload,
  optimizeImage,
  UPLOAD_CONFIGS
} from './fileService';

export type {
  UploadOptions,
  UploadResult
} from './fileService';