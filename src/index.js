const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

// Banco de Dados (Simulado)
const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response
      .status(404)
      .json({ error: "O usuário informado não foi encontrado(a)!" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const usernameAlreadyExists = users.find(
    (user) => user.username === username
  );

  if (usernameAlreadyExists) {
    return response
      .status(400)
      .json({ error: "O usuário informado já está registrado!" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  try {
    return response.status(201).json(user);
  } catch (error) {
    return response.status(400).json(error);
  }
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  try {
    return response.json(user.todos);
  } catch (error) {
    return response.status(400).json(error);
  }
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  try {
    return response.status(201).json(todo);
  } catch (error) {
    return response.status(400).json(error);
  }
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({
      error: "A tarefa informada para alteração não existe em nosso registro!",
    });
  }

  todo.title = title;
  todo.deadline = deadline;

  try {
    return response.json(todo);
  } catch (error) {
    return response.status(400).json(error);
  }
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo) {
    return response.status(404).json({ error: 'A tarefa informada para alteração não existe em nosso registro!' })
  }

  todo.done = true;

  try {
    return response.json(todo);
  } catch (error) {
    return response.status(400).json(error);
  }
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if(todoIndex === -1) {
    return response.status(404).json({ error: 'A tarefa informada para alteração não existe em nosso registro!' })
  }

  user.todos.splice(todoIndex, 1)

  try {
    return response.status(204).json({ sucesso: 'A tarefa informada foi removida com sucesso!' })
  } catch (error) {
    return response.status(400).json(error)   
  }
});

module.exports = app;
