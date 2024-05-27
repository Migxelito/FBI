const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const SECRET_KEY = '';
const users = [{ email: 'agent@example.com', password: 'password123' }];

// Ruta para servir el archivo HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para autenticar al agente
app.post('/SignIn', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '2m' });
        res.send(`
            <html>
                <body>
                    <p>Email: ${email}</p>
                    <script>
                        sessionStorage.setItem('token', '${token}');
                        setTimeout(() => {
                            sessionStorage.removeItem('token');
                        }, 2 * 60 * 1000); // 2 minutos
                    </script>
                    <a href="/restricted">Go to restricted area</a>
                </body>
            </html>
        `);
    } else {
        res.status(401).send('Unauthorized');
    }
});

// Ruta restringida
app.get('/restricted', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).send('No token provided');
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send('Invalid token');
        }

        res.send(`Welcome, ${decoded.email}`);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
