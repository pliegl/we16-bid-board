#BIG Bid Board Application (B3A) - Frontend

The BIG Board Application provides a Web Interface for viewing and editing the bid items, stored on the server.

It is designed as single page application using [react.js](https://facebook.github.io/react/).

##Getting started with development

 - Initialize the repository using `npm install`
 - Start the server backend (see [backend documentation](../server))
 - Start the webpack development server using `npm start`

##Creating the final artifact

 - Bundle the final artifact using `npm run-script build`. Please note that you might have to run this command as `su`, since the final `bundle.js` artifact will be copied to the `/static` folder of the server backend (the server backend also serves the website). The copy command will only work on UNIX-based OS - if you are on Windows, ignore the error and manually copy the final `bundle.js` to `/static/build/bundle.js`.
