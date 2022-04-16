const express = require('express');
const cors = require('cors');
var morgan = require('morgan');

const app = express();

const baseUrl = '/api/persons';

let persons = [
    {
        id: 1,
        name: 'Arto Hellas',
        number: '040-123456',
    },
    {
        id: 2,
        name: 'Ada Lovelace',
        number: '39-44-5323523',
    },
    {
        id: 3,
        name: 'Dan Abramov',
        number: '12-43-234345',
    },
    {
        id: 4,
        name: 'Mary Poppendieck',
        number: '39-23-6423122',
    },
];

app.use(cors());
app.use(express.json());

app.use(express.static('build'));

morgan.token('body', (req) => {
    return JSON.stringify(req.body);
});

app.use(
    morgan(
        ':method  :url :status :res[content-length] :response-time ms  :body'
    )
);

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>');
});

app.get('/info', (req, res) => {
    res.send(
        `<p>Phonebook has info for ${
            persons.length
        } people</p><p>${new Date().toString()}</p>`
    );
});

app.get('/api/persons', (req, res) => {
    res.json(persons);
});
app.post('/api/persons', (req, res) => {
    console.log(req.body);

    if (!req.body.name || !req.body.number) {
        return res.status(400).json({
            error: `request body missing`,
        });
    }

    if (persons.find((person) => person.name === req.body.name)) {
        return res.status(400).json({ error: 'name must be unique' });
    }

    persons.push({
        name: req.body.name,
        number: req.body.number,
        id: Math.floor(Math.random() * 5000),
    });
    res.json(persons);
});

app.get('/api/persons/:id', (req, res) => {
    const person = persons.find(
        (person) => person.id === Number(req.params.id)
    );
    if (person) {
        res.json(person);
    } else {
        res.status(400).json({
            error: `can't find person`,
        });
    }
});

app.delete('/api/persons/:id', (req, res) => {
    const person = persons.find(
        (person) => person.id === Number(req.params.id)
    );
    if (person) {
        persons = persons.filter(
            (person) => person.id !== Number(req.params.id)
        );
        res.json(persons);
    } else {
        res.status(400).json({
            error: `can't find person`,
        });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
