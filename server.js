const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('./db'); // Импортируйте ваше соединение с БД

app.use(bodyParser.json());

// Путь для получения всех элементов
app.get('/getAllItems', (req, res) => {
    db.query('SELECT * FROM Items', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// Путь для добавления элемента
app.post('/addItem', (req, res) => {
    const { name, desc } = req.query;
    if (!name || !desc) return res.json(null);

    db.query('INSERT INTO Items (name, desc) VALUES (?, ?)', [name, desc], (err, results) => {
        if (err) return res.status(500).json({ error: err });

        const newItem = { id: results.insertId, name, desc };
        res.json(newItem);
    });
});

// Путь для удаления элемента
app.post('/deleteItem', (req, res) => {
    const { id } = req.query;
    if (!id) return res.json(null);

    db.query('DELETE FROM Items WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json({});
    });
});

// Путь для обновления элемента
app.post('/updateItem', (req, res) => {
    const { id, name, desc } = req.query;
    if (!id || !name || !desc) return res.json(null);

    db.query('UPDATE Items SET name = ?, desc = ? WHERE id = ?', [name, desc, id], (err, results) => {
        if (err) return res.status(500).json({ error: err });

        if (results.affectedRows === 0) return res.json({});
        
        const updatedItem = { id, name, desc };
        res.json(updatedItem);
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});