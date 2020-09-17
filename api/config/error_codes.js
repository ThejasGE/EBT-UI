module.exports = {
  unchecked_ex: { code:"AD-UN-001", message:"Unexpected error"},
  authentication: {
    failed: {code:"AD-AUTH-001", message:"Authentication Failed"},
    token_missing: {code:"AD-AUTH-002", message:"Authotization Token Missing"},
    subdomain_access_denied: {code:"AD-AUTH-003", message:"Access to requested subdomain is denied"},
    building_access_denied: {code:"AD-AUTH-004", message:"Access to requested building is denied"},
    floor_access_denied: {code:"AD-AUTH-005", message:"Access to requested floor is denied"},
    section_access_denied: {code:"AD-AUTH-006", message:"Access to requested section is denied"},
    sensor_access_denied: {code:"AD-AUTH-007", message:"Access to requested sensor is denied"}
  },
  building: {
    fetch_failed: {code: "AD-BLDG-001", message: "Failed to fetch buildings"}
  },
  devices: {
    fetch_failed: {code: "AD-DEV-001", message: "Failed to fetch devices"}
  },
  sections: {
    fetch_failed: {code: "AD-SEC-001", message: "Failed to fetch sections"}
  },
  floors: {
    fetch_failed: {code: "AD-FLR-001", message: "Failed to fetch Floors"}
  },
  sensors: {
    fetch_failed: {code: "AD-SEN-001", message: "Failed to fetch sensors"}
  },
  sensor_datas: {
    fetch_failed: {code: "AD-SEN-DATA-001", message: "Failed to fetch sensor-datas"}
  }
}
