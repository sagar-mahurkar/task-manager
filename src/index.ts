import express, {Response, Request, NextFunction} from "express";
import { v4 as uuidv4, validate } from "uuid";
import { AppDataSource } from "./data-source";
import { Task } from "./entity/Task";

const taskRepository = AppDataSource.getRepository(Task);

const app = express();

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
app.post("/task", taskBodyValidator, async (req: Request, res: Response, next: NextFunction) => {
  const { name, deadline, reminderAt } = req.body;

  const insertResult = await taskRepository.insert({
    name: name,
    deadline: new Date(deadline),
    reminder_at: reminderAt ? new Date(reminderAt) : undefined
  });

  res.status(201).json(insertResult.identifiers[0]);
});

// Read
// Get all tasks
app.get("/tasks", async (req: Request, res: Response, next: NextFunction) => {

  const tasks = await taskRepository.find();

  res.json(tasks);
});

// Get desired task by id
app.get("/task/:id", async (req: Request, res: Response, next: NextFunction) => {
  if (!validate(req.params.id as string)) return res.status(404).json({ error: "Invalid ID" });

  const task = await taskRepository.findOne({
    where: { id: req.params.id as string },
  });
  if (!task) return res.status(400).json("Task not found!");
  res.json(task);
});

// Get upcoming reminder: reminder within one hour
app.get("/tasks/reminders/upcoming", async (req: Request, res: Response, next: NextFunction) => {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60*60*1000);

  const tasks = await taskRepository.find();

  const reminders = tasks.filter( 
    (task: Task) => 
      task.reminder_at && 
      task.reminder_at > now && 
      task.reminder_at <= oneHourLater
  );
  res.json(reminders);
});

// Update task
app.put("/task/:id", async (req: Request, res: Response, next: NextFunction) => {
  if (!validate(req.params.id as string)) return res.status(404).json({ error: "Invalid ID" });

  const task = await taskRepository.findOne({
    where: { id: req.params.id as string },
  });
  if (!task) return res.status(400).json("Task not found!");
  
  const { name, deadline, reminderAt } = req.body;
  
  task.name = name ?? task.name;
  task.deadline = deadline ? new Date(deadline) : task.deadline;
  task.reminder_at = reminderAt ? new Date(reminderAt) : task.reminder_at;

  await taskRepository.save(task);

  res.json(task);
});

// Mark task as completed
app.put("/task/:id/complete", async (req: Request, res: Response, next: NextFunction) => {
  if (!validate(req.params.id as string)) return res.status(404).json({ error: "Invalid ID" });

  const task = await taskRepository.findOne({
    where: { id: req.params.id as string },
  });
  if (!task) return res.status(400).json("Task not found!");

  task.completed_at = new Date();

  await taskRepository.save(task);

  res.json(task);
})

// Delete task
app.delete("/task/:id", async (req: Request, res: Response, next: NextFunction) => {
  if (!validate(req.params.id as string)) return res.status(404).json({ error: "Invalid ID" });

  const task = await taskRepository.findOne({
    where: { id: req.params.id as string },
  });
  if (!task) return res.status(400).json("Task not found!");
  
  await taskRepository.delete({ id: req.params.id as string })

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

