function authMiddleware(req, res, next) {
    if (req.session.user) {
        req.user = req.session.user;  // Asigna el usuario de la sesión a req.user
        next();  // Permite que la solicitud continúe al siguiente middleware o ruta
    } else {
        res.redirect('/login');  // Si el usuario no está autenticado, redirige a la página de inicio de sesión
    }
}

module.exports = authMiddleware;