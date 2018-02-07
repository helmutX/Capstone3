const express = require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const timesheetsRouter = require('./timesheets');

employeesRouter.param('employeeId', (req, res, next, employeeId) => {
  const sql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
  const values = {$employeeId: employeeId};
  db.get(sql, values, (err, employee) => {
    if (err) {
      next(err)
    } else if (employee) {
      req.employee = employee;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

employeesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Employee WHERE Employee.is_current_employee = 1', (err, employees) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({employees: employees});
    }
  });
});

employeesRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).json({employee: req.employee});
});

employeesRouter.post('/', (req, res, next) => {
  const name = req.body.employee.name,
        wage = req.body.employee.wage,
        position = req.body.employee.position,
        is_current_employee = req.body.employee.is_current_employee === 0 ? 0 : 1;
  if (!name || !wage || !position || !is_current_employee) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO Employee (name, wage, position, is_current_employee)' +
      'VALUES ($name, $wage, $position, $is_current_employee)';
  const values = {
    $name: name,
    $wage: wage,
    $position: position,
    $is_current_employee: is_current_employee
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`,
        (error, employee) => {
          res.status(201).json({employee: employee});
        });
    }
  });
});

employeesRouter.put('/:employeeId', (req, res, next) => {
  const name = req.body.employee.name,
        wage = req.body.employee.wage,
        position = req.body.employee.position,
        is_current_employee = req.body.employee.is_current_employee === 0 ? 0 : 1;
  if (!name || !wage || !position) {
    return res.sendStatus(400);
  }

  const sql = 'UPDATE Employee SET name = $name, wage = $wage, ' +
      'position = $position, is_current_employee = $is_current_employee ' +
      'WHERE Employee.id = $employeeId';
  const values = {
    $name: name,
    $wage: wage,
    $position: position,
    $is_current_employee: is_current_employee,
    $employeeId: req.params.employeeId
  };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
        (error, employee) => {
          res.status(200).json({employee: employee});
        });
    }
  });
});

employeesRouter.delete('/:employeeId', (req, res, next) => {
  const sql = 'UPDATE Employee SET is_current_employee = 0 WHERE Employee.id = $employeeId';
  const values = {$employeeId: req.params.employeeId};

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
        (error, employee) => {
          res.status(200).json({employee: employee});
        });
    }
  });
});

module.exports = employeesRouter;
