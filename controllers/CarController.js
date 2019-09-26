var express = require('express');
var router = express.Router();
var sequelize = require('../db');
var Car = sequelize.import('../models/car');
var User = sequelize.import('../models/user');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

const validateSession = require('../middleware/validate-session')



//http://localhost:3000/api/user
/*
{
    "username": "Shiraz",
    "password": "raz"
}
*/


//   api/user
router.post('/user', (req, res) => {
    User.create({
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, 10)
    })
    .then(
        createSuccess = (user) => {
            let token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: 60*60*24 })
            res.json({
                user: user,
                message: 'user created',
                sessionToken: token
            })
        },
        createError = err => res.send(500, err)
    )
})


//  /api/login
router.post('/login', (req, res) => {

    User.findOne({
        where: {
            username: req.body.username
        }
    })
    .then(user => {
        if(user){
            bcrypt.compare(req.body.password, user.password, (err, matches) => {
                if(matches){
                    let token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: 60*60*24 })
                    res.json({
                        user: user,
                        message: 'successfully authenticated user',
                        sessionToken: token

                    })
                }else {
                    res.status(502).send({ error: 'bad gateway' })
                }
            })
        }else {
            res.status(500).send({ error: 'failed to authenticate' })
        }
    err => res.status(501).send({ error: 'failed to process' })
    })
})



/*
{

    "car": "Lexus ES",
    "year": 2019,
    "transmission": "Automatic",
    "type": "Luxury",
    "city": "Indianapolis",
    "interior": "Leather",
    "color": "Pearl White",
    "owner": 1

}
*/

//    /api/car     (POST)
router.post('/car', validateSession, (req, res) => {
    const carRequest = {
        car: req.body.car,
        year: req.body.year,
        transmission: req.body.transmission,
        type: req.body.type,
        city: req.body.city,
        interior: req.body.interior,
        color: req.body.color,

        owner: req.user.id
    }

    Car.create(carRequest)
        .then(car => res.status(200).json(car))
        .catch(err => res.json(req.errors))

})

//      /api/car            (GET)
router.get('/car', function(req, res) {

    Car.findAll({ //1
          attributes: ['id', 'car', 'year', 'transmission', 'type', 'city', 'interior', 'color', 'owner']
      })
      .then(
          function findAllSuccess(carRequest) {
              console.log("Workout:", carRequest);
              res.json(carRequest);
          },
          function findAllError(err) {
              res.send(500, err.message);
          }
      );
  });




//     /api/car/:id    (GET)         
router.get('/car/:id', (req, res) => {
    Car.findOne({
        where: {id: req.params.id}
    })
    .then(car => res.status(200).json(car))
    .catch(err => res.status(500).json({
        error: err }))
})


//          /api/car/:id   (PUT)
router.put('/car/:id', (req, res) => {
    Car.update(req.body, {
        where: {id: req.params.id}})
        .then(car => res.status(200).json(car))
        .catch(err => res.json(req.errors))

    })



//          /api/car/:id   (DELETE)
router.delete('/car/:id', (req, res) => {
    Car.destroy({
        where: {
            id: req.params.id
        }
    })
    .then(car => res.status(200).json(car))
    .catch(err => res.json({
        error: err
    }))
})



module.exports = router;

