const express = require('express');
const mysql = require('mysql');
const path = require('path') ;
const app = express();
var User = require('./models/User') ;
var router = express.Router();
var bodyParser = require('body-parser');
var request = require('request');
var moment = require('moment')
var uuid = require('uuid') ;

const mongoose = require('mongoose');
//Connect To DB
mongoose.connect(
    'mongodb+srv://hmedhappy:karirinkute@0@cluster0-acekd.mongodb.net/hmidb?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true ,useCreateIndex: true},
    ()=>{
    console.log('Connected To HmiDB');
    
});
require('dotenv/config');





//view engine setup // var bodyParser = require('body-parser');
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine','ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* //Create Connection 
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
}); */

//router
app.get('/',(req,res)=>{
   res.render('login');
});
app.get('/sign',(req,res)=>{
    res.render('sign');
});
app.get('/auth',(req,res)=>{
    res.render('todo');
});

//Adding Todo 
app.post('/addtodo/',(req,res,next)=>{
    userid = req.query.id;
    if (req.query.id ){
        
        conn.query('SELECT user FROM todouser WHERE id= ?', [userid], function (error, results, fields) {
            if(error)throw error ;
            console.log(results) ;
            obj = JSON.parse(results[0].user);

            let newtodo = {
                "id":uuid.v4(),
                "contenu":req.body.todo,
                "date": moment().format('llll'),
                "datef":"",
                "status":false 
            }
            copyoftodolist = obj.todolist ;
            copyoftodolist.push(newtodo);
            obj.todolist= copyoftodolist ;
            sendtodo =[JSON.stringify(obj)];

            conn.query('UPDATE todouser SET user=? WHERE id= ?', [sendtodo,userid]);

            
        
            iduser = userid;
             res.redirect('/auth');
        });
    }
    
        
 });
//Deleting Todo 
app.get('/deletetodo/',(req,res,next)=>{
    userid = req.query.id;
    todoid = req.query.idtodo;
    if (req.query.id ){
        
        conn.query('SELECT user FROM todouser WHERE id= ?', [userid], function (error, results, fields) {
            if(error)throw error ;
            console.log(results) ;
            obj = JSON.parse(results[0].user);
            
            copyoftodolist = obj.todolist ;
            newtodo = copyoftodolist.filter(function(value){return value.id != todoid});
            obj.todolist= newtodo ;
            sendtodo =[JSON.stringify(obj)];

            conn.query('UPDATE todouser SET user=? WHERE id= ?', [sendtodo,userid]);

            console.log(sendtodo) ;

        
            iduser = userid;
             res.redirect('auth') ;
        });
    }
    
        
 });
 //Update Todo 
app.post('/updatetodo/',(req,res,next)=>{
    userid = req.query.id;
    changed = req.body.name
    if (req.query.id ){
        
        conn.query('SELECT user FROM todouser WHERE id= ?', [userid], function (error, results, fields) {
            if(error)throw error ;
            obj = JSON.parse(results[0].user);
            copyoftodolist = obj.todolist ;

            app.get('/getindex',(reqq,ress,next)=>{    
                
                todoid = reqq.query.idtodo;  
                
            
                copyoftodolist.forEach(element => {
                    if (element.id == todoid) {
                        element.contenu = changed;
                    }
                });
                obj.todolist= copyoftodolist ;
            sendtodo =[JSON.stringify(obj)];
            conn.query('UPDATE todouser SET user=? WHERE id= ?', [sendtodo,userid]);
            console.log(sendtodo) ;
            console.log("l id du todo est",todoid);


            iduser = userid;
            res.render('todo',{obj,iduser}) ;
            ress.render('todo',{obj,iduser}) ;
            }) ;  
             
        });
    }
    
        
 });
 //Done Todo 
