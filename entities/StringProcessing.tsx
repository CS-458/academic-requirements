/*
    Class responsible for all prerequisite and requirement checking
*/
class StringProcessing {
  // Checks if a list of courses satisfies the necessary course requirements/prerequisites

  // param compareString -> the string that has requirements/prerequisites that must be satisfied
  // param coursesList -> the array of strings that have courses taken
  // optional param concurrentCoursesList -> array of strings that have courses taken concurrently
  courseInListCheck(
    compareString: string,
    coursesList: string[],
    concurrentCoursesList: string[] | undefined
  ): { returnValue: boolean; failedString: string } {
    // Boundary Conditions
    if (
      compareString === "" ||
      compareString === null ||
      compareString === undefined
    ) {
      return { returnValue: true, failedString: "" }; // nothing to compare to, so it must be true (essentially means no prerequisites)
    }
    if (
      coursesList.length === 0 ||
      coursesList === null ||
      coursesList === undefined
    ) {
      // Since there exists at least one course to compare, if coursesList is empty,
      // then the course is not in the list
      return {
        returnValue: false,
        failedString: this.prettyFailedString(compareString)
      };
    }

    // Force each string to have underscores instead of dashes and remove any duplicates
    const courses = this.removeDuplicates(
      this.replaceDashesWithUnderscores(coursesList)
    );
    const concurrentCourses = this.removeDuplicates(
      this.replaceDashesWithUnderscores(concurrentCoursesList ?? [])
    );

    // Step 1: split the string by commas (required courses)
    // Every string in splitStringAND must be true
    const splitStringAND = compareString.replace(/-/g, "_").split(",");
    let returnValue = true;
    let failedString = "";

    splitStringAND.forEach((compareAND) => {
      // If the string has a '|' or '&', it is not simplified...
      if (compareAND.search(/&|\|/) > 0) {
        // Step 2: split the string by vertical bars (this OR that courses)
        // Only one of the strings in splitStringOR must be true
        let orSatisfied = false;
        const splitStringOR = compareAND.split("|");
        splitStringOR.forEach((compareOR) => {
          // Check every string in OR until one of the strings is true
          if (!orSatisfied) {
            // If the string has an '&', it is not simplified...
            if (compareOR.search(/&/) > 0) {
              // Step 3: split the string by ampersand symbols (& -> representing SUBAND)
              let subandSatisfied = true;
              const splitStringSUBAND = compareOR.split("&");

              // Check if any of the courses fail to satisfy the SUBAND
              splitStringSUBAND.forEach((compareSUBAND) => {
                if (
                  !this.checkCourses(compareSUBAND, courses, concurrentCourses)
                ) {
                  subandSatisfied = false;
                }
              });

              // If none of the courses failed the SUBAND, then the OR is satisfied
              if (subandSatisfied) {
                orSatisfied = true;
              }
            } else {
              // Check if any of the courses satisfy the OR
              if (this.checkCourses(compareOR, courses, concurrentCourses)) {
                orSatisfied = true;
              }
            }
          }
        });

        // If none of the courses were satisfied in the OR, then return false
        if (!orSatisfied) {
          returnValue = false;

          // Get the OR string that failed and assign it to the failedString
          let combineString = splitStringOR[0];
          splitStringOR.forEach((x, index) => {
            if (index > 0) {
              combineString = combineString + "|" + x;
            }
          });
          failedString = combineString;
        }
      } else {
        // Check if any of the courses fail to satisfy the AND
        // If one course fails the AND, return false
        if (!this.checkCourses(compareAND, courses, concurrentCourses)) {
          returnValue = false;
          failedString = compareAND;
        }
      }
    });

    failedString = this.prettyFailedString(failedString);
    return { returnValue, failedString };
  }

