 
import jwt from 'jsonwebtoken';

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

if (!SUPABASE_JWT_SECRET) {
  throw new Error('Missing SUPABASE_JWT_SECRET in environment variables');
}

export const verifyToken = async (req: Request) => {
  try {
    const authHeader = req.headers.get('authorization');
    const refresh_token = req.headers.get('refresh_token');
    if (!authHeader || !authHeader.startsWith('Bearer ') || !refresh_token) {
      return { success: false, error: 'Unauthorized: No token provided' };
    }

    const access_token = authHeader.split(' ')[1];
    // Verify HS256 token using Supabase secret
    const decoded = jwt.verify(access_token, SUPABASE_JWT_SECRET, { algorithms: ['HS256'] });
    return { success: true, user: decoded, access_token, refresh_token };
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return { success: false, error: 'Unauthorized: Invalid token' };
  }
};

