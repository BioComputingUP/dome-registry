# *Get started with the* *[DOME Registry](registry.dome-ml.org)*

Our repository is devided into 3 parts:
- dome-registry-core (shared logic between frontend and backend)
- dome-registry-ui (backend)
- dome-registry-ws (frontend) 



## *Installation*

Clone the github [Repository](https://github.com/BioComputingUP/dome-registry/)


```sh
git clone git@github.com:BioComputingUP/dome-registry.git
cd dome-registry
```

## 1. Install dependencies for dome-registry-core

```sh
cd dome-registry-core/
nvm use
npm install
# Create a symlink in the global node_modules
npm link
cd ..
```
## 2. Install dependencies for dome-registry-ui

```sh
cd dome-registry-ui/
nvm use
npm install
#Link the core repo for the connection between the frontend and the backend
npm link dome-registry-core
cd ..
```
### Build UI (to be served by Apache or nginx)
```sh
npm run build-dev
# This command will produce a 'dist' folder with index.html and associated files. Point the Apache virtual host or nginx server block to the 'dist' folder to serve it properly in a production environment
```
## 3. Install dependencies for dome-registry-ws

```bash
cd dome-registry-ws/
nvm use
npm install
# Link the core repo for the connection between the frontend and the backend
npm link dome-registry-core
cd ..
```


## launching the frontend and the backend 
### frontend
```sh
cd dome-registry-ui
nvm use
npm run start-dev
# open http://localhost:4200/
```
### Backend
```sh
cd dome-registry-ws
nvm use
npm run start:dev
```


## License

[MIT](https://choosealicense.com/licenses/mit/)
