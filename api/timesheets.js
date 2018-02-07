const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
  const sql = 'SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId';
  const values = {$timesheetId: timesheetId};
  db.get(sql, values, (err, timesheet) => {
    if (err) {
      next(err)
    } else if (timesheet) {
      req.timesheet = timesheet;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});


timesheetsRouter.get('/', (req, res, next) => {
  const employeeId = req.params.employeeId;
  db.all(`SELECT * FROM Timesheet WHERE Timesheet.employee_id = ${employeeId}`, (err, timesheets) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({timesheets: timesheets});
    }
  });
});


timesheetsRouter.post('/', (req, res, next) => {
  const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date,
        employee_id = req.params.employeeId;
  if (!hours || !rate || !date || !employee_id) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO Timesheet (hours, rate, date, employee_id)' +
      'VALUES ($hours, $rate, $date, $employee_id)';
  const values = {
    $hours: hours,
    $rate: rate,
    $date: date,
    $employee_id: employee_id
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`,
        (error, timesheet) => {
          res.status(201).json({timesheet: timesheet});
        });
    }
  });
});


timesheetsRouter.put('/:timesheetId', (req, res, next) => {
  const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date,
        employee_id = req.params.employeeId;
  if (!hours || !rate || !date || !employee_id) {
    return res.sendStatus(400);
  }

  const sql = 'UPDATE Timesheet SET hours = $hours, rate = $rate, ' +
      'date = $date, employee_id = $employee_id ' +
      'WHERE Timesheet.id = $timesheetId';
  const values = {
    $hours: hours,
    $rate: rate,
    $date: date,
    $employee_id: employee_id,
    $timesheetId: req.params.timesheetId
  };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`,
        (error, timesheet) => {
          res.status(200).json({timesheet: timesheet});
        });
    }
  });
});


timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  const timesheetId = req.params.timesheetId;

  db.run(`DELETE FROM Timesheet WHERE Timesheet.id = ${timesheetId}`, (error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  });
});


module.exports = timesheetsRouter;
