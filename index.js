require('dotenv').config();
const express = require('express');
const cors = require('cors');
var morgan = require('morgan');

const Person = require('./models/person');

const PORT = process.env.PORT;
const app = express();

const baseUrl = '/api/persons';

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

app.get('/info', (req, res) => {
  Person.find({}).then((result) => {
    res.send(
      `<p>Phonebook has info for ${
        result.length
      } people</p><p>${new Date().toString()}</p>`
    );
  });
});

app.get(baseUrl, (req, res) => {
  Person.find({}).then((result) => {
    res.json(result);
  });
});

app.post(baseUrl, (req, res, next) => {
  console.log(req.body);

  if (!req.body.name || !req.body.number) {
    next({ message: 'request body missing' });
  }

  Person.find({ name: req.body.name }).then((result) => {
    if (result.length !== 0) {
      next({ message: 'duplicate name' });
    } else {
      const person = new Person({
        name: req.body.name,
        number: req.body.number,
      });

      person
        .save()
        .then((result) => {
          return res.json(result);
        })
        .catch((error) => next(error));
    }
  });
});

app.get(`${baseUrl}/:id`, (req, res, next) => {
  Person.findById(req.params.id)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => next(error));
});

app.put(`${baseUrl}/:id`, (req, res, next) => {


  Person.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .then((result) => {
      res.json({ message: `${result.name} has been updated` });
    })
    .catch((error) => next(error));
});

app.delete(`${baseUrl}/:id`, (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then((result) => {
      res.json({ message: `${result.name} has been deleted` });
    })
    .catch((error) => next(error));
});

const errorHandler = (error, request, response) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  } else if (error.message) {
    return response.status(400).json({ error: error.message });
  }

  return response.status(400).send({ error: 'error' });
};

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
