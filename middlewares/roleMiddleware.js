function roleMiddleware(roles) {
    return (req, res, next) => {
        const user = req.session.user;

        if (roles.includes('admin') && user.admin) {
            next();
        } else if (roles.includes('premium') && user.premium) {
            next();
        } else if (roles.includes('user') && user.role === 'user') {
           next();
        } else {
            res.redirect('/profile');
        }

    };
}

module.exports = roleMiddleware;