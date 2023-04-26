#Testing for the Winter/Summer Credit max bugfix

# Steps to get started
1: Navigate to the schedule page on the app.
2: Open up the courselist within the schedule page.
3: Drag and Drop any course selected onto either Winter or Summer semesters.
4: Try and reach the maximum possible credits to check for the credit max.

# What should happen.
- On the Winter Semester, the High Warning should appear for reaching higher than 4 total credits
- On the Summer Semester, the High Warning should appear for reaching higher than 12 total credits.
- Note that there is NO lower limit for either Winter or Summer semesters and should not appear unlike Fall and Spring.
- A special error icon should appear next to the name displaying a Warning Amber. A tooltip will also
appear after hovering over the icon.