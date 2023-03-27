import StringProcessing from "../entities/StringProcessing";
test("Test String Processing", () => {
  const stringProcess = new StringProcessing();

  // Base & Edge Cases Testing:

  // true -> string compare is blank, so always true
  if (!stringProcess.courseInListCheck("", ["CS-144"], undefined).returnValue) {
    throw new Error("");
  }

  // true -> string compare is null, so always true
  if (
    !stringProcess.courseInListCheck(null, ["CS-144"], undefined).returnValue
  ) {
    throw new Error("");
  }

  // true -> string compare is undefined, so always true
  if (
    !stringProcess.courseInListCheck(undefined, ["CS-144"], undefined)
      .returnValue
  ) {
    throw new Error("");
  }

  // false -> course array is empty, so cannot be satisfied
  if (stringProcess.courseInListCheck("CS-144", [], undefined).returnValue) {
    throw new Error("");
  }

  // false -> course array is null, so cannot be satisfied
  if (stringProcess.courseInListCheck("CS-144", null, undefined).returnValue) {
    throw new Error("");
  }

  // false -> course array is undefined, so cannot be satisfied
  if (
    stringProcess.courseInListCheck("CS-144", undefined, undefined).returnValue
  ) {
    throw new Error("");
  }

  // true -> one course comparison matches
  if (
    !stringProcess.courseInListCheck("CS-144", ["CS-144"], undefined)
      .returnValue
  ) {
    throw new Error("");
  }

  // false -> one course comparison not matches
  if (
    stringProcess.courseInListCheck("CS-144", ["CS-145"], undefined).returnValue
  ) {
    throw new Error("");
  }

  // false -> one course missing from AND
  if (
    stringProcess.courseInListCheck(
      "CS-144,CS-145",
      ["CS-144", "CS-146"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // true -> both courses match AND
  if (
    !stringProcess.courseInListCheck(
      "CS-144,CS-145",
      ["CS-144", "CS-145"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // false -> one course missing from AND
  if (
    stringProcess.courseInListCheck(
      "CS-144,CS-145",
      ["CS-144", "CS-146"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // true -> one course matches OR
  if (
    !stringProcess.courseInListCheck(
      "CS-144|CS-145",
      ["CS-144", "CS-147"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // true -> other course matches OR
  if (
    !stringProcess.courseInListCheck(
      "CS-144|CS-145",
      ["CS-145", "CS-147"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // true -> both courses matches OR
  if (
    !stringProcess.courseInListCheck(
      "CS-144|CS-145",
      ["CS-144", "CS-145"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // false -> no courses match OR
  if (
    stringProcess.courseInListCheck(
      "CS-144|CS-145",
      ["CS-148", "CS-142"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // true -> both courses match SUBAND
  if (
    !stringProcess.courseInListCheck(
      "CS-144&CS-145",
      ["CS-144", "CS-145"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // false -> one course missing from SUBAND
  if (
    stringProcess.courseInListCheck(
      "CS-144&CS-145",
      ["CS-144", "CS-146"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // false -> garbage put in for course compare
  if (
    stringProcess.courseInListCheck(
      "gibberish",
      ["CS-144", "CS-146"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // false -> garbage put in for course compare
  if (
    stringProcess.courseInListCheck("CS-144", ["garbage", "icky"], undefined)
      .returnValue
  ) {
    throw new Error("");
  }

  // true -> garbage put in for one course, but rest match
  if (
    !stringProcess.courseInListCheck(
      "CS-144,CS-145",
      ["CS_144", "garbage", "CS-145", "icky"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // true -> compare if string has a - or _ in it, still compares correctly
  if (
    !stringProcess.courseInListCheck(
      "CS-144,CS_145,CS-146",
      ["CS_144", "CS-145", "CS_146"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // true -> one course is taken concurrently
  if (
    !stringProcess.courseInListCheck(
      "!CS-144,CS-130",
      ["CS-130", "CS-180"],
      ["CS-144"]
    ).returnValue
  ) {
    throw new Error("");
  }

  // false -> one course is not taken currently nor concurrently
  if (
    stringProcess.courseInListCheck(
      "!CS-144,CS-130",
      ["CS-130", "CS-180"],
      ["CS-145"]
    ).returnValue
  ) {
    throw new Error("");
  }

  // true -> checking for dash and underline difference in concurrent courses
  if (
    !stringProcess.courseInListCheck(
      "!CS-144,CS-130",
      ["CS-130", "CS-180"],
      ["CS_144"]
    ).returnValue
  ) {
    throw new Error("");
  }

  // true -> checking for OR course taken concurrently
  if (
    !stringProcess.courseInListCheck(
      "!CS-144|CS-130",
      ["CS-129", "CS-180"],
      ["CS-144"]
    ).returnValue
  ) {
    throw new Error("");
  }

  // true -> checking for SUBAND course taken concurrently
  if (
    !stringProcess.courseInListCheck(
      "!CS-144&CS-130",
      ["CS-130", "CS-180"],
      ["CS-144"]
    ).returnValue
  ) {
    throw new Error("");
  }

  // false -> SUBAND course is taken concurrently but not both
  if (
    stringProcess.courseInListCheck(
      "!CS-144&CS-130",
      ["CS-129", "CS-180"],
      ["CS-144"]
    ).returnValue
  ) {
    throw new Error("");
  }

  // true -> both courses are taken concurrently
  if (
    !stringProcess.courseInListCheck(
      "!CS-144,!CS-130",
      ["CS-129", "CS-180"],
      ["CS-144", "CS_130"]
    ).returnValue
  ) {
    throw new Error("");
  }

  // true -> one of the two courses are taken concurrently
  if (
    !stringProcess.courseInListCheck(
      "!CS-144|!CS-130",
      ["CS-129", "CS-180"],
      ["CS-145", "CS_130"]
    ).returnValue
  ) {
    throw new Error("");
  }

  // true -> real example with concurrent taken course
  if (
    !stringProcess.courseInListCheck(
      "!BIO_332|CHEM_311|CS_244",
      ["CS-244", "CHEM-311"],
      ["BIO-332"]
    ).returnValue
  ) {
    throw new Error("");
  }

  // true -> check all courses in SUBANDs are satisfied
  if (
    !stringProcess.courseInListCheck(
      "CS-100&CS_101&CS-102",
      ["CS-102", "CS-101", "CS-100"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // true -> course above minimum is taken
  if (
    !stringProcess.courseInListCheck(">CS-101", ["CS-102"], undefined)
      .returnValue
  ) {
    throw new Error("");
  }

  // false -> course above minimum is not taken
  if (
    stringProcess.courseInListCheck(">CS-101", ["CS-100"], undefined)
      .returnValue
  ) {
    throw new Error("");
  }

  // true -> course above minimum is taken with an AND
  if (
    !stringProcess.courseInListCheck(
      "CS-101,>CS-102",
      ["CS-100", "CS-101", "CS-103"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // true -> course above minimum is taken with an OR
  if (
    !stringProcess.courseInListCheck(
      "CS-101|>MSCS-102",
      ["MSCS-100", "CS-101", "MSCS-103"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // false -> course above minimum is not taken with an OR
  if (
    stringProcess.courseInListCheck(
      "CS-103|>MSCS-102",
      ["MSCS-100", "CS-101", "MSCS-101"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // true -> concrete course above minimum is taken with an OR
  if (
    !stringProcess.courseInListCheck(
      "CS-101|>MSCS-102",
      ["MSCS-100", "CS-101", "MSCS-102"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // false -> duplicate entry means course above minimum is false
  if (
    stringProcess.courseInListCheck(
      "CS-101,>CS100",
      ["CS-101", "CS-101", "CS-101"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // false -> duplicate entry means course above minimum is false (with an &)
  if (
    stringProcess.courseInListCheck(
      "CS-101&>CS100",
      ["CS-101", "CS-101", "CS-101"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // REAL EXAMPLES:

  /* GDD450 Prerequisites */

  // true (SUBAND is satisfied)
  if (
    !stringProcess.courseInListCheck(
      "GDD_325,CS-326&CS_358|DES-350",
      ["GDD_101", "CS-358", "CS-134", "CS_123", "GDD_325", "DES-349", "CS-326"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // false (SUBAND not satisfied)
  if (
    stringProcess.courseInListCheck(
      "GDD_325,CS-326&CS_358|DES-350",
      ["GDD_101", "CS-134", "CS_123", "GDD_325", "DES-349", "CS-326", "CS-369"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // true (SUBAND not satisfied; OR satisfied)
  if (
    !stringProcess.courseInListCheck(
      "GDD_325,CS-326&CS_358|DES-350",
      ["GDD_101", "CS-134", "CS_123", "GDD_325", "DES-350", "CS-326", "CS-369"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // false (SUBAND satisfied; AND not satisfied)
  if (
    stringProcess.courseInListCheck(
      "GDD_325,CS-326&CS_358|DES-350",
      ["CS-326", "GDD_101", "CS-134", "CS_123", "DES-349", "CS-358"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // false (OR satisfied; AND not satisfied)
  if (
    stringProcess.courseInListCheck(
      "GDD_325,CS-326&CS_358|DES-350",
      ["GDD_101", "CS-134", "CS_123", "DES-350", "CS-358"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // true (AND satisifed; OR satisfied; SUBAND satisfied)
  if (
    !stringProcess.courseInListCheck(
      "GDD_325,CS-326&CS_358|DES-350",
      ["GDD_325", "GDD_101", "CS-326", "CS-134", "CS_123", "DES-350", "CS-358"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  /* Long psychology requirements */

  // true (all courses are taken)
  if (
    !stringProcess.courseInListCheck(
      "PSYC-100,PSYC-110,PSYC-190,PSYC-233,PSYC-242,PSYC-251,PSYC-270,PSYC-290,PSYC-300,PSYC-320,PSYC-350,PSYC-490",
      [
        "PSYC-100",
        "PSYC-110",
        "PSYC-190",
        "PSYC-233",
        "PSYC-242",
        "PSYC-251",
        "PSYC-270",
        "PSYC-290",
        "PSYC-300",
        "PSYC-320",
        "PSYC-350",
        "PSYC-490"
      ],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // true (all courses are taken, but in a different order as above test)
  if (
    !stringProcess.courseInListCheck(
      "PSYC-100,PSYC-110,PSYC-190,PSYC-233,PSYC-242,PSYC-251,PSYC-270,PSYC-290,PSYC-300,PSYC-320,PSYC-350,PSYC-490",
      [
        "PSYC-110",
        "PSYC-270",
        "PSYC-190",
        "PSYC-233",
        "PSYC-490",
        "PSYC-350",
        "PSYC-242",
        "PSYC-100",
        "PSYC-251",
        "PSYC-290",
        "PSYC-320",
        "PSYC-300"
      ],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // false (one course is missing)
  if (
    stringProcess.courseInListCheck(
      "PSYC-100,PSYC-110,PSYC-190,PSYC-233,PSYC-242,PSYC-251,PSYC-270,PSYC-290,PSYC-300,PSYC-320,PSYC-350,PSYC-490",
      [
        "PSYC-110",
        "PSYC-270",
        "PSYC-190",
        "PSYC-490",
        "PSYC-350",
        "PSYC-242",
        "PSYC-100",
        "PSYC-251",
        "PSYC-290",
        "PSYC-320",
        "PSYC-300"
      ],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // false (many courses are missing)
  if (
    stringProcess.courseInListCheck(
      "PSYC-100,PSYC-110,PSYC-190,PSYC-233,PSYC-242,PSYC-251,PSYC-270,PSYC-290,PSYC-300,PSYC-320,PSYC-350,PSYC-490",
      [
        "PSYC-110",
        "PSYC-242",
        "PSYC-100",
        "PSYC-251",
        "PSYC-290",
        "PSYC-320",
        "PSYC-300"
      ],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // true (all course are present in OR)
  if (
    !stringProcess.courseInListCheck(
      "PSYC-121|PSYC-225|PSYC-280|PSYC-333|PSYC-355|PSYC-370|PSYC-371|PSYC-377|PSYC-381|PSYC-382|PSYC-291",
      [
        "PSYC-121",
        "PSYC-225",
        "PSYC-280",
        "PSYC-333",
        "PSYC-355",
        "PSYC-370",
        "PSYC-371",
        "PSYC-377",
        "PSYC-381",
        "PSYC-382",
        "PSYC-291"
      ],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // true (one course is present in OR)
  if (
    !stringProcess.courseInListCheck(
      "PSYC-121|PSYC-225|PSYC-280|PSYC-333|PSYC-355|PSYC-370|PSYC-371|PSYC-377|PSYC-381|PSYC-382|PSYC-291",
      ["PSYC-371"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // true (another one course is present in OR)
  if (
    !stringProcess.courseInListCheck(
      "PSYC-121|PSYC-225|PSYC-280|PSYC-333|PSYC-355|PSYC-370|PSYC-371|PSYC-377|PSYC-381|PSYC-382|PSYC-291",
      ["PSYC-382"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // true (two long ORs joined by an AND)
  if (
    !stringProcess.courseInListCheck(
      "PSYC-121|PSYC-225|PSYC-280|PSYC-333|PSYC-355,PSYC-370|PSYC-371|PSYC-377|PSYC-381|PSYC-382|PSYC-291",
      ["PSYC-377", "PSYC_280"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // false (two long ORs joined by an AND, but one of the ANDs is false)
  if (
    stringProcess.courseInListCheck(
      "PSYC-121|PSYC-225|PSYC-280|PSYC-333|PSYC-355,PSYC-370|PSYC-371|PSYC-377|PSYC-381|PSYC-382|PSYC-291",
      ["PSYC-377", "PSYC_283"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // true (another one course is present in OR; all are concurrent)
  if (
    !stringProcess.courseInListCheck(
      "!PSYC-121|!PSYC-225|!PSYC-280|!PSYC-333|!PSYC-355|!PSYC-370|!PSYC-371|!PSYC-377|!PSYC-381|!PSYC-382|!PSYC-291",
      ["PSYC-382"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // true (two long ORs joined by an AND; all are concurrent)
  if (
    !stringProcess.courseInListCheck(
      "!PSYC-121|!PSYC-225|!PSYC-280|!PSYC-333|!PSYC-355,!PSYC-370|!PSYC-371|!PSYC-377|!PSYC-381|!PSYC-382|!PSYC-291",
      ["PSYC-377", "PSYC-333"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  /* Strings with greater than specific courses */

  // true (all 'concrete' courses are taken)
  if (
    !stringProcess.courseInListCheck(
      "MATH-154|MATH-157,MATH-270,MATH-275,MATH-158|>MSCS-200|>STAT-300",
      ["MATH-270", "MATH-157", "MATH-275", "MATH-158"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // true (a greater than course is taken)
  if (
    !stringProcess.courseInListCheck(
      "MATH-154|MATH-157,MATH-270,MATH-275,MATH-158|>MSCS-200|>STAT-300",
      ["MATH-270", "MATH-157", "MATH-275", "MSCS-209"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // true (a greater than course is taken)
  if (
    !stringProcess.courseInListCheck(
      "MATH-154|MATH-157,MATH-270,MATH-275,MATH-158|>MSCS-200|>STAT-300",
      ["MATH-270", "MATH-157", "MATH-275", "STAT-300"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // false (no greater than courses are taken)
  if (
    stringProcess.courseInListCheck(
      "MATH-154|MATH-157,MATH-270,MATH-275,MATH-158|>MSCS-200|>STAT-300",
      ["MATH-270", "MATH-157", "MATH-275", "MSCS-170", "STAT-201"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // true (no greater than courses are taken but concurrent course is taken)
  if (
    !stringProcess.courseInListCheck(
      "MATH-154|MATH-157,MATH-270,MATH-275,!MATH-158|>MSCS-200|>STAT-300",
      ["MATH-270", "MATH-157", "MATH-275", "MSCS-170", "STAT-201"],
      ["MATH-158"]
    ).returnValue
  ) {
    throw new Error("");
  }

  // true (concrete course is taken)
  if (
    !stringProcess.courseInListCheck(
      "NANO_230|>CHEM_200|>PHYS_281",
      ["MATH-270", "NANO-230"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // true (greater than course is taken)
  if (
    !stringProcess.courseInListCheck(
      "NANO_230|>CHEM_200|>PHYS_281",
      ["MATH-270", "PHYS-290", "NANO-229"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // true (another greater than course is taken)
  if (
    !stringProcess.courseInListCheck(
      "NANO_230|>CHEM_200|>PHYS_281",
      ["MATH-270", "CHEM-200", "NANO-229"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // false (no greater than course or concrete course is taken)
  if (
    stringProcess.courseInListCheck(
      "NANO_230|>CHEM_200|>PHYS_281",
      ["MATH-270", "PHYS-280", "NANO-229"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // true (all greater than courses are taken)
  if (
    !stringProcess.courseInListCheck(
      "NANO_230,>CHEM_200,>PHYS_281",
      ["PHYS-290", "NANO-230", "CHEM-199", "CHEM-201"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }

  // false (not all greater than courses are taken)
  if (
    stringProcess.courseInListCheck(
      "NANO_230,>CHEM_200,>PHYS_281",
      ["PHYS-290", "NANO-230", "CHEM-199", "CHEM-198"],
      undefined
    ).returnValue
  ) {
    throw new Error("");
  }
});

test("Additional Checking", () => {
  const stringProcess = new StringProcessing();
  expect(
    stringProcess.courseInListCheck(
      "CS_244,CS_248|CS_324",
      [],
      ["CS-145", "CS-144", "CS-358", "CNIT-133"]
    ).failedString
  ).toBe("CS-244 and CS-248 or CS-324");
  // TODO: Fix failedString to return the correct pre-req string
  // expect(
  //   stringProcess.courseInListCheck(
  //     "CS_244,CS_248|CS_324",
  //     ["CS-141"],
  //     ["CS-145", "CS-144", "CS-358", "CNIT-133"]
  //   ).failedString
  // ).toBe("CS-244 and CS-248 or CS-324");
});
