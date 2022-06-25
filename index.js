const express = require('express')
const app = express()
const data = require('./appointments.json')
const fs = require('fs');

app.get('/api/doctors', (req,res) => {
  const doctorsArray = [];
  for (let i = 0; i < data.doctors.length; i++) {
    doctorsArray.push(data.doctors[i].name)
  }
  res.status(200).json(doctorsArray)
});

app.get('/api/appointments/:doctorId/:date', (req, res) => {
  const doctorId = Number(req.params.doctorId);
  const date = req.params.date;
  const appointmentsArray = []
  for (let i = 0; i < data.appointments.length; i++) {
    if (doctorId === data.appointments[i].assignedDoctor && date === data.appointments[i].date) {
      appointmentsArray.push(data.appointments[i])
    }
  }
  res.status(200).json(appointmentsArray)
});

app.delete('/api/appointments/:appId', (req, res) => {
  const appId = Number(req.params.appId);
  for (let i = 0; i < data.appointments.length; i++) {
    if (appId === data.appointments[i].id) {
      delete data.appointments[i];
      fs.writeFile('./appointments.json', JSON.stringify(data, null, 2), err => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'An unexpected error occurred.' });
      } else {
        res.sendStatus(204);
      }
    });
  }
}});

app.post('/api/appointments', (req, res) => {
  const newApp = req.body
  try {
    let newAppTime = newApp.time.split(':')
    for (let i = 0; i < data.appointments.length; i++) {
      let currentAppTime = data.appointments[i].time.split(':')
      if (Number(newAppTime[0]) === Number(currentAppTime[0]) && Number(newAppTime[1].slice(0,2)) > Number(currentAppTime[1].slice(0,2)) && Number(newAppTime[1].slice(0,2)) < Number(currentAppTime[1].slice(0,2))) {
        throw 'App times must be 15 min or later'
    }}

      const appsWithSameTime = []
      for (let i = 0; i < data.appointments.length; i++) {
        if (newApp.assignedDoctor === data.appointments[i].assignedDoctor && newApp.date === data.appointments[i].date && newApp.time === data.appointments[i].time) {
          appsWithSameTime.push(data.appointments[i])
        }
      }
      if (appsWithSameTime >= 3) {
        throw 'Max timeslots taken'
      }

      data.appointments.push(newApp);
      data.nextAppId++;
      fs.writeFile('./appointments.json', JSON.stringify(data, null, 2), err => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'An unexpected error occurred.' });
        } else {
          res.status(201).json(newApp);
        }
      });
    }

    catch(err) {
      res.status(400).json(err)
    }
  });


app.listen(3000, () => {
  console.log('Listening on port 3000');
});
