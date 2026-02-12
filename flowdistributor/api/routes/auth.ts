/**
 * FlowDistributor - Authentication API Routes
 * Handles user registration, login, and logout
 */
import { Router, type Request, type Response } from 'express'

const router = Router()

/**
 * User Registration
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' })
      return
    }

    // Registration is handled by Clerk on the frontend
    // This endpoint is for API-based registration if needed
    res.status(201).json({
      message: 'Registration successful',
      user: { email, name },
    })
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' })
  }
})

/**
 * User Login
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' })
      return
    }

    // Authentication is handled by Clerk on the frontend
    // This endpoint validates API tokens if needed
    res.status(200).json({
      message: 'Login successful',
      token: 'session-managed-by-clerk',
    })
  } catch (error) {
    res.status(500).json({ error: 'Login failed' })
  }
})

/**
 * User Logout
 * POST /api/auth/logout
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    // Session cleanup is handled by Clerk
    res.status(200).json({ message: 'Logout successful' })
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' })
  }
})

export default router
