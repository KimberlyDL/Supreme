const tokenMiddleware = async (req, res, next) => {
    const accessToken = req.headers['authorization']?.split(' ')[1];  // Get access token from header
    const refreshToken = req.cookies.refreshToken;  // Get refresh token from cookie

    if (!accessToken) {
        return res.status(401).json({ message: 'Access token is required' });
    }

    try {
        // Verify the access token
        const payload = await jwtUtils.verifyAccessToken(accessToken);
        req.user = payload;  // Attach user data to request
        return next();  // Proceed with the request
    } catch (error) {
        if (error.message === 'TokenExpired') {
            // Access token expired, check refresh token
            if (refreshToken) {
                try {
                    // Refresh the access token using the refresh token
                    const newTokens = await jwtUtils.refreshTokens(refreshToken);
                    
                    // Send new access token to the client
                    res.setHeader('Authorization', `Bearer ${newTokens.accessToken}`);
                    req.user = newTokens.payload;  // Attach new user data to request
                    
                    return next();  // Proceed with the request
                } catch (refreshError) {
                    return res.status(401).json({ message: 'Refresh token expired or invalid, please log in again' });
                }
            }
            return res.status(401).json({ message: 'Access token expired, please log in again' });
        }
        return res.status(403).json({ message: 'Invalid token' });
    }
};
