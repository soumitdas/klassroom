# Klassroom

<p align="center">
  <img alt="screenshot of Klassroom" src="https://i.imgur.com/MnHKpUg.jpg">
</p>

![GitHub language count](https://img.shields.io/github/languages/count/soumitdas/klassroom) ![GitHub top language](https://img.shields.io/github/languages/top/soumitdas/klassroom) ![Website](https://img.shields.io/website?url=https%3A%2F%2Fklassroom-demo.web.app%2F)

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Technology Stack](#technology-stack)
- [Run Locally](#run-locally)
- [Future Scope](#future-scope)
- [License](#license)
- [Disclaimer](#disclaimer)
- [Useful Links](#useful-links)

## Features

- Admin can add students and teachers
- Teachers can add students, create lectures, give and mark assignments
- Student can view lectures, can view and submit assignments
- Dedicated discussion forum for each classroom

## Demo

You can use the below credentials to explore **Klassroom**.

### Demo Credentials

#### Student
- Email: demo@example.com
- Password: superSecret56

#### Teacher
- On request

#### Admin
- On request

### [Click here](https://klassroom-demo.web.app/) for the Live Demo

## Technology Stack
- VueJS 2.x
- Bulma CSS
- Buefy
- Firebase

## Run Locally

### Prerequisites

To run this project locally one should have -

- A Firebase project created (Refer [Firebase Docs](https://firebase.google.com/docs/web/setup) for more)

### Get the repo

Download the .zip file from Github or run the below command to clone the repo locally.

```bash
git clone https://github.com/soumitdas/klassroom.git
```

### Install dependencies

After cloning the repo, run the following commands to install the project dependencies:

```bash
# for Vue app
yarn install

# for Cloud functions
cd functions && npm install
```

### Set environment

Set the environment variable in `.env` file at root directory.

```bash
VUE_APP_BASE_URL=http://localhost:8080/
VUE_APP_FIREBASE_CONFIG=paste_stringified_firebase_config_object_here
```

### Deploy Cloud Functions

- Install the Firebase CLI
- Setup the CLI using `firebase login` (refer [docs](https://firebase.google.com/docs/cli))
- Run the following commands to deploy functions

```bash
firebase deploy --only functions
```

### Deploy firestore & storage security rules

```bash
firebase deploy --only firestore
firebase deploy --only storage
```

### Run

```bash
yarn serve
# Vue App will start at PORT 8080
```

## Future Scope
- Push / Email notification
- Rich text support
- More data in dashboard
- Report generation

## License

Klassroom is [MIT licensed](http://opensource.org/licenses/MIT).

## Disclaimer

This project is in a very basic stage and might have severe bugs and vulnerabilities, so please keep that in mind when deploying it to production.

## Useful Links

- [Vue](https://vuejs.org/)
- [Firebase](https://firebase.google.com)
- [Bulma](https://bulma.io/)
- [Base Template - Admin Two](https://github.com/vikdiesel/admin-two-vue-bulma-dashboard)
