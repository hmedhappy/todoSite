const express = require('express');
const mysql = require('mysql');
const path = require('path') ;
const app = express();
var bodyParser = require('body-parser');

//view engine setup // var bodyParser = require('body-parser');
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Create Connection
//Configuratiion
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'login'
});
//Connect
conn.connect(function (err) {
    if (err) throw err;
    console.log("Connected to Database");
});

app.get('/',(req,res)=>{
   res.render('login');
})


//undate a todo 
app.get('/testtodo', (req, res) => {
    let username = 2 ;
    let id = 1;
    let contenu = "j'ajoute un nouveau utilisateur avec son todo";
    let description = "i am a new user with new todo"
    let newTodo = {"id":id,"contenu":contenu,"description":description} ;

    //getting req from DB

    let sql=`SELECT user,id from todouser WHERE id=${id}`
    let query = conn.query(sql,(err,result)=>{
        if(err)throw err ; 
        /* obj = JSON.parse(result[0].user) ;
        console.log(obj);
        console.log(obj.todolist); */
       console.log(result[0].id);
       

        res.send('todo');
    })

    
});



app.post('/auth', function (req, res) {
    let username = req.body.username;
    let password = req.body.password;
    if (username && password) {
        conn.query('SELECT user,id FROM todouser WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
            if (results.length > 0) {
                    obj = JSON.parse(results[0].user);
                    iduser = results[0].id;
                
                    res.render('todo',{obj,iduser})
            } else {
                    res.send('Incorrect Username and/or Password!');
            }
            res.end();
        });
    } else {
        res.send('Please enter Username and Password!');
        res.end();
    }
});

app.get('/sign',(req,res)=>{
    res.render('sign');
});

app.post('/register', function (req, res) {
    let username = req.body.username;
    let password = req.body.password;
    let newtodo = {
        name: req.body.name,
        date: "1999-11-30T23:00:00.000Z",
        password: password,
        todolist: [
            {
                "id": "1",
                "contenu": "Votre premier TodoList",
                "status": true
            }, 
            {
                "id": "1",
                "contenu": "Voici Votre premier DoneList",
                "status": false
            }
        ]
    } ;
    json = JSON.stringify(newtodo);
    // Adding the new user in the database ;
     conn.query('INSERT INTO todouser VALUES (?,?,?,?)', [,username, password ,json]) ;


         let sql = `SELECT user,id FROM todouser WHERE username = '${username}' AND password = '${password}'`
          var query = conn.query(sql, (err, result) => {
            if (err) throw err;
    
             var obj = JSON.parse(result[0].user);
             var iduser = result[0].id;
             res.render('todo', { obj, iduser })
            
    obj = JSON.parse(result[0].user);
    iduser = result[0].id;
    res.render('todo', { obj, iduser })
}); 

});



app.listen(2000, () => console.log('Server started on 2000'));
