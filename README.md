# Golden Raspberry Awards API - Worst Movie

This project is a NestJS-based server-side application that provides a RESTful API for reading the list of nominees and winners of the Worst Picture category of the Golden Raspberry Awards. The API provides endpoints to obtain the producer with the longest interval between two consecutive awards and the one who received two awards the fastest. The APIs are implemented following [Level 2 of the Richardson Maturity Model](https://martinfowler.com/articles/richardsonMaturityModel.html). It is built using TypeScript and TypeORM.


## Prerequisites

- Node.js (>= 14.x)
- npm (>= 6.x)

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/tiagorgt/worst-movie-awards.git
    cd worst-movie-awards
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

## Running the app

1. Start the application:
    ```bash
    npm run start
    ```

2. The API will be available at `http://localhost:3000`.

## Running integration tests (e2e)

1. Run the e2e tests:
    ```bash
    npm run test:e2e
    ```

## API Documentation

### Get All Movies

- **Endpoint**: `GET /movies`
- **Description**: Retrieve a list of all movies.
- **Response**:
    ```json
    [
      {
        "id": 1,
        "title": "Movie 1",
        "year": 2000,
        "producers": "Producer 1",
        "studios": "Studio 1",
        "winner": true
      },
      ...
    ]
    ```

### Get Movie by ID

- **Endpoint**: `GET /movies/:id`
- **Description**: Retrieve a movie by its ID.
- **Response**:
    ```json
    {
      "id": 1,
      "title": "Movie 1",
      "year": 2000,
      "producers": "Producer 1",
      "studios": "Studio 1",
      "winner": true
    }
    ```

### Create a Movie

- **Endpoint**: `POST /movies`
- **Description**: Create a new movie.
- **Request**:
    ```json
    {
      "title": "New Movie",
      "year": 2021,
      "producers": "New Producer",
      "studios": "Studio 1",
      "winner": false
    }
    ```
- **Response**:
    ```json
    {
      "id": 1,
      "title": "New Movie",
      "year": 2021,
      "producers": "New Producer",      
      "studios": "Studio 1",
      "winner": false
    }
    ```

### Update a Movie

- **Endpoint**: `PUT /movies/:id`
- **Description**: Update an existing movie.
- **Request**:
    ```json
    {
      "title": "Updated Movie",
      "year": 2021,
      "producers": "Updated Producer",
      "studios": "Studio 1",
      "winner": false
    }
    ```
- **Response**:
    ```json
    {
      "id": 1,
      "title": "Updated Movie",
      "year": 2021,
      "producers": "Updated Producer",
      "studios": "Studio 1",
      "winner": false
    }
    ```

### Delete a Movie

- **Endpoint**: `DELETE /movies/:id`
- **Description**: Delete a movie by its ID.
- **Response**: 204 - No Content

### Get Producers with Intervals

- **Endpoint**: `GET /movies/producers/intervals`
- **Description**: Retrieve the producer with the longest interval between two consecutive awards and the one who received two awards the fastest.
- **Response**:
    ```json
    {
      "min": [
        {
          "producer": "Producer 1",
          "interval": 1,
          "previousWin": 2008,
          "followingWin": 2009
        },
        ...
      ],
      "max": [
        {
          "producer": "Producer 1",
          "interval": 99,
          "previousWin": 1900,
          "followingWin": 1999
        },
        ...
      ]
    }
    ```

## Notes

- The data is imported from a CSV file located at `src/data/movies.csv` when the application starts.
- The database is reset before each integration test to ensure test isolation.