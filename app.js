const express = require('express')
const app = express()
app.use(express.json())
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const dbpath = path.join(__dirname, 'moviesData.db')
let db = null

const intialixzeDB = async () => {
  db = await open({filename: dbpath, driver: sqlite3.Database})
  app.listen(3000)
}
intialixzeDB()

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `SELECT movie_name FROM movie;`
  const moviesArray = await db.all(getMoviesQuery)
  response.send(
    moviesArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const addMovieQuery = `INSERT INTO movie(director_id,movie_name,lead_actor)
  VALUES (${directorId},'${movieName}','${leadActor}');`
  const dbResponse = await db.run(addMovieQuery)
  const movieId = dbResponse.lastID
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const specificQuery = `SELECT * FROM movie WHERE movie_id=${movieId};`
  const singledata = await db.get(specificQuery)
  const result = [singledata]
  const finalresult = result.map(singleinf => ({
    movieId: singleinf.movie_id,
    directorId: singleinf.director_id,
    movieName: singleinf.movie_name,
    leadActor: singleinf.lead_actor,
  }))
  response.send(finalresult[0])
})

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const updateMovieQuery = `UPDATE movie SET director_id=${directorId},movie_name='${movieName}',lead_actor='${leadActor}';`
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteQuery = `DELETE FROM movie WHERE movie_id=${movieId};`
  await db.run(deleteQuery)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `SELECT * FROM director;`
  const directorArray = await db.all(getDirectorsQuery)
  response.send(
    directorArray.map(eachdirector => ({
      directorId: eachdirector.director_id,
      directorName: eachdirector.director_name,
    })),
  )
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const allMovieQuery = `SELECT movie_name FROM movie WHERE director_id=${directorId};`
  const dbMovieQuery = await db.all(allMovieQuery)
  response.send(dbMovieQuery.map(each => ({movieName: each.movie_name})))
})

module.exports = app
