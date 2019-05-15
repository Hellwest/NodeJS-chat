const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const db = require('./db.js');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(session({
    secret: 'exp-sess',
    resave: true,
    saveUninitialized: false,
    cookie: {maxAge: 3600000},
}));

const secret = require('./jwtsecret.js').secret;
let currentUser;
let currentOnline = [];

async function testLogin(login) {
    return await db.testLogin(login);
}

async function addUser(login, password) {
    return await db.addUser(login, password);
}

async function storeMessage(username, msgContent) {
    await db.storeMessage(username, msgContent);
}

async function retrieveChatHistory() {
    return await db.getChatHistory();
}

function authTest(req, res, next) {
    if (req.cookies.token === undefined) {
        console.log('No token supplied. Redirecting');
        res.redirect('/');
    } else {
        jwt.verify(req.cookies.token, secret, (err, decoded) => {
            if (err) {
                console.log('Token authentication failed:', err);
                res.clearCookie('token');
                console.log('Try again');
                res.redirect('/');
            } else {
                console.log('Token verification successful (middleware)');
                currentUser = decoded.name;
                next();
            }
        })
    }
}

app.use('/', express.static(__dirname+'/'));

app.post('/login', (req, res) => {
    testLogin(req.body.login_input).then(result => {
        console.log("Login found:", result);
        if (result !== undefined) {
        	if (req.body.login_input == result.username && req.body.password_input == result.password) {
	        	if (req.cookies.token === undefined) {
	        		jwt.sign({name: req.body.login_input, password: req.body.password_input}, secret, {expiresIn: '1h'}, (err, token) => {
                        if (err) {console.log('JWT signing error occured:', err)};
				        res.cookie('token', token, {httpOnly: true});
                        currentUser = req.body.login_input;
		                console.log('Token signed');
		                res.redirect('./chat')
				    })
	        	} else {
                    console.log('Trying to verify');
	        		jwt.verify(req.cookies.token, secret, {maxAge: '1h'}, (err, decoded) => {
		                if (err) {
                            console.log('JWT verifying error occured:', err);
                            res.clearCookie('token');
                            console.log('Try again');
                            res.redirect('/');
                        } else {
                            currentUser = decoded.name;
                            console.log('Token verified');
                            res.redirect('./chat')
                        }
	            	})
	        	}
	        } else {
	            res.send("Incorrect password");
	        }
        } else {
        	res.send("User not found");
        }
    })
});

app.get('/register-page', (req, res) => {
    res.sendFile(path.join(__dirname+'/index-reg.html'));
})

app.post('/register', (req, res) => {
    addUser(req.body.login_input, req.body.password_input);
    jwt.sign({name: req.body.login_input, password: req.body.password_input}, secret, {expiresIn: '1h'}, (err, token) => {
        if (err) {console.log('JWT signing error occured:', err)};
        res.cookie('token', token, {httpOnly: true});
        res.redirect('/');
    })
})

app.get('/chat', authTest, (req, res) => {
    retrieveChatHistory().then(result => {
        res.render('chat', {currentUsername: currentUser, chatHistory: result, token: req.cookies.token});
    });
})

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
})

io.on('connection', socket => {
    let socketUser = currentUser;
    currentOnline.push(socketUser);
    console.log('User connected:',socketUser);
    console.log("Currently online:",currentOnline);
    io.emit('user-connected', socketUser);
    io.emit('onlineListUpdate', currentOnline);

    socket.on('message', msg => {
        console.log('Message sent:',msg.sender,':',msg.message);
        storeMessage(socketUser, msg.message);
        socket.broadcast.emit('message', {sender: msg.sender, time: msg.time, message: msg.message});
    })

    socket.on('disconnect', () => {
        console.log('User disconnected:',socketUser);
        for (var i=0; i<currentOnline.length; i++) {
            if (currentOnline[i] === socketUser) {
                currentOnline.splice(i, 1);
                break;
            }
        }
        io.emit('user-disconnected', socketUser);
        io.emit('onlineListUpdate', currentOnline);
        console.log("Currently online:",currentOnline);
    })
})

server.listen(process.env.PORT, () => {
    console.log('Сервер запущен: https://localhost:3000');
});