import express, {Response, Request, NextFunction} from "express";
import { v4 as uuidv4 } from "uuid";
import { AppDataSource } from "./data-source";


const app = express();



// Task interface
interface Task {
  id: string
  name: string;
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;   // optional
  reminderAt?: Date;  // optional
}

// Storage
let tasks: Task[] = [];

// Middlewares
app.use(express.json());

// Task body validation
const taskBodyValidator = (req: Request, res: Response, next: NextFunction) => {
  const { name, deadline } = req.body;
  if (!name || !deadline) {
    return res.status(400).json({ error: "Both name and deadline are required." })
  }
  next();
}

// Routes
// Create task
app.post("/task", taskBodyValidator, (req: Request, res: Response, next: NextFunction) => {
  const { name, deadline, reminderAt } = req.body;
  const now = new Date();
  const task: Task = {
    id: uuidv4(),
    name: name,
    deadline: new Date(deadline),
    createdAt: now,
    updatedAt: now,
    reminderAt: reminderAt ? new Date(reminderAt) : undefined
  };
  tasks.push(task);
  res.status(201).json(task);
});

// Read
// Get all tasks
app.get("/tasks", (req: Request, res: Response, next: NextFunction) => {
  res.json(tasks);
});

// Get desired task by id
app.get("/task/:id", (req: Request, res: Response, next: NextFunction) => {
  const task = tasks.find((task: Task) => task.id === req.params.id);
  if (!task) return res.status(400).json("Task not found!");
  res.json(task);
});

// Get upcoming reminder: reminder within one hour
app.get("/tasks/upcoming", (req: Request, res: Response, next: NextFunction) => {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60*60*1000);
  const upcomingReminders = tasks.filter(
    (task: Task) => 
      task.reminderAt && 
      task.reminderAt > now && 
      task.reminderAt <= oneHourLater
  );
  res.json(upcomingReminders);
});

// Update task
app.put("/task/:id", (req: Request, res: Response, next: NextFunction) => {
  const task = tasks.find((task: Task) => task.id === req.params.id);
  if (!task) return res.status(400).json("Task not found!");
  const { name, deadline, reminderAt } = req.body;
  task.name = name ?? task.name;
  task.deadline = deadline ? new Date(deadline) : task.deadline;
  task.reminderAt = reminderAt ? new Date(reminderAt) : task.reminderAt;
  task.updatedAt = new Date();
  res.json(task);
});

// Mark task as completed
app.put("/task/:id/complete", (req: Request, res: Response, next: NextFunction) => {
  const task = tasks.find((task: Task) => task.id === req.params.id);
  if (!task) return res.status(400).json("Task not found!");
  task.completedAt = new Date();
  task.updatedAt = new Date();
  res.json(task);
})

// Delete task
app.delete("/task/:id", (req: Request, res: Response, next: NextFunction) => {
  const task = tasks.find((task: Task) => task.id === req.params.id);
  if (!task) return res.status(400).json("Task not found!");
  tasks = tasks.filter((task: Task) => task.id !== req.params.id);
  res.json("Task deleted!")
});

// Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("ERROR:", err.message);
  res.status(500).json({
    status: "error",
    message: err.message
  });
});

// Initiate the connection to the database: Asyn operation
AppDataSource.initialize()
  .then(async () => {
    console.log("DB Connection Successful!!")

    const query = await AppDataSource.query("Select now()")
    console.log(query);

    // Server
    const PORT = 8080;
    app.listen(PORT, () => {
      console.log(`Server is running at port ${PORT}`);
    });
  })
  .catch((error) => console.log("Error in DB Connection", error));

