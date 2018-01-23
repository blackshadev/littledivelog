import * as pRouter from "express-promise-router";
import { Router as eRouter } from "express";
export const Router = (pRouter as any) as () => eRouter;
