import jwt from 'jsonwebtoken';

export default function auth(req, res, next) {
  const token = req.headers['x-auth-token'];
  if (!token) {
    console.log('Auth middleware: No token provided');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware: Decoded token:', decoded);
    if (!decoded.user) {
      console.log('Auth middleware: Invalid token structure, missing user');
      return res.status(403).json({ msg: 'Invalid token structure' });
    }

    const userId = decoded.user.id || decoded.user._id;
    if (!userId) {
      console.log('Auth middleware: Invalid token, missing user ID');
      return res.status(403).json({ msg: 'Invalid token, missing user ID' });
    }

    req.user = {
      id: userId,
      _id: userId, // Support both id and _id for compatibility
      role: decoded.user.role || 'user',
    };
    console.log('Auth middleware: Token verified, req.user:', req.user);
    next();
  } catch (err) {
    console.error('Auth middleware: Token verification error:', err.message, err);
    res.status(403).json({ msg: err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token' });
  }
}