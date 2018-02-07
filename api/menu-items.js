const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
  const sql = 'SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId';
  const values = {$menuItemId: menuItemId};
  db.get(sql, values, (err, menuItem) => {
    if (err) {
      next(err)
    } else if (menuItem) {
      req.menuItem = menuItem;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menuItemsRouter.get('/', (req, res, next) => {
  const menuId = req.params.menuId;
  db.all(`SELECT * FROM MenuItem WHERE MenuItem.menu_id = ${menuId}`, (err, menuItems) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({menuItems: menuItems});
    }
  });
});

menuItemsRouter.post('/', (req, res, next) => {
  const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price;
        menu_id = req.params.menuId;
  if (!name || !description || !inventory || !price || !menu_id) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id)' +
      'VALUES ($name, $description, $inventory, $price, $menu_id)';
  const values = {
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price,
    $menu_id: menu_id
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`,
        (error, menuItem) => {
          res.status(201).json({menuItem: menuItem});
        });
    }
  });
});

    menuItemsRouter.put('/:menuItemId', (req, res, next) => {
      const name = req.body.menuItem.name,
            description = req.body.menuItem.description,
            inventory = req.body.menuItem.inventory,
            price = req.body.menuItem.price;
            menu_id = req.params.menuId;
      if (!name || !description || !inventory || !price || !menu_id) {
        return res.sendStatus(400);
      }

      const sql = 'UPDATE MenuItem SET name = $name, description = $description, ' +
          'inventory = $inventory, price = $price, menu_id = $menu_id ' +
          'WHERE MenuItem.id = $menuItemId';
      const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menu_id: menu_id,
        $menuItemId: req.params.menuItemId
      };

      db.run(sql, values, (error) => {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`,
            (error, menuItem) => {
              res.status(200).json({menuItem: menuItem});
            });
        }
      });
    });


menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
  const menuItemId = req.params.menuItemId;

  db.run(`DELETE FROM MenuItem WHERE MenuItem.id = ${menuItemId}`, (error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = menuItemsRouter;