app.get('/donetodo/',(req,res,next)=>{
    userid = req.query.id;
    todoid = req.query.idtodo;
    if (req.query.id ){
        
        conn.query('SELECT user FROM todouser WHERE id= ?', [userid], function (error, results, fields) {
            if(error)throw error ;
            console.log(results) ;
            obj = JSON.parse(results[0].user);
            
            copyoftodolist = obj.todolist ;
            copyoftodolist.forEach(element => {
                if (element.id == todoid) {
                    element.status = true ;
                    element.datef = moment().format('llll');
                }
            });
            obj.todolist= copyoftodolist ;
            sendtodo =[JSON.stringify(obj)];

            conn.query('UPDATE todouser SET user=? WHERE id= ?', [sendtodo,userid]);

            console.log(sendtodo) ;

        
            iduser = userid;
             res.redirect('/auth') ;
        });
    }
    
        
 });

 // Get projects
 app.get('/projects', function (req, res) {
    conn.query('SELECT project,members FROM projects ', function (error, results, fields) {
        //Showing Members of the project ARRAY
       console.log(results);
       
         
         
     res.render('projet',{results})
 })

 });


//Authentification
app.post('/auth', function (req, res) {
    let username = req.body.username;
    let password = req.body.password;
    if (username && password) {
        if (username == "admin" && password == "admin") {
            conn.query('SELECT * FROM todouser ', function (error, results, fields) {

            res.render('admin',{results})
        })
        }else
        conn.query('SELECT user,id FROM todouser WHERE username = ? AND password = ?', [username, password], function (error, results, fields) {
            if (results.length > 0) {
                    obj = JSON.parse(results[0].user);
                    iduser = results[0].id;
                    res.render('todo',{obj,iduser});
                    
            } else {
                    res.send('Incorrect Username and/or Password!');
            }
            
        });
    } else {
        res.send('Please enter Username and Password!');
    }
});
//Registeration
app.post('/register', async  (req, res) =>{
    //preparing DATA to Database
    let username = req.body.username;
    let password = req.body.password;
    let project = req.body.project;
    let newtodo = {
        name: req.body.name,
        "date": moment().format("MMM Do YY"),
        password: password,
        todolist: [
             {
                "id": uuid.v4(),
                "contenu": "Votre premier TodoList",
                "date": moment().format('llll'),
                "status": true
            }, 
            {
                "id": uuid.v4(),
                "contenu": "Voici Votre premier DoneList",
                "date": moment().format('llll'),
                "status": false
            } 
        ]
    } 
    // Adding the new user in the database ;
    const user = new User({
        username : username,
        password : password,
        user : newtodo,
        project : project
    });
    try {
        const saveduser = await user.save();
        console.log('User Inserted...');
        const userdata = await User.findOne({username:username}) ;
        console.log('the user data : ',userdata);
        var obj = userdata.user;
        var iduser = userdata.id;
        res.render('todo', { obj, iduser })
    } catch (err) {
        res.json({message : err});
    }

    
    //conn.query('INSERT INTO todouser VALUES (?,?,?,?,?)', [,username, password ,json,project]) ;


        // let sql = `SELECT user,id FROM todouser WHERE username = '${username}' AND password = '${password}'`
        /*   var query = conn.query(sql, (err, result) => {
            if (err) throw err;
    
             var obj = JSON.parse(result[0].user);
             var iduser = result[0].id;
             res.render('todo', { obj, iduser })
            
    obj = JSON.parse(result[0].user);
    iduser = result[0].id;
    res.render('todo', { obj, iduser })
});  */

});

//Test MongoDb 


app.post('/mongo',(req,res)=>{

    var newuser = new User();
    newuser.username = 'vraiment';
    newuser.password = 'vrm pass';
    newuser.user = 'vraiment test' ;
    newuser.project = 'vrim project' ;

    newuser.save(function(err, savedUser){
        if(err){
            console.log(err);
            return res.status(500).send('mch bon');
        
        }
        return res.status(200).send('c bonnnnnnnn');
    })
})



app.listen(2000, () => console.log('Server started on 2000'));
