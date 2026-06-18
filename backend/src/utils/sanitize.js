const sanitizeUser = user => {
    if (!user) {
        return null;
    }

    const plainUser = typeof user.get === 'function' ? user.get({ plain: true }) : user;
    const { passwordHash, ...safeUser } = plainUser;
    return safeUser;
};

module.exports = {
    sanitizeUser
};
