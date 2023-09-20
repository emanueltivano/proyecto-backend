const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const bcrypt = require("bcrypt");
const GitHubStrategy = require("passport-github2");
const UserModel = require("../dao/models/UserModel");
const config = require('../config/config');

const initializePassport = () => {
    passport.use('github', new GitHubStrategy({
        clientID: config.githubId,
        clientSecret: config.githubSecret,
        callbackURL: config.callbackUrl
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log(profile);
            let user = await UserModel.findOne({ email: profile._json.email })
            if (!user) {
                let newUser = {
                    first_name: profile._json.name,
                    last_name: '',
                    age: 18,
                    email: profile._json.email,
                    password: ''
                }
                let result = await UserModel.create(newUser);
                done(null, result);
            } else {
                done(null, user);
            }
        } catch (error) {
            return done(error);
        }
    }));

    // Configuración de la estrategia local
    passport.use(
        new LocalStrategy(
            { usernameField: "email" },
            async (email, password, done) => {
                try {
                    const user = await UserModel.findOne({ email });

                    if (!user || !(await bcrypt.compare(password, user.password))) {
                        return done(null, false, { message: "Credenciales incorrectas" });
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );

    // Configuración de la estrategia de JWT
    const jwtOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.secretKey,
    };

    passport.use(
        new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
            try {
                const user = await UserModel.findById(jwtPayload.id);

                if (!user) {
                    return done(null, false, { message: "Usuario no encontrado" });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        })
    );

    // Función de serialización
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Función de deserialización
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await UserModel.findById(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
};

module.exports = initializePassport;