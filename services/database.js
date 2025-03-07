const db = require("./db");
const helper = require("../helper");
const config = require("../config");

async function getDoctorByCredentials(email, password) {
  //passwords should've been stored as hashes, done only for demo
  const query = `SELECT ID, Name, Surname, Email FROM doctors WHERE email = "${email}" AND password = "${password}"`;

  const data = await db.query(query);
  return { data };
}

async function getMultipleDoctors(page = 1) {
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT * 
    FROM doctors LIMIT ${offset},${config.listPerPage}`
  );
  const data = helper.emptyOrRows(rows);
  const meta = { page };

  return {
    data,
    meta,
  };
}

async function getMultiplePatients(page = 1) {
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT *
    FROM patients LIMIT ${offset},${config.listPerPage}`
  );
  const data = helper.emptyOrRows(rows);
  const meta = { page };

  return {
    data,
    meta,
  };
}

async function getMultiplePatientsByID(ID, page = 1) {
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT *
    FROM patients WHERE ID = ${ID.substring(1)} LIMIT ${offset},${
      config.listPerPage
    }`
  );
  const data = helper.emptyOrRows(rows);
  const meta = { page };

  return {
    data,
    meta,
  };
}

async function getMultiplePatientsByDoctorID(ID, page = 1) {
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT *
    FROM patients WHERE doctor = ${ID} LIMIT ${offset},${config.listPerPage}`
  );
  const data = helper.emptyOrRows(rows);
  const meta = { page };

  return {
    data: data.map((object) => helper.lowercaseObjectKeys(object)),
    meta,
  };
}

async function getTeethByPatientID(ID, page = 1) {
  const rows = await db.query(
    `SELECT *
    FROM teeth WHERE patient = ${ID} ORDER by ID desc`
  );
  const data = helper.emptyOrRows(rows);
  const meta = { page };

  return {
    data,
    meta,
  };
}

async function getPhotosByVisitID(ID, page = 1) {
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT *
    FROM photos WHERE visitID = ${ID.substring(0, 1)} LIMIT ${offset},${
      config.listPerPage
    }`
  );
  const data = helper.emptyOrRows(rows);
  const meta = { page };

  return {
    data,
    meta,
  };
}

async function getVisits(ID, page = 1) {
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT *
    FROM visits LIMIT ${offset},${config.listPerPage}`
  );
  const data = helper.emptyOrRows(rows);
  const meta = { page };

  return {
    data,
    meta,
  };
}

async function getVisitsByDoctorID(ID, page = 1) {
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT v.id, v.date, v.duration, v.teeth , p.Name, p.Surname
    FROM visits AS v INNER JOIN patients AS p ON p.id = v.patient WHERE v.doctor = ${ID} LIMIT ${offset},${config.listPerPage}`
  );
  const data = helper.emptyOrRows(rows);
  const meta = { page };

  return {
    data: data.map((item) => helper.lowercaseObjectKeys(item)),
    meta,
  };
}

async function getOperations(page = 1) {
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT *
    FROM operations LIMIT ${offset},${config.listPerPage}`
  );
  const data = helper.emptyOrRows(rows);
  const meta = { page };

  return {
    data,
    meta,
  };
}

