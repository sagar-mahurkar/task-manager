# Important Commands Followed

```bash
# create a git repository to GitHub
# clone repository to the working directory
git clone https://github.com/sagar-mahurkar/task-manager.git
# check if the remote is present and correct
git remote -v
```

```bash
# create .gitignore file and add /node_modules to it
touch .gitignore
```

```bash
# initialize node project
npm init -y
# install dependencies
npm install express
# install devDependencies
npm install --save-dev @types/express @types/node nodemon ts-node typescript
tsc --init
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "esModuleInterop": true
  }
}
```
