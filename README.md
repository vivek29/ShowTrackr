# ShowTrackr---MEAN

Create a TV Show Tracker using MEAN stack.

- The front-end is built using AngularJS and Bootstrap Sass.

- Used AngularStrap to Add quick, dynamic navbar functionality to transition through active/inactive states.
(Preferred over Bootstrap NavBar, so that the active class is applied automatically to the "li" elements when we change routes. Also other advantages like awesome directives that integrate with AngualrJS such as Alert, Typeahead, Tooltip, Tab and many more.)

- Use Gulp to compile Sass stylesheets. 
(Gulp is a fast and intuitive streaming build tool built on Node.js and is same as Grunt with some advantages)

- Use Mongoose for the MongoDB ODM. (Mongoose is a Node.js library that provides MongoDB object mapping similar to ORM with a familiar interface within Node.js.)

- Password Authentication with Mongoose - use bcrypt.js (for password hashing)

- Use xml2js parser for  XML to JavaScript object converter (It normalize all tags to lowercase and disable conversion to arrays when there is only one child element.)

- Use async, for managing multiple aynsc operations. (async.waterfall)

- Use lodash dependency (js utility lib) for delivering consistency, modularity, performance, & extras.

- The poster are stored as Base64 images in MongoDB (although it has a disadvantage that  each image is about 30% larger in the Base64 form).

- Use moment.js to output a more friendly date (like in 6 hours or in 5 days)

- Use ng-Messages for rending error messages in forms

- Use JSON Web Token(jwt) authentication instead of cookie-based approach

- Login with Facebook/Google

- Use ngAnnotate instead of ngMin for AngularJS dependencies annotations

- Use promises instead of callbacks for $resource.save method

- For sending email notifications - use Agenda, Sugar.js and nodemailer

- Optimization of code using gulp.js
Concatenate and minify the scripts, Minify the stylesheet and Cache AngularJS templates 

- The optimization creates 2 scripts which are app.min.js and templates.js







