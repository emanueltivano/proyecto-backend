const authMiddleware = (req, res, next) => {
    if (!req.session.user) {
        res.redirect('/login'); // Redirigir al inicio de sesión si no está autenticado
        return;
    }
    next();
};

module.exports = authMiddleware;