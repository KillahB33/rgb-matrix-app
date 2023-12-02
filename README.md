# Getting Started with RGB Matrix App

When this app was created, the goal was to have it running on the same pi as the matrix, but because of hardware limitations I couldn't get it to run. So this project was born, it can live on any server you want and run, while your pi is running somewhere else with the matrix library installed.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode (currently how the docker setup runs).\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

## Docker-compose

As mentioned before this was built to run as a docker container, below is the compose used.
Volume mount is present because the gifs being displayed will disappear if the container gets recreated.

```yaml
version: '3.8'
services:
  rgbmatrix:
    image: rgbmatrix
    container_name: rgbmatrix
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/Toronto
      - SSH_host=<ip of pi rgbmatrix>
      - SSH_user=<pi user>
      - SSH_pass=<pi password>
      - SSH_pipath=/home/dietpi/rpi-rgb-led-matrix #path on the pi where the library was cloned
    volumes:
      - /opt/images:/app/public/images #path where images for ui are stored
    ports:
      - 3030:3030 #port for Node
      - 3031:3000 #port for React
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "--fail", "http://localhost:3030/health"]
      interval: 10s
      timeout: 5s
      retries: 3
```
