import { Router } from 'express'
import multer from 'multer'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import {
  getProfile, updateProfile,
  uploadAvatar, deleteAvatar,
  changeEmail, changePassword,
  updateNotifications, exportData, deleteAccount,
} from '../controllers/profileController.js'

const router = Router()

// Multer em memória — validação de magic bytes feita no controller
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
})

router.use(authMiddleware)

router.get('/', getProfile)
router.put('/', updateProfile)

router.post('/avatar', upload.single('avatar'), uploadAvatar)
router.delete('/avatar', deleteAvatar)

router.post('/change-email', changeEmail)
router.post('/change-password', changePassword)

router.put('/notifications', updateNotifications)

router.get('/export', exportData)
router.delete('/', deleteAccount)

export default router