  // Formats the failed string to be more readable
  prettyFailedString(failedString: string): string {
    let updateString = failedString.replace(/-/g, "_");
    updateString = updateString.replace(/,/g, " and ");
    updateString = updateString.replace(/\|/g, " or ");
    updateString = updateString.replace(/&/g, " & ");
    return updateString;
  }

  // Replaces the dashes in each string in strings with an underscore and returns the edited array of strings
  replaceDashesWithUnderscores(strings: string[]): string[] {
    const arr = new Array<string>();

    strings.forEach((x) => {
      arr.push(x.replace(/-/g, "_"));
    });

    return arr;
  }

  // Removes the first character from the given string and returns the edited string
  removeFirstCharacter(cutString: string): string {
    return cutString.substring(1, cutString.length);
  }

  // Removes all duplicate strings from array of strings and returns the array of strings without duplicates
  removeDuplicates(strings: string[]): string[] {
    return strings.filter((value, index, tempArr) => {
      return !tempArr.includes(value, index + 1);
    });
  }

  // Removes an element from courseList if it matches compareString
  // Returns true if a match is found and false otherwise
  findMatch(compareString: string, courseList: string[]): boolean {
    let found = false;

    // Compare each course
    courseList.forEach((course, index) => {
      if (course === compareString) {
        // Remove the course from strings if there's a match
        courseList.splice(index, 1);
        found = true;

        // Exit loop
      }
    });

    return found;
  }

  /* Checks if one of the courses or concurrent courses is equal to the compareString's course
    ex1. compareString='!CS_130' courses=['CS_131'] concurrentCourses=['CS_130']  returns -> true
    ex2. compareString='!CS_100' courses=['CS_100'] concurrentCourses=['CS_120']  returns -> true
    ex3. compareString='!CS_180' courses=['CS_101'] concurrentCourses=['CS_123'] returns -> false
  */
  checkConcurrentCourse(
    compareString: string,
    courses: string[],
    concurrentCourses: string[]
  ): boolean {
    // Remove the exclamation point from the string
    const compare = this.removeFirstCharacter(compareString);

    // Returns if a match occurs between compare and course/concurrentCourses
    return (
      this.findMatch(compare, courses) ||
      this.findMatch(compare, concurrentCourses)
    );
  }

  /* Checks if one of the courses is greater than or equal to the compareString's course
     ex1. compareString='>CS_130' courses=['CS_131','CS_121']  returns -> true
     ex2. compareString='>CS_100' courses=['CS_100','CS_150']  returns -> true
     ex3. compareString='>CS_180' courses=['CS_101','CS_130']  returns -> false
  */
  checkCourseOrGreater(compareString: string, courses: string[]): boolean {
    let found = false;

    // Retrieve the course acronym and number from the string
    const compareAcronym = this.removeFirstCharacter(
      compareString.split("_")[0]
    );
    const compareNumber = parseInt(compareString.split("_")[1]);

    // Compare each course
    courses.forEach((x, index) => {
      const acronym = x.split("_")[0];
      const number = parseInt(x.split("_")[1]);

      // If the course acronyms are the same, return true if the course is greater
      if (acronym === compareAcronym) {
        if (compareNumber <= number) {
          courses.splice(index, 1);
          found = true;

          // Exits loop
        }
      }
    });

    return found;
  }

  // Checks if the courses fit the prereq/requirement compareString
  checkCourses(
    compareString: string,
    courses: string[],
    concurrentCourses: string[]
  ): boolean {
    // If the course can be taken concurrently...
    if (compareString.search(/!/) === 0) {
      // compare it to both courses and concurrent courses
      return this.checkConcurrentCourse(
        compareString,
        courses,
        concurrentCourses
      );
    }

    // If the course number or above could be taken...
    if (compareString.search(/>/) === 0) {
      // compare the course numbers to see if a large enough course number is taken
      return this.checkCourseOrGreater(compareString, courses);
    }

    // Otherwise compare it to just the taken courses
    return this.findMatch(compareString, courses);
  }
}

export default StringProcessing;
