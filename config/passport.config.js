const passport = require("passport");
const GitHubStrategy = require("passport-github2");
const UserModel = require("../dao/models/UserModel");

const initializePassport = () => {
    passport.use('github', new GitHubStrategy({
        clientID: 'Iv1.63c6dc8c2235c321',
        clientSecret: '41b4f5b871b692b6592de6697ca9a5985493e036',
        callbackURL: "http://localhost:8080/api/sessions/githubcallback"
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