async function getOperationsByID(ID, page = 1) {
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT *
    FROM operations where ID = ${ID.substring(1)} LIMIT ${offset},${
      config.listPerPage
    }`
  );
  const data = helper.emptyOrRows(rows);
  const meta = { page };

  return {
    data,
    meta,
  };
}

async function createPatient(patient, doctorId) {
  const result = await db.query(
    `INSERT INTO patients 
    (Name, Surname, Age, Pesel, Birthday, Gender, Doctor) 
    VALUES 
    ("${patient.name}", "${patient.surname}", ${patient.age}, "${patient.pesel}", "${patient.birthday}", "${patient.gender}", ${doctorId})`
  );

  let message = "Error in creating patient";

  if (result.affectedRows) {
    message = "patient created successfully";
  }
  let row = await db.query(`SELECT * from patients order by ID desc LIMIT 1`);

  let patient_id = row[0].ID;
  await db.query(
    `INSERT INTO teeth
    (patient)
    VALUES
    ("${patient_id}")`
  );

  row = await db.query(`SELECT * from teeth order by ID desc LIMIT 1`);

  teeth_id = row[0].ID;
  await db.query(
    `UPDATE patients
    SET TeethLatest = ${teeth_id}
    WHERE ID = ${patient_id}`
  );

  return { message };
}

async function createVisit(visit) {
  row = await db.query(`SELECT * from teeth where patient = ${visit.patient}`);

  const result = await db.query(
    `INSERT INTO visits 
    (patient, doctor, date, duration, teeth) 
    VALUES 
    ("${visit.patient}", ${visit.doctor}, ${visit.date}, ${visit.duration}, ${row[0].ID})`
  );

  let message = "Error in creating visit";

  if (result.affectedRows) {
    message = "Visit created successfully";
  }

  return { message };
}

async function createNewPhoto(filename, visitId) {
  const result = await db.query(
    `INSERT INTO photos (filename, visitID) VALUES ("${filename}", ${visitId})`
  );

  if (result.affectedRows) {
    return { message: "photo created successfully" };
  } else {
    return { message: "shit broke" };
  }
}

async function createNewTeethForPatientByID(ID, patient) {
  row = await db.query(
    `SELECT * from teeth where patient = ${ID.substring(1)} `
  );

  const result = await db.query(
    `INSERT INTO teeth 
    (patient, t1, t2, t3, t4, t5,
      t6, t7, t8, t9, t10,
      t11, t12, t13, t14, t15,
      t16, t17, t18, t19, t20,
      t21, t22, t23, t24, t25,
      t26, t27, t28, t29, t30,
      t31, t32) 
    VALUES 
    ("${patient.ID}, ${row[0].t1}, ${row[0].t2}, ${row[0].t3},
    ${row[0].t4}, ${row[0].t5}, ${row[0].t6},
    ${row[0].t7}, ${row[0].t8}, ${row[0].t9},
    ${row[0].t10}, ${row[0].t11}, ${row[0].t12},
    ${row[0].t13}, ${row[0].t14}, ${row[0].t15},
    ${row[0].t16}, ${row[0].t17}, ${row[0].t18},
    ${row[0].t19}, ${row[0].t20}, ${row[0].t21},
    ${row[0].t22}, ${row[0].t23}, ${row[0].t24},
    ${row[0].t25}, ${row[0].t26}, ${row[0].t27},
    ${row[0].t28}, ${row[0].t29}, ${row[0].t30},
    ${row[0].t31}, ${row[0].t32}")`
  );

  row = await db.query(`SELECT * from teeth order by ID desc LIMIT 1`);

  teeth_id = row[0].ID;
  await db.query(
    `UPDATE patients
    SET teeth = ${teeth_id}
    WHERE ID = ${patient.id}`
  );

  let message = "Error in creating patient";

  if (result.affectedRows) {
    message = "Patient created successfully";
  }

  return { message };
}

async function updatePatient(id, patient) {
  const result = await db.query(
    `UPDATE patients 
    SET Name="${patient.name}", Surname="${patient.surname}", Age="${patient.age}", Pesel="${patient.pesel}",
    Birthday="${patient.birthday}", Gender="${patient.gender}", TeethLatest="${patient.teeth}", 
    Doctor="${patient.doctor}"
    WHERE id=${id}`
  );

  let message = "Error in updating patient data";

  if (result.affectedRows) {
    message = "Patient data updated successfully";
  }

  return { message };
}

async function updateTeeth(id, teeth) {
  const result = await db.query(
    `UPDATE teeth
    SET t1="${teeth.t1}", t2="${teeth.t2}", t3="${teeth.t3}", 
    t4="${teeth.t4}", t5="${teeth.t5}", t6="${teeth.t6}", 
    t7="${teeth.t7}", t8="${teeth.t8}", t9="${teeth.t9}", 
    t10="${teeth.t10}", t11="${teeth.t11}", t12="${teeth.t12}", 
    t13="${teeth.t13}", t14="${teeth.t14}", t15="${teeth.t15}", 
    t16="${teeth.t16}", t17="${teeth.t17}", t18="${teeth.t18}", 
    t19="${teeth.t19}", t20="${teeth.t20}", t21="${teeth.t21}",
    t22="${teeth.t22}", t23="${teeth.t23}", t24="${teeth.t24}",
    t25="${teeth.t25}", t26="${teeth.t26}", t27="${teeth.t27}",  
    t28="${teeth.t28}", t29="${teeth.t29}", t30="${teeth.t30}"
    t31="${teeth.t31}", t32="${teeth.t32}"
    WHERE id=${id}`
  );

  let message = "Error in updating teeth";

  if (result.affectedRows) {
    message = "Teeth updated successfully";
  }

  return { message };
}

async function remove(id) {
  const result = await db.query(`DELETE FROM * WHERE id=${id}`);

  let message = "Error in deleting data";

  if (result.affectedRows) {
    message = "Data deleted successfully";
  }

  return { message };
}

module.exports = {
  getDoctorByCredentials,
  getMultipleDoctors,
  getMultiplePatients,
  getMultiplePatientsByID,
  getMultiplePatientsByDoctorID,
  getTeethByPatientID,
  getPhotosByID: getPhotosByVisitID,
  getVisits,
  getVisitsByDoctorID,
  getOperations,
  getOperationsByID,
  createNewTeethForPatientByID,
  createPatient,
  createNewPhoto,
  createVisit,
  updatePatient,
  updateTeeth,
  remove,
};
