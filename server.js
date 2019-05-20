const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const db = require('./db');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(
	session({
		secret: 'exp-sess',
		resave: true,
		saveUninitialized: false,
		cookie: { maxAge: 3600000 }
	})
);

const secret = require('./jwtsecret').secret;
let currentUser;
let currentOnline = [];

function authTest(req, res, next) {
	if (!req.cookies.token) {
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
				currentUser = decoded.login;
				next();
			}
		});
	}
}

app.use('/', express.static(__dirname + '/'));

app.post('/login', async (req, res) => {
	const { login, password } = req.body;
	let result;
	try {
		result = await db.testLogin(login);
	} catch (e) {
		console.log('Error:', e);
	}
	console.log('Login found:', result);
	if (result) {
		if (password === result.password) {
			if (!req.cookies.token) {
				jwt.sign(
					{ login, password },
					secret,
					{ expiresIn: '1h' },
					(err, token) => {
						if (err) {
							console.log('JWT signing error occured:', err);
						}
						res.cookie('token', token, { httpOnly: true });
						currentUser = login;
						console.log('Token signed');
						res.redirect('./chat');
					}
				);
			} else {
				console.log('Trying to verify');
				jwt.verify(
					req.cookies.token,
					secret,
					{ maxAge: '1h' },
					(err, decoded) => {
						if (err) {
							console.log('JWT verifying error occured:', err);
							res.clearCookie('token');
							console.log('Try again');
							res.redirect('/');
						} else {
							currentUser = decoded.login;
							console.log('Token verified');
							res.redirect('./chat');
						}
					}
				);
			}
		} else {
			res.send('Incorrect password');
		}
	} else {
		res.send('User not found');
	}
});

app.get('/register-page', (req, res) => {
	res.sendFile(path.join(__dirname + '/index-reg.html'));
});

app.post('/register', (req, res) => {
	const { login, password } = req.body;
	db.addUser(login, password);
	jwt.sign({ login, password }, secret, { expiresIn: '1h' }, (err, token) => {
		if (err) {
			console.log('JWT signing error occured:', err);
		}
		res.cookie('token', token, { httpOnly: true });
		res.redirect('/');
	});
});

app.get('/chat', authTest, async (req, res) => {
	let result;
	try {
		result = await db.getChatHistory();
	} catch (e) {
		console.log('Error:', e);
	}
	res.render('chat', {
		currentUsername: currentUser,
		chatHistory: result
	});
});

app.get('/logout', (req, res) => {
	res.clearCookie('token');
	res.redirect('/');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`Server running at port ${PORT}`);
});

// Socket.io

io.on('connection', socket => {
	let socketUser = currentUser;
	currentOnline.push(socketUser);
	console.log('User connected:', socketUser);
	console.log('Currently online:', currentOnline);
	io.emit('user-connected', socketUser);
	io.emit('onlineListUpdate', currentOnline);

	socket.on('message', msg => {
		console.log('Message sent:', msg.sender, ':', msg.message);
		db.storeMessage(socketUser, msg.message);
		socket.broadcast.emit('message', {
			sender: msg.sender,
			time: msg.time,
			message: msg.message
		});
	});

	socket.on('disconnect', () => {
		console.log('User disconnected:', socketUser);
		for (var i = 0; i < currentOnline.length; i++) {
			if (currentOnline[i] === socketUser) {
				currentOnline.splice(i, 1);
				break;
			}
		}
		io.emit('user-disconnected', socketUser);
		io.emit('onlineListUpdate', currentOnline);
		console.log('Currently online:', currentOnline);
	});
});
