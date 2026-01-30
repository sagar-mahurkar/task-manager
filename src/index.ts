import express, {Response, Request, NextFunction} from "express";

const app = express();

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
})