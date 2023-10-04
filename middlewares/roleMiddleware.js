function roleMiddleware(role) {
    return (req, res, next) => {
        const isAdmin = req.session.user.admin;

        if (role === 'admin' && isAdmin) {
            next(); // El cliente tiene el rol de administrador, permite que la solicitud continúe
        } else if (role === 'user' && !isAdmin) {
            next() // El cliente tiene el rol de usuario, permite que la solicitud continúe
        } else {
            res.redirect('/profile'); // Redirige a la página de perfil si el cliente no tiene permisos
        }
    };
}

module.exports = roleMiddleware;