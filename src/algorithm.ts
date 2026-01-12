import type { Patient } from './dataObjects/IPatient'

const algorithm = (() => {
  /**
   *
   * Note:
   * - If systolic and diastolic readings fall into different risk categories,
   * use the higher risk stage for scoring.
   *
   * Normal (Systolic <120 AND Diastolic <80): 0 points
   * Elevated (Systolic 120‑129 AND Diastolic <80): 1 points
   * Stage 1 (Systolic 130‑139 OR Diastolic 80‑89): 2 points
   * Stage 2 (Systolic ≥140 OR Diastolic ≥90): 3 points
   *
   * Invalid data:
   * - Missing systolic or diastolic values (e.g., "150/" or "/90")
   * - Non-numeric values (e.g., "INVALID", "N/A")
   * - Null, undefined, or empty values
   */

  const bloodPressureRisk = (bloodPressure: string) => {
    if (_.isEmpty(bloodPressure) || _.isNil(bloodPressure)) throw new Error('is_invalid')

    const systolic = parseInt(bloodPressure.split('/')[0])
    const diastolic = parseInt(bloodPressure.split('/')[1])
    let bloodPressureRisk = 0

    if (Number.isNaN(systolic)) throw new Error('missing_systolic')
    if (Number.isNaN(diastolic)) throw new Error('missing_diastolic')

    switch (true) {
      case systolic <= 120 && diastolic <= 80:
        bloodPressureRisk = 0
        break
      case systolic >= 120 && systolic <= 129 && diastolic < 80:
        bloodPressureRisk = 1
        break
      case systolic >= 130 && systolic <= 139 && diastolic >= 80 && diastolic <= 89:
        bloodPressureRisk = 2
        break
      case systolic >= 140 && diastolic >= 90:
        bloodPressureRisk = 3
        break
      default:
        bloodPressureRisk = 3
        break
    }
    return bloodPressureRisk
  }

  /**
   *
   * Temperature Risk
   * Normal (≤99.5°F): 0 points
   * Low Fever (99.6-100.9°F): 1 point
   * High Fever (>=101°F): 2 points
   *
   * Invalid data:
   * - Non-numeric values (e.g., "TEMP_ERROR", "invalid")
   * - Null, undefined, or empty values
   */
  const temperatureRisk = (temperature: number) => {
    let temperatureRisk = 0
    if (isValidNumber(temperature)) {
      switch (true) {
        case temperature <= 99.5:
          temperatureRisk = 0
          break
        case temperature >= 99.6 && temperature <= 100.9:
          temperatureRisk = 1
          break
        case temperature >= 101:
          temperatureRisk = 2
      }
    }
    return { temperature: temperature, temperatureRisk: temperatureRisk }
  }

  /**
   *
   * Under 40 (<40 years): 0 points
   * 40-65 (40-65 years, inclusive): 1 point
   * Over 65 (>65 years): 2 points
   *
   * Invalid data:
   * - Non-numeric strings (e.g., "fifty-three", "unknown")
   * - Null, undefined, or empty values
   */
  const ageRisk = (age: number) => {
    let ageRisk = 0
    if (isValidNumber(age)) {
      switch (true) {
        case age < 40:
          ageRisk = 0
          break
        case age >= 40 && age <= 65:
          ageRisk = 1
          break
        case age > 65:
          ageRisk = 2
      }
    }
    return ageRisk
  }

  const isValidNumber = (number: number) => {
    if (!_.isNumber(number)) throw new Error('is_not_number')
    if (number < 1) throw new Error('is_invalid')
    return true
  }

  const checkRiskScore = (patient: Patient) => {
    let tr = {}
    let bpr = 0
    let ar = 0
    let errorCode = ''
    try {
      tr = temperatureRisk(patient.temperature ?? 0)
    } catch (error) {
      tr = { temperature: 0, temperatureRisk: 0 }
      errorCode = `${error}`
    }
    try {
      bpr = bloodPressureRisk(patient.blood_pressure ?? '')
    } catch (error) {
      errorCode = `${error}`
    }
    try {
      ar = ageRisk(patient.age ?? 0)
    } catch (error) {
      errorCode = `${error}`
    }

    const trs = bpr + tr.temperatureRisk + ar
    return {
      patient_id: patient.patient_id,
      hasHighRiskScore: trs >= 4,
      hasFever: tr.temperature >= 99.6,
      errorCode: errorCode,
    }
  }

  return {
    checkRiskScore: function (patient: Patient) {
      if (patient === null) {
        throw new Error('Please provide a valid data object')
      }
      return checkRiskScore(patient)
    },
  }
})()
export default algorithm
