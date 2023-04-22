import express from "express";
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';
import handlebars from "express-handlebars";
import { errorHandler, notFoundError } from './middlewares/error-handler.js';
import userRoutes from './routes/user.js';
import questionRoutes from './routes/question.js';
import threadRoutes from './routes/thread.js';
import statsRoutes from './routes/stats.js';
import scheduleRoutes from './routes/schedule.js';

const app = express();
dotenv.config();

//const mongo_uri=process.env.DB_URL || `mongodb://mongo`;
const mongo_uri = process.env.DB_URL || `mongodb://127.0.0.1:27017`;
const port = process.env.PORT || 9090;
const dbName = process.env.DB_NAME;

mongoose.set('debug', true);
mongoose.Promise = global.Promise;

//DB CONNECTION
mongoose.connect(`${mongo_uri}/${dbName}`)
  .then(() => {
    console.log(`Connected to ${dbName}`);
  })
  .catch(err => {
    console.log(err);
  });

app.set('view engine', 'handlebars')
app.engine('handlebars', handlebars.engine({
  layoutsDir: './views',
}));

//Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/img', express.static('public/images'));


//ROUTES
app.use('/user', userRoutes);
app.use('/question', questionRoutes);
app.use('/thread', threadRoutes);
app.use('/stats', statsRoutes);
app.use('/schedule', scheduleRoutes);

// 404 routes middlewares
app.use(notFoundError);
app.use(errorHandler);


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
})
