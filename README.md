# Four Year Schedule Planner
This is a web-based scheduling application designed for University of Wisconsin-Stout students who wish to create a personalized academic plan for a specific program offered by the institution.

The application features:
- A user-friendly interface
- Ability to create a four-year plan or a plan spanning a custom number of years 
- Ability to save schedules for future reference or editing
- Pre-generated four-year plans that are available to help aid in the planning process
- Tools aimed at ensuring all mandatory requirements mandated by UW-Stout are met.
    - A requirments side bar with a dynamically updating percentages
    - Can be expanded to show more information.

The application is publicly accessible and free to use. Its responsive design makes it accessible on both desktop and mobile devices
(so long as it has access to a mouse), providing a modern UI that is optimized for a variety of platforms.
## Development resources
- The internet

### Links

- [Confluence](https://schedule-planner-capstone.atlassian.net/l/cp/Aw0TPPu3)
- [Jira](https://schedule-planner-capstone.atlassian.net/jira/software/projects/TIME/boards/2)

## Running

First, you need [Node.js](https://nodejs.org/en/download/) installed.

To update locally installed dependencies, run `npm install`. This needs to be
run at least once before the project can be run locally.

To run the local dev server, `npm run dev`. This will run the dev server on
[localhost:3000](http://localhost:3000/).

### Repository Structure

Next.js structures the repository a little bit differently than plain React.

- `pages/`: Contains all of the processed typescript to render each page
- `public/`: Contains unprocessed files (e.g. images, etc)
- `styles/`: Contains CSS files


