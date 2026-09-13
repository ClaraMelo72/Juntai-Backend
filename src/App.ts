import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import { investidorRoutes } from '@modules/investidores/routes/investidor.routes';  
import { startupRoutes } from '@modules/startups/routes/startup.routes';             

class App {
  public express: Application;

  constructor() {
    this.express = express();
    this.middlewares();
    this.routes();
  }

  private middlewares(): void {
    this.express.use(cors());
    this.express.use(express.json());
  }

  private routes(): void {
    this.express.get('/', (req, res) => {
      res.send('Juntai-Backend está no ar 🚀');
    });

    this.express.use('/investidores', investidorRoutes);   
    this.express.use('/startups', startupRoutes);           
  }
}

export default new App().express;