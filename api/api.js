const express = require('express');
const apiRouter = express.Router();
const employeesRouter = require('./employees');
const timesheetsRouter = require('./timesheets');
const menusRouter = require('./menus');
const menuItemsRouter = require('./menu-items');

apiRouter.use('/employees', employeesRouter);
apiRouter.use('/timesheets', timesheetsRouter);
apiRouter.use('/menus', menusRouter);
apiRouter.use('/menu-items', menuItemsRouter)

module.exports = apiRouter;
